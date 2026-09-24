import { describe, it, expect, vi, beforeEach } from 'vitest';
const {
    getTypeSafeClient,
    isDuplicateFinding,
    verifyThreatFinding,
    classifySecretCandidate,
    parseTasksMarkdown,
    tokenizeText,
    computeTokenOverlap
} = require('../utils/typesafe-judge.js');

describe('typesafe-judge.js', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('getTypeSafeClient', () => {
        it('should return null when no API key is provided', () => {
            expect(getTypeSafeClient(null)).toBeNull();
            expect(getTypeSafeClient('')).toBeNull();
        });

        it('should return TypeSafeClient instance when API key is provided', () => {
            const client = getTypeSafeClient('test-typesafe-key-12345');
            expect(client).not.toBeNull();
            expect(typeof client.systemOne).toBe('function');
        });
    });

    describe('tokenizeText & computeTokenOverlap', () => {
        it('should correctly tokenize and compute similarity', () => {
            const setA = tokenizeText('Cross-site scripting (XSS) in innerHTML');
            const setB = tokenizeText('Detected XSS vulnerability inside innerHTML sink');
            const overlap = computeTokenOverlap(setA, setB);
            expect(overlap).toBeGreaterThan(0.3);
        });

        it('should return 0 for disjoint tokens', () => {
            const setA = tokenizeText('apple orange banana');
            const setB = tokenizeText('vehicle car truck');
            expect(computeTokenOverlap(setA, setB)).toBe(0);
        });
    });

    describe('isDuplicateFinding', () => {
        it('should return false if files do not match', async () => {
            const existing = { file: 'app.js', line: '10', suggestions: 'Issue', agentType: 'Security' };
            const finding = { file: 'other.js', line: '10', suggestions: 'Issue', agentType: 'Security' };
            expect(await isDuplicateFinding(existing, finding)).toBe(false);
        });

        it('should return true for exact same line and file', async () => {
            const existing = { file: 'app.js', line: '10', suggestions: 'Issue 1', agentType: 'Security' };
            const finding = { file: 'app.js', line: '10', suggestions: 'Issue 1', agentType: 'Security' };
            expect(await isDuplicateFinding(existing, finding)).toBe(true);
        });

        it('should detect duplicate with line drift using fallback similarity', async () => {
            const existing = {
                file: 'app.js',
                line: '10',
                suggestions: 'Reflow hazard: offsetHeight accessed in animation frame',
                suggestedFix: 'Cache layout calculation outside loop',
                agentType: 'Performance'
            };
            const finding = {
                file: 'app.js',
                line: '14', // shifted 4 lines due to prior edits
                suggestions: 'Forced synchronous layout due to offsetHeight query in frame',
                suggestedFix: 'Avoid layout thrashing by caching dimensions outside requestAnimationFrame',
                agentType: 'Performance'
            };
            expect(await isDuplicateFinding(existing, finding)).toBe(true);
        });

        it('should call TypeSafe client and honor high Noul probability', async () => {
            const mockClient = {
                systemOne: vi.fn().mockResolvedValue({
                    answers: {
                        is_duplicate: { noul: 0.92 }
                    }
                })
            };

            const existing = { file: 'app.js', line: '10', suggestions: 'XSS flaw', agentType: 'Security' };
            const finding = { file: 'app.js', line: '45', suggestions: 'Unsanitized HTML injection', agentType: 'Security' };

            const isDup = await isDuplicateFinding(existing, finding, mockClient);
            expect(isDup).toBe(true);
            expect(mockClient.systemOne).toHaveBeenCalled();
        });

        it('should call TypeSafe client and reject non-duplicate with low Noul probability', async () => {
            const mockClient = {
                systemOne: vi.fn().mockResolvedValue({
                    answers: {
                        is_duplicate: { noul: 0.15 }
                    }
                })
            };

            const existing = { file: 'app.js', line: '10', suggestions: 'XSS flaw', agentType: 'Security' };
            const finding = { file: 'app.js', line: '45', suggestions: 'Insecure cookie missing SameSite', agentType: 'Security' };

            const isDup = await isDuplicateFinding(existing, finding, mockClient);
            expect(isDup).toBe(false);
        });
    });

    describe('verifyThreatFinding', () => {
        it('should verify threat via fallback keyword/token overlap', async () => {
            const verified = await verifyThreatFinding(
                'DOMPurify or input sanitization',
                'XSS',
                'Unescaped innerHTML requires DOMPurify sanitization before insertion'
            );
            expect(verified).toBe(true);
        });

        it('should verify threat via TypeSafe Noul', async () => {
            const mockClient = {
                systemOne: vi.fn().mockResolvedValue({
                    answers: {
                        matches_threat: { noul: 0.88 }
                    }
                })
            };

            const verified = await verifyThreatFinding('Forced synchronous layout', 'Performance', 'Layout thrashing detected', mockClient);
            expect(verified).toBe(true);
            expect(mockClient.systemOne).toHaveBeenCalled();
        });
    });

    describe('classifySecretCandidate', () => {
        it('should classify token using TypeSafe Choice', async () => {
            const mockClient = {
                systemOne: vi.fn().mockResolvedValue({
                    answers: {
                        token_type: { choice: 'secret_credential' }
                    }
                })
            };

            const isSecret = await classifySecretCandidate(
                'sk-live-12345678901234567890',
                'const apiKey = "sk-live-12345678901234567890";',
                mockClient
            );
            expect(isSecret).toBe(true);
        });

        it('should treat content hashes as non-secret in fallback', async () => {
            const sha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
            const context = `const assetPath = "/build/main.${sha256}.js";`;
            const isSecret = await classifySecretCandidate(sha256, context);
            expect(isSecret).toBe(false);
        });
    });

    describe('parseTasksMarkdown', () => {
        it('should parse standard tasks and fix lines', () => {
            const md = `
# Tasks
## [ ] Open Tasks
- [ ] **SEC-101**: XSS sink (File: index.js, Line: 42)
  - **Fix**: Use textContent instead of innerHTML
## [x] Resolved Tasks
- [x] **PERF-202**: Memory leak (File: audio.js, Line: 15-20)
  - **Fix**: Clean up audio context
`;
            const tasks = parseTasksMarkdown(md);
            expect(tasks).toHaveLength(2);
            expect(tasks[0].id).toBe('SEC-101');
            expect(tasks[0].status).toBe('Open');
            expect(tasks[0].file).toBe('index.js');
            expect(tasks[0].line).toBe('42');
            expect(tasks[0].suggestedFix).toBe('Use textContent instead of innerHTML');

            expect(tasks[1].id).toBe('PERF-202');
            expect(tasks[1].status).toBe('Resolved');
            expect(tasks[1].line).toBe('15-20');
        });

        it('should gracefully handle missing fix lines and variations in spacing', () => {
            const md = `
## Open Tasks
- [ ]   **SEC-99** : Prototype pollution flaw  (File: lib/util.js, Line: ? )
`;
            const tasks = parseTasksMarkdown(md);
            expect(tasks).toHaveLength(1);
            expect(tasks[0].id).toBe('SEC-99');
            expect(tasks[0].file).toBe('lib/util.js');
            expect(tasks[0].line).toBe('?');
            expect(tasks[0].suggestedFix).toBeNull();
        });
    });
});
