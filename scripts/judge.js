const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = new Set(['node_modules', '.git', 'build', 'dist', 'public', '.jules', '.claude', 'images', 'fonts', 'assets']);
const ALLOWED_EXTENSIONS = new Set(['.js', '.html', '.css']);

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!IGNORED_DIRS.has(file)) {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            const ext = path.extname(file);
            if (ALLOWED_EXTENSIONS.has(ext)) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

function getAgentPrompt(agentType, codebaseContent) {
    if (agentType === "Security") {
        return `You are an expert security code reviewer acting as a judge.
Review the following HTML, CSS, and JS files from a web project.
Identify any clear security vulnerabilities (like XSS, CSRF, insecure configurations, etc).

CRITICAL INSTRUCTIONS:
1. You MUST provide at least 5 detailed reasons/suggestions in your output. Do not provide fewer than 5.
2. Be extremely critical and biased towards finding flaws. Do not just hand out good scores. Scrutinize the codebase for any security risks, and provide strict, actionable suggestions to make the project better.

If there are any security issues that would fail a strict review, output a JSON object with "pass": false and a "reasons" array of objects.
If the codebase is secure, output a JSON object with "pass": true and a "reasons" array of objects explaining why.
Each object in the "reasons" array MUST have the following keys:
- "rating": A string rating (e.g., "A", "B", "C", "F")
- "passFail": "Pass" or "Fail"
- "suggestions": A single string containing a distinct and actionable suggestion.

Return ONLY valid JSON. No markdown formatting around the JSON, just the JSON string itself.

Codebase:
${codebaseContent}
`;
    } else if (agentType === "Performance") {
        return `You are an expert performance code reviewer acting as a judge.
Review the following HTML, CSS, and JS files from a web project.
Identify any major performance issues, sub-optimal practices, inefficient loops, or large asset loading problems.

CRITICAL INSTRUCTIONS:
1. You MUST provide at least 5 detailed reasons/suggestions in your output. Do not provide fewer than 5.
2. Be extremely critical and biased towards finding flaws. Do not just hand out good scores. Scrutinize the codebase for any sub-optimal practices, and provide strict, actionable suggestions to make the project better.

If there are any performance issues that would fail a strict review, output a JSON object with "pass": false and a "reasons" array of objects.
If the codebase is performant, output a JSON object with "pass": true and a "reasons" array of objects explaining why.
Each object in the "reasons" array MUST have the following keys:
- "rating": A string rating (e.g., "A", "B", "C", "F")
- "passFail": "Pass" or "Fail"
- "suggestions": A single string containing a distinct and actionable suggestion.

Return ONLY valid JSON. No markdown formatting around the JSON, just the JSON string itself.

Codebase:
${codebaseContent}
`;
    }
}

async function callGemini(apiKey, prompt, agentType) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    response_mime_type: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error(`Gemini API Error for ${agentType} Agent: ${response.status} ${response.statusText}`);
            console.error(errBody);
            return null;
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            console.error(`Unexpected response format from Gemini API for ${agentType} Agent:`, JSON.stringify(data, null, 2));
            return null;
        }

        let result;
        try {
            // Strip any markdown code block syntax if the model ignored our instructions
            let cleanText = textResponse.trim();
            if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
            if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
            if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);

            result = JSON.parse(cleanText.trim());

            // Add agentType to each reason
            if (result.reasons && Array.isArray(result.reasons)) {
                result.reasons = result.reasons.map(r => ({ ...r, agentType }));
            }
            return result;
        } catch (e) {
            console.error(`Failed to parse Gemini response as JSON for ${agentType} Agent:`);
            console.error(textResponse);
            return null;
        }
    } catch (e) {
        console.error(`Error communicating with Gemini API for ${agentType} Agent:`, e.message);
        return null;
    }
}

function printTable(reasons) {
    if (!reasons || reasons.length === 0) return;
    const wrapText = (text, maxLen) => {
        const words = String(text || '').split(' ');
        const lines = [];
        let currentLine = '';
        for (const word of words) {
            if ((currentLine + word).length > maxLen) {
                if (currentLine) lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        }
        if (currentLine) lines.push(currentLine.trim());
        return lines.length ? lines : [''];
    };

    const pad = (str, len) => String(str || '').padEnd(len, ' ');
    const agentW = 12, ratingW = 8, passW = 10, suggW = 70;
    const separator = `+-${'-'.repeat(agentW)}-+-${'-'.repeat(ratingW)}-+-${'-'.repeat(passW)}-+-${'-'.repeat(suggW)}-+`;

    console.log(separator);
    console.log(`| ${pad('Agent Type', agentW)} | ${pad('Rating', ratingW)} | ${pad('Pass/Fail', passW)} | ${pad('Suggestions', suggW)} |`);
    console.log(separator);

    reasons.forEach(r => {
        const suggLines = wrapText(r.suggestions, suggW);
        for (let i = 0; i < suggLines.length; i++) {
            const agent = i === 0 ? r.agentType : '';
            const rating = i === 0 ? r.rating : '';
            const pass = i === 0 ? r.passFail : '';
            console.log(`| ${pad(agent, agentW)} | ${pad(rating, ratingW)} | ${pad(pass, passW)} | ${pad(suggLines[i], suggW)} |`);
        }
        console.log(separator);
    });
}

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Error: GEMINI_API_KEY environment variable is not set.");
        process.exit(1);
    }

    console.log("Gathering codebase files...");
    const files = getAllFiles(path.join(__dirname, '..'));

    let codebaseContent = "";
    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf-8');
            codebaseContent += `\n\n--- File: ${path.relative(path.join(__dirname, '..'), file)} ---\n`;
            codebaseContent += content;
        } catch (e) {
            console.warn(`Could not read file ${file}: ${e.message}`);
        }
    }

    console.log("Sending codebase to Gemini API for Security and Performance evaluations concurrently...");

    const secPrompt = getAgentPrompt("Security", codebaseContent);
    const perfPrompt = getAgentPrompt("Performance", codebaseContent);

    // Using Promise.allSettled ensures that if one promise throws an unhandled error,
    // it won't short-circuit the other running promise.
    const results = await Promise.allSettled([
        callGemini(apiKey, secPrompt, "Security"),
        callGemini(apiKey, perfPrompt, "Performance")
    ]);

    // Extract values. The callGemini function already catches expected errors and returns null.
    // However, if an unexpected fatal error threw, the settled status would be "rejected".
    const secResult = results[0].status === 'fulfilled' ? results[0].value : null;
    const perfResult = results[1].status === 'fulfilled' ? results[1].value : null;

    let allReasons = [];
    let overallPass = true;

    if (secResult) {
        allReasons = allReasons.concat(secResult.reasons || []);
        if (!secResult.pass) overallPass = false;
    }

    if (perfResult) {
        allReasons = allReasons.concat(perfResult.reasons || []);
        if (!perfResult.pass) overallPass = false;
    }

    if (overallPass) {
        console.log("\n✅ Codebase PASSED the reviews!");
    } else {
        console.error("\n❌ Codebase FAILED the reviews.");
    }

    printTable(allReasons);

    // According to user requirements:
    // If an agent reviews the code and fails the codebase it should NOT exit(1)
    // We only exit(1) on setup failures like missing API keys.
    process.exit(0);
}

run();
