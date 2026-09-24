/**
 * TypeSafe System One Judgments for Codebase Security & Performance Review.
 * Uses TypeSafe primitives (Choice, Noul, Score) to replace fragile regexes,
 * brittle line-number deduplication, and substring matching.
 */

const { TypeSafeClient, choice, noul } = require('@typesafe-ai/sdk');

/**
 * Returns a TypeSafeClient instance if TYPESAFE_API_KEY is available, or null.
 */
function getTypeSafeClient(apiKey = process.env.TYPESAFE_API_KEY) {
    if (!apiKey) return null;
    try {
        const isBrowserOrJsdom = typeof window !== 'undefined';
        return new TypeSafeClient({
            apiKey,
            ...(isBrowserOrJsdom ? { dangerouslyAllowBrowser: true } : {})
        });
    } catch {
        return null;
    }
}

/**
 * Normalizes text into a set of alphanumeric lowercase tokens for fallback similarity.
 */
function tokenizeText(str) {
    if (!str || typeof str !== 'string') return new Set();
    const words = str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    return new Set(words);
}

/**
 * Computes overlap coefficient (intersection / min(sizeA, sizeB)) between two token sets.
 * This is resilient when one description is more detailed than another.
 */
function computeTokenOverlap(setA, setB) {
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    for (const item of setA) {
        if (setB.has(item)) intersection++;
    }
    const minSize = Math.min(setA.size, setB.size);
    return minSize > 0 ? intersection / minSize : 0;
}

/**
 * Determines whether a newly discovered finding is a duplicate of an existing task.
 * Stand-in for fragile `t.file === reason.file && t.line === reason.line`.
 *
 * @param {object} existingTask - { file, line, suggestions, suggestedFix, agentType }
 * @param {object} newFinding - { file, line, suggestions, suggestedFix, agentType }
 * @param {TypeSafeClient|null} [client=null] - Optional injected client
 * @returns {Promise<boolean>}
 */
async function isDuplicateFinding(existingTask, newFinding, client = null) {
    if (!existingTask || !newFinding) return false;

    // Must be in the same file and from the same agent domain
    if (existingTask.file !== newFinding.file) return false;
    if (existingTask.agentType && newFinding.agentType && existingTask.agentType !== newFinding.agentType) {
        return false;
    }

    const tsClient = client || getTypeSafeClient();

    if (tsClient) {
        try {
            const state = {
                file: existingTask.file,
                agent_type: existingTask.agentType || 'Security/Performance',
                existing_task: {
                    line: existingTask.line,
                    issue: existingTask.suggestions,
                    fix: existingTask.suggestedFix || null
                },
                new_finding: {
                    line: newFinding.line,
                    issue: newFinding.suggestions,
                    fix: newFinding.suggestedFix || null
                }
            };

            const response = await tsClient.systemOne({
                state,
                questions: {
                    is_duplicate: noul(
                        "Does `new_finding` describe the exact same underlying vulnerability, code defect, or root cause as `existing_task` even if line numbers or wording vary slightly?",
                        {
                            true: "The finding addresses the same issue in the same file/component.",
                            false: "The finding addresses a different distinct issue or different code path."
                        }
                    )
                }
            });

            const probability = response?.answers?.is_duplicate?.noul;
            if (typeof probability === 'number') {
                return probability >= 0.70;
            }
        } catch (err) {
            console.warn('TypeSafe duplicate evaluation fallback:', err.message);
        }
    }

    // Heuristic Fallback:
    // If lines match exactly, it's a duplicate
    const lineA = parseInt(existingTask.line, 10);
    const lineB = parseInt(newFinding.line, 10);
    if (!isNaN(lineA) && !isNaN(lineB) && lineA === lineB) {
        return true;
    }

    // If lines are close (+/- 5 lines due to minor code edits) AND semantic overlap is high
    const lineDiff = (!isNaN(lineA) && !isNaN(lineB)) ? Math.abs(lineA - lineB) : Infinity;
    const tokensExisting = tokenizeText(existingTask.suggestions + ' ' + (existingTask.suggestedFix || ''));
    const tokensNew = tokenizeText(newFinding.suggestions + ' ' + (newFinding.suggestedFix || ''));
    const overlap = computeTokenOverlap(tokensExisting, tokensNew);

    if (lineDiff <= 8 && overlap >= 0.30) return true;
    if (overlap >= 0.60) return true; // High text similarity across same file

    return false;
}

/**
 * Verifies whether a reported finding satisfies an evaluation fixture.
 * Replaces fragile substring checks (`sugg.includes(exp)`).
 *
 * @param {string} expectedIssue - Target vulnerability description/keyword
 * @param {string} threatCategory - Category (e.g. 'XSS', 'ReDoS', 'Reflow')
 * @param {string} findingSuggestions - Finding text from judge
 * @param {TypeSafeClient|null} [client=null] - Optional injected client
 * @returns {Promise<boolean>}
 */
async function verifyThreatFinding(expectedIssue, threatCategory, findingSuggestions, client = null) {
    if (!expectedIssue) return true;
    if (!findingSuggestions) return false;

    const tsClient = client || getTypeSafeClient();

    if (tsClient) {
        try {
            const state = {
                expected_issue: expectedIssue,
                threat_category: threatCategory || 'General',
                reported_finding: findingSuggestions
            };

            const response = await tsClient.systemOne({
                state,
                questions: {
                    matches_threat: noul(
                        "Does `reported_finding` accurately detect and report the vulnerability described in `expected_issue` and `threat_category`?",
                        {
                            true: "The reported finding identifies the targeted security or performance flaw.",
                            false: "The reported finding missed the flaw or described an unrelated issue."
                        }
                    )
                }
            });

            const prob = response?.answers?.matches_threat?.noul;
            if (typeof prob === 'number') {
                return prob >= 0.65;
            }
        } catch (err) {
            console.warn('TypeSafe threat verification fallback:', err.message);
        }
    }

    // Heuristic Fallback
    const normSugg = findingSuggestions.toLowerCase();
    const normExp = expectedIssue.toLowerCase();

    // Check direct inclusion or token overlap
    if (normSugg.includes(normExp)) return true;

    const tokensExp = tokenizeText(expectedIssue);
    const tokensSugg = tokenizeText(findingSuggestions);
    const overlap = computeTokenOverlap(tokensExp, tokensSugg);

    return overlap >= 0.40;
}

/**
 * Classifies whether a candidate high-entropy/hex string is a secret token or a benign hash/digest.
 * Replaces overzealous `/[a-f0-9]{32,}/gi` scrubbing.
 *
 * @param {string} token - The candidate string
 * @param {string} surroundingContext - 2-3 lines surrounding the candidate
 * @param {TypeSafeClient|null} [client=null] - Optional injected client
 * @returns {Promise<boolean>} - True if it should be redacted as a secret
 */
async function classifySecretCandidate(token, surroundingContext, client = null) {
    if (!token || token.length < 20) return false;

    const tsClient = client || getTypeSafeClient();

    if (tsClient) {
        try {
            const response = await tsClient.systemOne({
                state: {
                    candidate_token: token,
                    surrounding_code: surroundingContext
                },
                questions: {
                    token_type: choice(
                        "Classify `candidate_token` in the context of `surrounding_code`:",
                        {
                            secret_credential: "An authentic API secret, private token, access key, or authentication credential that must be protected",
                            asset_hash_or_identifier: "A git commit hash, sha256/md5 content hash, CSS class hash, or build artifact identifier",
                            safe_code_literal: "Normal program code, hex color literal, or UUID that is safe to share"
                        }
                    )
                }
            });

            const decision = response?.answers?.token_type?.choice;
            return decision === 'secret_credential';
        } catch (err) {
            console.warn('TypeSafe secret classification fallback:', err.message);
        }
    }

    // Heuristic Fallback:
    // If the surrounding context contains password, api_key, auth, token assignment, redact it.
    // If it is in a filename (e.g. .chunk.js, /git/, etc.) or pure hex, treat as asset hash unless preceded by secret key name.
    const hasSecretAssignment = /(api_?key|secret|password|auth_?token|bearer)\s*[:=]/i.test(surroundingContext);
    const isPureHex = /^[a-f0-9]{32,64}$/i.test(token);

    if (hasSecretAssignment) return true;
    if (isPureHex && !hasSecretAssignment) return false; // Benign git/content hash

    return false;
}

/**
 * Robust task markdown parser with error tolerance for line ranges, spacing, and formatting.
 * Stand-in for brittle single-line regex.
 *
 * @param {string} markdownContent
 * @returns {Array<object>}
 */
function parseTasksMarkdown(markdownContent) {
    if (!markdownContent || typeof markdownContent !== 'string') return [];

    const tasks = [];
    const sections = markdownContent.split(/^##\s+/m).slice(1);

    for (const section of sections) {
        const lines = section.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line.startsWith('- [')) continue;

            const isResolved = line.startsWith('- [x]') || line.startsWith('- [X]');
            
            // Extract Prefix & ID
            const idMatch = line.match(/\*\*(SEC|PERF|TASK)-([a-zA-Z0-9_-]+)\*\*/i);
            if (!idMatch) continue;

            const prefix = idMatch[1].toUpperCase();
            const idNumber = idMatch[2];
            const fullId = `${prefix}-${idNumber}`;

            // Extract File & Line with tolerance for line ranges (e.g. Line: 10-15) and formatting
            const fileMatch = line.match(/File:\s*([^,)]+)/i);
            const lineMatch = line.match(/Line:\s*([0-9]+(?:-[0-9]+)?|\?)/i);

            // Extract Suggestion / Description
            // Strip the checkbox and ID tag, plus the (File: ..., Line: ...) trailer
            let suggestion = line
                .replace(/^- \[[ xX]\]\s*/, '')
                .replace(/\*\*(SEC|PERF|TASK)-[a-zA-Z0-9_-]+\*\*:\s*/i, '')
                .replace(/\(File:.*?\)$/i, '')
                .trim();

            const task = {
                status: isResolved ? 'Resolved' : 'Open',
                id: fullId,
                suggestions: suggestion,
                file: fileMatch ? fileMatch[1].trim() : 'unknown',
                line: lineMatch ? lineMatch[1].trim() : '?',
                suggestedFix: null,
                agentType: prefix === 'SEC' ? 'Security' : 'Performance'
            };

            // Check next line for suggested fix
            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                if (nextLine.startsWith('- **Fix**:') || nextLine.startsWith('**Fix**:')) {
                    task.suggestedFix = nextLine.replace(/^-?\s*\*\*Fix\*\*:\s*/i, '').trim();
                    i++;
                }
            }

            tasks.push(task);
        }
    }

    return tasks;
}

module.exports = {
    getTypeSafeClient,
    isDuplicateFinding,
    verifyThreatFinding,
    classifySecretCandidate,
    parseTasksMarkdown,
    tokenizeText,
    computeTokenOverlap
};
