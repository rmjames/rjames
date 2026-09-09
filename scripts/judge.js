const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = new Set([
    'node_modules', '.git', 'build', 'dist', 'public', '.jules', '.claude', 
    'images', 'fonts', 'assets', 'tests', 'lab', 'evals', '.github', '.vscode',
    'playwright-report', 'test-results', 'verification', 'work'
]);
const IGNORED_FILES = new Set([
    '.env', '.env.local', '.env.development', '.env.production',
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.DS_Store', 
    'judge.js', 'judge.test.js', 'server.log', 'lighthouse-report.json'
]);
const ALLOWED_EXTENSIONS = new Set(['.js', '.html', '.css', '.ts', '.tsx']);
const MAX_FILE_SIZE = 100 * 1024; // 100KB per file limit
const MAX_TOTAL_SIZE = 500 * 1024; // 500KB total limit
const TASKS_FILE = path.join(__dirname, '..', 'tasks.md');

// Updated Secret Scrubbing Regex
const SECRET_PATTERNS = [
    /AIza[a-z0-9_-]{35}/gi,              // Gemini
    /sk-[a-z0-9-]{20,}/gi,                // OpenAI/Anthropic
    /ghp_[a-z0-9]{36}/gi,                 // GitHub
    /sk_live_[0-9a-zA-Z]{24}/gi,          // Stripe
    /AKIA[0-9A-Z]{16}/gi,                 // AWS Access Key
    /-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/gi, // Private Keys
    /(password|secret|key|auth|token|passwd)\s*[:=]\s*["']([^"']+)["']/gi, // Generic Key-Value secrets
    /[a-f0-9]{32,}/gi                     // Generic Hex secrets (32+ chars)
];

/**
 * Redacts secrets from a string using predefined patterns and an optional dynamic key.
 */
function scrubSecrets(content, apiKeyToRedact = null) {
    if (!content) return "";
    let scrubbed = content;

    // Explicitly redact the current API key if it exists in the content
    if (apiKeyToRedact && apiKeyToRedact.length > 5) {
        scrubbed = scrubbed.split(apiKeyToRedact).join("[REDACTED_CURRENT_KEY]");
    }

    SECRET_PATTERNS.forEach(pattern => {
        if (pattern.source.includes('["\']')) {
            // Special handling for key-value pairs to keep the key
            scrubbed = scrubbed.replace(pattern, (match, p1) => `${p1}: "[REDACTED_SECRET]"`);
        } else {
            scrubbed = scrubbed.replace(pattern, "[REDACTED_SECRET]");
        }
    });
    return scrubbed;
}

function loadTasks() {
    if (!fs.existsSync(TASKS_FILE)) return [];
    try {
        const content = fs.readFileSync(TASKS_FILE, 'utf-8');
        const tasks = [];
        const sections = content.split('##').slice(1);

        sections.forEach(section => {
            const lines = section.split('\n');
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                // Match the main task line
                const match = line.match(/- \[([ x])\] \*\*(SEC|PERF)-(\w+)\*\*: (.*?) \(File: (.*?), Line: (.*?)\)/);
                if (match) {
                    const task = {
                        status: match[1] === 'x' ? 'Resolved' : 'Open',
                        id: `${match[2]}-${match[3]}`,
                        suggestions: match[4],
                        file: match[5],
                        line: match[6],
                        suggestedFix: null,
                        agentType: match[2] === 'SEC' ? 'Security' : 'Performance'
                    };

                    // Look ahead for the fix line
                    if (i + 1 < lines.length && lines[i + 1].trim().startsWith('- **Fix**:')) {
                        const fixMatch = lines[i + 1].match(/- \*\*Fix\*\*: (.*)/);
                        if (fixMatch) {
                            task.suggestedFix = fixMatch[1];
                            i++; // Skip the next line since we've processed it
                        }
                    }
                    tasks.push(task);
                }
            }
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
        if (t.suggestedFix) {
            content += `  - **Fix**: ${t.suggestedFix.replace(/\n/g, ' ')}\n`;
        }
    });

    content += "\n## [x] Resolved Tasks\n";
    resolved.forEach(t => {
        const prefix = t.agentType === 'Security' ? 'SEC' : 'PERF';
        const idPart = t.id.includes('-') ? t.id.split('-')[1] : t.id;
        content += `- [x] **${prefix}-${idPart}**: ${t.suggestions} (File: ${t.file}, Line: ${t.line})\n`;
        if (t.suggestedFix) {
            content += `  - **Fix**: ${t.suggestedFix.replace(/\n/g, ' ')}\n`;
        }
    });

    fs.writeFileSync(TASKS_FILE, content);
    console.log(`\n✅ Updated ${TASKS_FILE}`);
}

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        const fileName = path.basename(file);
        
        try {
            if (fs.statSync(fullPath).isDirectory()) {
                if (!IGNORED_DIRS.has(fileName)) {
                    arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
                }
            } else {
                if (IGNORED_FILES.has(fileName)) return;
                const ext = path.extname(file);
                if (ALLOWED_EXTENSIONS.has(ext)) {
                    arrayOfFiles.push(fullPath);
                }
            }
        } catch {
            // Skip unreadable files or broken symlinks
        }
    });

    return arrayOfFiles;
}

function getAgentPrompt(agentType, codebaseContent, existingTasks = []) {
    const openTasks = existingTasks.filter(t => t.agentType === agentType && t.status === 'Open');
    const taskContext = openTasks.length > 0
        ? `\nKNOWN ISSUES (Do not repeat these unless providing new critical context):\n${openTasks.map(t => `- ${t.suggestions} (File: ${t.file})`).join('\n')}\n`
        : "";
    const references = ["https://csrc.nist.gov/projects/supply-chain-risk-management", "https://osv.dev/", "https://owasp.org/Top10/", "https://cwe.mitre.org/"];

    if (agentType === "Security") {
        const refContext = `\nSECURITY STANDARDS & REFERENCES:\n${references.map(r => `- ${r}`).join('\n')}\n`;
        return `You are an expert security code reviewer acting as a judge.
Review the following HTML, CSS, and JS files from a web project. Look at all possible attack vectors.
Identify any clear security vulnerabilities (like XSS, CSRF, insecure configurations, etc).
${taskContext}${refContext}
CRITICAL INSTRUCTIONS:
1. You MUST provide at least 5 detailed reasons/suggestions in your output.
2. Rank vulnerabilities by Risk Score (Likelihood × Impact) from highest to lowest.
3. For each issue, you MUST provide:
   - Likelihood (1-5, where 5 is almost certain).
   - Impact (1-5, where 5 is critical/total compromise).
   - The exact vulnerable code snippet from the file.
   - A Proof-of-Concept (PoC) payload or curl command to demonstrate the vulnerability.
   - A detailed "suggestedFix" with a secure code example.
4. Deep Analysis Requirements:
   - Analyze Data, User, and Business Flows: Look for logic flaws or insecure transitions between states.
   - Scrutinize Auth Boundaries: Check how sensitive data is protected and where access controls might be bypassed.
   - Identify Entry Points: Map all inputs (URL params, form data, API endpoints, etc.) and verify they are sanitized and validated.
5. Your analysis and suggestions should be informed by the security standards and databases listed in the REFERENCES section above.
6. Be extremely critical and biased towards finding flaws, but AVOID nitpicking minor stylistic choices or lack of defensive programming in non-critical utility functions unless they present a high-risk vulnerability (e.g., ReDoS, Prototype Pollution).
7. DO NOT report "missing input validation" for simple parameters (like timeout durations or colors) unless it leads to a specific, exploitable security bypass or resource exhaustion.

If there are any security issues that would fail a strict review, output a JSON object with "pass": false and a "reasons" array of objects.
If the codebase is secure, output a JSON object with "pass": true and a "reasons" array of objects explaining why.
Each object in the "reasons" array MUST have the following keys:
- "rating": A string rating (e.g., "A", "B", "C", "F")
- "passFail": "Pass" or "Fail"
- "suggestions": A single string containing a distinct and actionable description of the issue.
- "likelihood": (Number 1-5)
- "impact": (Number 1-5)
- "riskScore": (Number, likelihood * impact)
- "vulnerableCode": A string containing the exact vulnerable snippet.
- "poc": A string containing the PoC payload or curl command.
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
4. Specific Anti-Patterns to Detect:
   - Forced Synchronous Layout (Reflow): Watch out for code that accesses layout properties like \`offsetHeight\`, \`offsetWidth\`, \`scrollHeight\`, etc., specifically to trigger a reflow for resetting CSS animations. This causes "jank".
   - Unoptimized Canvas/Graphics: Look for synchronous, blocking operations in high-frequency loops (like \`toDataURL\` in an animation frame).
   - Memory Bloat: Identify excessive object allocation or DOM mutation in animations.
5. Be extremely critical.

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
        const baseUrl = (process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');
        const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
        const url = baseUrl.includes('/models/')
            ? baseUrl
            : `${baseUrl}/v1beta/models/${model}:generateContent`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
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
            console.error(scrubSecrets(errBody, apiKey));
            if (errBody.includes('User location is not supported')) {
                console.error('\n💡 Location Error Troubleshooting:');
                console.error('   1. Check VPN / Proxy: Switch to a supported country/region (e.g. US, Canada).');
                console.error('   2. Set GEMINI_BASE_URL in your .env to route through a reverse proxy or Vertex AI gateway.\n');
            }
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
            if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
            }
            // Try to extract JSON if it's wrapped in markdown or has preamble
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanText = jsonMatch[0];
            }

            try {
                result = JSON.parse(cleanText);
            } catch {
                // Sanitize unescaped newlines/tabs inside JSON string literals
                const sanitized = cleanText.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n')
                    .split('').filter(c => {
                        const code = c.charCodeAt(0);
                        return code >= 32 || code === 10 || code === 13 || code === 9;
                    }).join('');
                result = JSON.parse(sanitized);
            }

            if (result.reasons && Array.isArray(result.reasons)) {
                result.reasons = result.reasons.map(r => ({ ...r, agentType }));
            }
            return result;
        } catch (e) {
            console.error(`Failed to parse Gemini response as JSON for ${agentType} Agent:`, e.message);
            console.error("--- RAW RESPONSE START ---");
            console.error(textResponse);
            console.error("--- RAW RESPONSE END ---");
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
    const agentW = 10, locW = 25, ratingW = 6, passW = 8, riskW = 6, suggW = 45, fixW = 55;
    const separator = `+-${'-'.repeat(agentW)}-+-${'-'.repeat(locW)}-+-${'-'.repeat(ratingW)}-+-${'-'.repeat(passW)}-+-${'-'.repeat(riskW)}-+-${'-'.repeat(suggW)}-+-${'-'.repeat(fixW)}-+`;

    console.log(separator);
    console.log(`| ${pad('Agent', agentW)} | ${pad('Location', locW)} | ${pad('Rate', ratingW)} | ${pad('Status', passW)} | ${pad('Risk', riskW)} | ${pad('Issue', suggW)} | ${pad('Suggested Fix', fixW)} |`);
    console.log(separator);

    reasons.forEach(r => {
        const loc = `${r.file || 'unknown'}:${r.line || '?'}`;
        const risk = r.riskScore ? r.riskScore.toString() : '-';
        const suggLines = wrapText(r.suggestions || 'No description', suggW);
        const fixLines = wrapText(r.suggestedFix || 'No fix provided', fixW);
        const maxLines = Math.max(suggLines.length, fixLines.length);

        for (let i = 0; i < maxLines; i++) {
            const agent = (i === 0 && r.agentType) ? r.agentType.substring(0, 3) : '';
            const location = i === 0 ? loc.substring(0, locW) : '';
            const rating = i === 0 ? (r.rating || '-') : '';
            const pass = i === 0 ? (r.passFail || '-') : '';
            const riskStr = i === 0 ? risk : '';
            const sugg = suggLines[i] || '';
            const fix = fixLines[i] || '';
            console.log(`| ${pad(agent, agentW)} | ${pad(location, locW)} | ${pad(rating, ratingW)} | ${pad(pass, passW)} | ${pad(riskStr, riskW)} | ${pad(sugg, suggW)} | ${pad(fix, fixW)} |`);
        }
        console.log(separator);
    });

    if (reasons.length > 0) {
        console.log(`\nFound ${reasons.length} total issues (new and existing).`);
    } else {
        console.log("\nNo issues found.");
    }
}

async function scanCodebase(apiKey, codebaseContent, existingTasks) {
    const secPrompt = getAgentPrompt("Security", codebaseContent, existingTasks);
    const perfPrompt = getAgentPrompt("Performance", codebaseContent, existingTasks);

    const results = await Promise.allSettled([
        callGemini(apiKey, secPrompt, "Security"),
        callGemini(apiKey, perfPrompt, "Performance")
    ]);

    const secResult = results[0].status === 'fulfilled' ? results[0].value : null;
    const perfResult = results[1].status === 'fulfilled' ? results[1].value : null;

    let allReasons = [];
    if (secResult && secResult.reasons) allReasons = allReasons.concat(secResult.reasons);
    if (perfResult && perfResult.reasons) allReasons = allReasons.concat(perfResult.reasons);

    return {
        allReasons,
        pass: (secResult?.pass !== false) && (perfResult?.pass !== false)
    };
}

function mergeFindings(existingTasks, allReasons) {
    const newTasks = [...existingTasks];
    const addedTasks = [];

    allReasons.forEach(reason => {
        const existing = existingTasks.find(t => 
            t.file === reason.file && 
            t.line === reason.line && 
            t.agentType === reason.agentType
        );
        if (!existing) {
            const prefix = reason.agentType === 'Security' ? 'SEC' : 
                          reason.agentType === 'Performance' ? 'PERF' : 'TASK';
            const newTask = {
                id: `${prefix}-${newTasks.length + 1}`,
                agentType: reason.agentType,
                file: reason.file,
                line: reason.line,
                suggestions: reason.suggestions,
                suggestedFix: reason.suggestedFix,
                status: 'Open'
            };
            newTasks.push(newTask);
            addedTasks.push(newTask);
        }
    });

    return { newTasks, addedTasks };
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

    const files = getAllFiles(path.join(__dirname, '..'));
    console.log("📂 Preparing codebase for analysis...");
    let codebaseContent = "";
    let currentTotalSize = 0;
    
    for (const file of files) {
        if (currentTotalSize >= MAX_TOTAL_SIZE) {
            console.warn("⚠️  Max total size reached, skipping remaining files.");
            break;
        }

        try {
            const stats = fs.statSync(file);
            if (stats.size > MAX_FILE_SIZE) {
                console.warn(`⚠️  Skipping ${path.basename(file)} (too large: ${Math.round(stats.size/1024)}KB)`);
                continue;
            }

            let content = fs.readFileSync(file, 'utf-8');
            
            // Scrub potential secrets before sending to AI
            content = scrubSecrets(content, apiKey);

            const fileHeader = `\n\n--- File: ${path.relative(path.join(__dirname, '..'), file)} ---\n`;
            if (currentTotalSize + content.length + fileHeader.length > MAX_TOTAL_SIZE) {
                console.warn(`⚠️  Max total size reached while processing ${path.basename(file)}`);
                break;
            }

            codebaseContent += fileHeader;
            codebaseContent += content;
            currentTotalSize += content.length + fileHeader.length;
        } catch (e) {
            console.warn(`Could not read file ${file}: ${e.message}`);
        }
    }

    console.log("🚀 Starting codebase analysis...");
    const { allReasons, pass } = await scanCodebase(apiKey, codebaseContent, existingTasks);

    // Print summary of existing tasks
    const openTasksCount = existingTasks.filter(t => t.status === 'Open').length;
    if (openTasksCount > 0) {
        console.log(`\nℹ️  Note: There are ${openTasksCount} existing open tasks in tasks.md.`);
    }

    if (allReasons.length === 0) {
        console.log("\n✅ No new issues found in this scan.");
    } else {
        printTable(allReasons);
    }

    const { newTasks, addedTasks } = mergeFindings(existingTasks, allReasons);

    if (addedTasks.length > 0) {
        console.log(`\n🆕 Proposed ${addedTasks.length} new task(s) for tasks.md:`);
        addedTasks.forEach(t => {
            console.log(`- [${t.agentType}] ${t.file}:${t.line} - ${t.suggestions.substring(0, 80)}...`);
        });

        try {
            saveTasks(newTasks);
            console.log("\n✅ Successfully updated tasks.md with new findings.");
        } catch (e) {
            if (e.code === 'EPERM') {
                console.warn("\n⚠️  Permission denied (EPERM) while trying to update tasks.md.");
                console.warn("Please update tasks.md manually with the new findings listed above.");
            } else {
                console.error(`\n❌ Error updating tasks.md: ${e.message}`);
            }
        }
    }

    if (!pass) {
        console.error("\n❌ Codebase FAILED the scan.");
        if (require.main === module) process.exit(1);
        return false;
    } else {
        console.log("\n✅ Codebase PASSED the scan!");
        if (require.main === module) process.exit(0);
        return true;
    }
}

module.exports = {
    loadTasks,
    saveTasks,
    getAllFiles,
    getAgentPrompt,
    callGemini,
    printTable,
    scanCodebase,
    mergeFindings,
    scrubSecrets,
    run
};

if (require.main === module) {
    run();
}