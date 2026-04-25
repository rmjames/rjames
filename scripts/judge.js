const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = new Set(['node_modules', '.git', 'build', 'dist', 'public', '.jules', '.claude', 'images', 'fonts', 'assets']);
const ALLOWED_EXTENSIONS = new Set(['.js', '.html', '.css']);
const TASKS_FILE = path.join(__dirname, '..', 'tasks.md');

function loadTasks() {
    if (!fs.existsSync(TASKS_FILE)) return [];
    try {
        const content = fs.readFileSync(TASKS_FILE, 'utf-8');
        const tasks = [];
        const sections = content.split('##').slice(1);

        sections.forEach(section => {
            const lines = section.split('\n');
            const status = lines[0].includes('[x]') ? 'Resolved' : 'Open';
            lines.slice(1).forEach(line => {
                // Regex to match the task format
                const match = line.match(/- \[([ x])\] \*\*(SEC|PERF)-(\w+)\*\*: (.*?) \(File: (.*?), Line: (.*?)\)/);
                if (match) {
                    tasks.push({
                        status: match[1] === 'x' ? 'Resolved' : 'Open',
                        id: `${match[2]}-${match[3]}`,
                        suggestions: match[4],
                        file: match[5],
                        line: match[6],
                        agentType: match[2] === 'SEC' ? 'Security' : 'Performance'
                    });
                }
            });
        });
        return tasks;
    } catch (e) {
        console.error("Error loading tasks.md:", e.message);
        return [];
    }
}

function saveTasks(tasks) {
    let content = "# Project Analysis Tasks\n\n";
    const open = tasks.filter(t => t.status === 'Open');
    const resolved = tasks.filter(t => t.status === 'Resolved');

    content += "## [ ] Open Tasks\n";
    open.forEach(t => {
        const prefix = t.agentType === 'Security' ? 'SEC' : 'PERF';
        const idPart = t.id.includes('-') ? t.id.split('-')[1] : t.id;
        content += `- [ ] **${prefix}-${idPart}**: ${t.suggestions} (File: ${t.file}, Line: ${t.line})\n`;
    });

    content += "\n## [x] Resolved Tasks\n";
    resolved.forEach(t => {
        const prefix = t.agentType === 'Security' ? 'SEC' : 'PERF';
        const idPart = t.id.includes('-') ? t.id.split('-')[1] : t.id;
        content += `- [x] **${prefix}-${idPart}**: ${t.suggestions} (File: ${t.file}, Line: ${t.line})\n`;
    });

    fs.writeFileSync(TASKS_FILE, content);
    console.log(`\n✅ Updated ${TASKS_FILE}`);
}

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

function getAgentPrompt(agentType, codebaseContent, existingTasks = []) {
    const openTasks = existingTasks.filter(t => t.agentType === agentType && t.status === 'Open');
    const taskContext = openTasks.length > 0
        ? `\nKNOWN ISSUES (Do not repeat these unless providing new critical context):\n${openTasks.map(t => `- ${t.suggestions} (File: ${t.file})`).join('\n')}\n`
        : "";

    if (agentType === "Security") {
        return `You are an expert security code reviewer acting as a judge.
Review the following HTML, CSS, and JS files from a web project.
Identify any clear security vulnerabilities (like XSS, CSRF, insecure configurations, etc).
${taskContext}
CRITICAL INSTRUCTIONS:
1. You MUST provide at least 5 detailed reasons/suggestions in your output.
2. For each issue, specify the exact FILE and approximate LINE NUMBER.
3. For each issue, provide a "suggestedFix" which includes a code example or specific implementation step.
4. Be extremely critical and biased towards finding flaws. Scrutinize the codebase for any security risks.

If there are any security issues that would fail a strict review, output a JSON object with "pass": false and a "reasons" array of objects.
If the codebase is secure, output a JSON object with "pass": true and a "reasons" array of objects explaining why.
Each object in the "reasons" array MUST have the following keys:
- "rating": A string rating (e.g., "A", "B", "C", "F")
- "passFail": "Pass" or "Fail"
- "suggestions": A single string containing a distinct and actionable description of the issue.
- "file": The relative path of the file where the issue exists.
- "line": The line number where the issue exists.
- "suggestedFix": A detailed fix with code examples and explanation.

Return ONLY valid JSON.

Codebase:
${codebaseContent}
`;
    } else if (agentType === "Performance") {
        return `You are an expert performance code reviewer acting as a judge.
Review the following HTML, CSS, and JS files from a web project.
Identify any major performance issues, sub-optimal practices, or inefficient code.
${taskContext}
CRITICAL INSTRUCTIONS:
1. You MUST provide at least 5 detailed reasons/suggestions in your output.
2. For each issue, specify the exact FILE and approximate LINE NUMBER.
3. For each issue, provide a "suggestedFix" which includes a code example or specific implementation step.
4. Be extremely critical.

If there are any performance issues that would fail a strict review, output a JSON object with "pass": false and a "reasons" array of objects.
If the codebase is performant, output a JSON object with "pass": true and a "reasons" array of objects explaining why.
Each object in the "reasons" array MUST have the following keys:
- "rating": A string rating (e.g., "A", "B", "C", "F")
- "passFail": "Pass" or "Fail"
- "suggestions": A single string containing a distinct and actionable description of the issue.
- "file": The relative path of the file where the issue exists.
- "line": The line number where the issue exists.
- "suggestedFix": A detailed fix with code examples and explanation.

Return ONLY valid JSON.

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
            let cleanText = textResponse.trim();
            if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
            if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
            if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);

            result = JSON.parse(cleanText.trim());

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
    const agentW = 10, locW = 25, ratingW = 6, passW = 8, suggW = 50, fixW = 60;
    const separator = `+-${'-'.repeat(agentW)}-+-${'-'.repeat(locW)}-+-${'-'.repeat(ratingW)}-+-${'-'.repeat(passW)}-+-${'-'.repeat(suggW)}-+-${'-'.repeat(fixW)}-+`;

    console.log(separator);
    console.log(`| ${pad('Agent', agentW)} | ${pad('Location', locW)} | ${pad('Rate', ratingW)} | ${pad('Status', passW)} | ${pad('Issue', suggW)} | ${pad('Suggested Fix', fixW)} |`);
    console.log(separator);

    reasons.forEach(r => {
        const loc = `${r.file}:${r.line}`;
        const suggLines = wrapText(r.suggestions, suggW);
        const fixLines = wrapText(r.suggestedFix, fixW);
        const maxLines = Math.max(suggLines.length, fixLines.length);

        for (let i = 0; i < maxLines; i++) {
            const agent = i === 0 ? r.agentType.substring(0, 3) : '';
            const location = i === 0 ? loc.substring(0, locW) : '';
            const rating = i === 0 ? r.rating : '';
            const pass = i === 0 ? r.passFail : '';
            const sugg = suggLines[i] || '';
            const fix = fixLines[i] || '';
            console.log(`| ${pad(agent, agentW)} | ${pad(location, locW)} | ${pad(rating, ratingW)} | ${pad(pass, passW)} | ${pad(sugg, suggW)} | ${pad(fix, fixW)} |`);
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

    const existingTasks = loadTasks();
    if (existingTasks.length > 0) {
        console.log(`Loaded ${existingTasks.length} existing tasks from tasks.md`);
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

    const secPrompt = getAgentPrompt("Security", codebaseContent, existingTasks);
    const perfPrompt = getAgentPrompt("Performance", codebaseContent, existingTasks);

    const results = await Promise.allSettled([
        callGemini(apiKey, secPrompt, "Security"),
        callGemini(apiKey, perfPrompt, "Performance")
    ]);

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

    // Merge logic: Add new suggestions to tasks
    const newTasks = [...existingTasks];
    allReasons.forEach(reason => {
        const exists = existingTasks.some(t =>
            t.file === reason.file &&
            t.suggestions === reason.suggestions &&
            t.status === 'Open'
        );
        if (!exists) {
            newTasks.push({
                status: 'Open',
                id: `${reason.agentType.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substr(2, 5)}`,
                suggestions: reason.suggestions,
                file: reason.file,
                line: reason.line,
                agentType: reason.agentType
            });
        }
    });

    if (overallPass) {
        console.log("\n✅ Codebase PASSED the reviews!");
    } else {
        console.error("\n❌ Codebase FAILED the reviews.");
    }

    printTable(allReasons);
    saveTasks(newTasks);

    process.exit(0);
}

run();
