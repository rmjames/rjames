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

    const prompt = `You are an expert security and performance code reviewer acting as a judge.
Review the following HTML, CSS, and JS files from a web project.
Identify any clear security vulnerabilities (like XSS, CSRF, insecure configurations) or major performance issues.

CRITICAL INSTRUCTIONS:
1. You MUST provide at least 5 detailed reasons/suggestions in your output. Do not provide fewer than 5.
2. Be extremely critical and biased towards finding flaws. Do not just hand out good scores. Scrutinize the codebase for any sub-optimal practices, and provide strict, actionable suggestions to make the project better.

If there are any security or performance issues that would fail a strict review, output a JSON object with "pass": false and a "reasons" array of objects.
If the codebase is secure and performant, output a JSON object with "pass": true and a "reasons" array of objects explaining why.
Each object in the "reasons" array MUST have the following keys:
- "secRating": A string rating (e.g., "A", "B", "C", "F")
- "perfRating": A string rating (e.g., "A", "B", "C", "F")
- "passFail": "Pass" or "Fail"
- "suggestions": A single string containing a distinct and actionable suggestion.

Return ONLY valid JSON. No markdown formatting around the JSON, just the JSON string itself.

Codebase:
${codebaseContent}
`;

    console.log("Sending codebase to Gemini API for evaluation...");

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
            console.error(`Gemini API Error: ${response.status} ${response.statusText}`);
            console.error(errBody);
            process.exit(1);
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            console.error("Unexpected response format from Gemini API:", JSON.stringify(data, null, 2));
            process.exit(1);
        }

        let result;
        try {
            // Strip any markdown code block syntax if the model ignored our instructions
            let cleanText = textResponse.trim();
            if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
            if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
            if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);

            result = JSON.parse(cleanText.trim());
        } catch (e) {
            console.error("Failed to parse Gemini response as JSON:");
            console.error(textResponse);
            process.exit(1);
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
            const secW = 10, perfW = 11, passW = 10, suggW = 60;
            const separator = `+-${'-'.repeat(secW)}-+-${'-'.repeat(perfW)}-+-${'-'.repeat(passW)}-+-${'-'.repeat(suggW)}-+`;
            
            console.log(separator);
            console.log(`| ${pad('secRating', secW)} | ${pad('perfRating', perfW)} | ${pad('passFail', passW)} | ${pad('suggestions', suggW)} |`);
            console.log(separator);

            reasons.forEach(r => {
                const suggLines = wrapText(r.suggestions, suggW);
                for (let i = 0; i < suggLines.length; i++) {
                    const sec = i === 0 ? r.secRating : '';
                    const perf = i === 0 ? r.perfRating : '';
                    const pass = i === 0 ? r.passFail : '';
                    console.log(`| ${pad(sec, secW)} | ${pad(perf, perfW)} | ${pad(pass, passW)} | ${pad(suggLines[i], suggW)} |`);
                }
                console.log(separator);
            });
        }

        if (result.pass) {
            console.log("\n✅ Codebase PASSED the security and performance review!");
            printTable(result.reasons);
            process.exit(0);
        } else {
            console.error("\n❌ Codebase FAILED the security and performance review.");
            printTable(result.reasons);
            process.exit(1);
        }

    } catch (e) {
        console.error("Error communicating with Gemini API:", e.message);
        process.exit(1);
    }
}

run();
