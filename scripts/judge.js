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
If there are any security or performance issues that would fail a strict review, output a JSON object with "pass": false and a "reasons" array.
If the codebase is secure and performant, output a JSON object with "pass": true and a "reasons" array explaining why.
Return ONLY valid JSON. No markdown formatting around the JSON, just the JSON string itself.

Codebase:
${codebaseContent}
`;

    console.log("Sending codebase to Gemini API for evaluation...");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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

        if (result.pass) {
            console.log("\n✅ Codebase PASSED the security and performance review!");
            console.log("Reasons:", result.reasons);
            process.exit(0);
        } else {
            console.error("\n❌ Codebase FAILED the security and performance review.");
            console.error("Issues found:", JSON.stringify(result.reasons, null, 2));
            process.exit(1);
        }

    } catch (e) {
        console.error("Error communicating with Gemini API:", e.message);
        process.exit(1);
    }
}

run();
