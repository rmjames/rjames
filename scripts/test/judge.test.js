import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
const { loadTasks, saveTasks, getAgentPrompt, callGemini, getAllFiles, scrubSecrets, mergeFindings } = require('../judge.js');

describe('judge.js', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('loadTasks', () => {
        it('should return an empty array if tasks.md does not exist', () => {
            vi.spyOn(fs, 'existsSync').mockReturnValue(false);
            const tasks = loadTasks();
            expect(tasks).toEqual([]);
        });

        it('should correctly parse tasks and suggested fixes from tasks.md', () => {
            const mockContent = `
# Project Analysis Tasks

## [ ] Open Tasks
- [ ] **SEC-123**: XSS vulnerability found (File: app.js, Line: 10)
  - **Fix**: Sanitize input using DOMPurify
- [ ] **PERF-456**: Heavy main thread usage (File: heavy.js, Line: 50)
  - **Fix**: Use a Web Worker
`;
            vi.spyOn(fs, 'existsSync').mockReturnValue(true);
            vi.spyOn(fs, 'readFileSync').mockReturnValue(mockContent);

            const tasks = loadTasks();
            expect(tasks).toHaveLength(2);
            expect(tasks[0].id).toBe('SEC-123');
            expect(tasks[0].suggestedFix).toBe('Sanitize input using DOMPurify');
        });
    });

    describe('saveTasks', () => {
        it('should write tasks to tasks.md in the correct format', () => {
            const tasks = [
                {
                    status: 'Open',
                    id: 'SEC-1',
                    suggestions: 'Problem 1',
                    file: 'file1.js',
                    line: '1',
                    suggestedFix: 'Fix 1',
                    agentType: 'Security'
                }
            ];

            const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => { });
            saveTasks(tasks);

            expect(writeSpy).toHaveBeenCalled();
            const writtenContent = writeSpy.mock.calls[0][1];
            expect(writtenContent).toContain('## [ ] Open Tasks');
            expect(writtenContent).toContain('- [ ] **SEC-1**: Problem 1 (File: file1.js, Line: 1)');
        });
    });

    describe('getAllFiles', () => {
        it('should recursively find allowed files and ignore directories', () => {
            vi.spyOn(fs, 'readdirSync').mockImplementation((dir) => {
                if (dir.endsWith('root')) return ['file.js', 'node_modules', 'subdir', '.env', 'judge.js'];
                if (dir.endsWith('subdir')) return ['style.css', 'index.html'];
                return [];
            });

            vi.spyOn(fs, 'statSync').mockImplementation((p) => ({
                isDirectory: () => p.endsWith('node_modules') || p.endsWith('subdir')
            }));

            const files = getAllFiles('/root');
            expect(files).toContain(path.join('/root', 'file.js'));
            expect(files).toContain(path.join('/root', 'subdir', 'style.css'));
            expect(files).not.toContain(path.join('/root', 'node_modules'));
            expect(files).not.toContain(path.join('/root', '.env'));
            expect(files).not.toContain(path.join('/root', 'judge.js'));
            expect(files).toHaveLength(3);
        });
    });

    describe('scrubSecrets', () => {
        // Generate keys dynamically to avoid static analysis triggers
        const generateMockKey = (prefix, length) => prefix + Math.random().toString(36).substring(2, 15).padEnd(length - prefix.length, 'x');
        const DUMMY_GEMINI_KEY = generateMockKey('AIzaSy', 39);
        const DUMMY_OPENAI_KEY = generateMockKey('sk-', 48);

        it('should redact Gemini API keys', () => {
            const content = `const key = "${DUMMY_GEMINI_KEY}";`;
            const scrubbed = scrubSecrets(content);
            expect(scrubbed).toBe('const key: "[REDACTED_SECRET]";');
        });

        it('should redact the provided current API key specifically', () => {
            const myKey = "MY_SPECIAL_KEY_12345";
            const content = `Connecting with ${myKey}`;
            const scrubbed = scrubSecrets(content, myKey);
            expect(scrubbed).toBe('Connecting with [REDACTED_CURRENT_KEY]');
        });

        it('should redact OpenAI/Anthropic API keys', () => {
            const content = DUMMY_OPENAI_KEY;
            const scrubbed = scrubSecrets(content);
            expect(scrubbed).toBe('[REDACTED_SECRET]');
        });

        it('should redact GitHub personal access tokens', () => {
            const content = 'ghp_' + '1'.repeat(36);
            const scrubbed = scrubSecrets(content);
            expect(scrubbed).toBe('[REDACTED_SECRET]');
        });

        it('should redact hex-like secrets (32+ chars)', () => {
            const content = 'my_var = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4";';
            const scrubbed = scrubSecrets(content);
            expect(scrubbed).toBe('my_var = "[REDACTED_SECRET]";');
        });

        it('should redact generic key-value secrets', () => {
            const content = 'password: "my-secret-password"';
            const scrubbed = scrubSecrets(content);
            expect(scrubbed).toBe('password: "[REDACTED_SECRET]"');
        });

        it('should redact private keys', () => {
            const content = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA7...\n-----END RSA PRIVATE KEY-----';
            const scrubbed = scrubSecrets(content);
            expect(scrubbed).toBe('[REDACTED_SECRET]');
        });

        it('should redact Stripe and AWS keys', () => {
            const content = 'stripe: ' + 'sk_live_' + '1'.repeat(24) + ', aws: ' + 'AKIA' + '1'.repeat(16);
            const scrubbed = scrubSecrets(content);
            expect(scrubbed).toBe('stripe: [REDACTED_SECRET], aws: [REDACTED_SECRET]');
        });

        it('should redact multiple secrets in the same string', () => {
            const content = `Gemini: ${DUMMY_GEMINI_KEY}, OpenAI: ${DUMMY_OPENAI_KEY}`;
            const scrubbed = scrubSecrets(content);
            expect(scrubbed).toBe('Gemini: [REDACTED_SECRET], OpenAI: [REDACTED_SECRET]');
        });

        it('should return empty string for null/undefined content', () => {
            expect(scrubSecrets(null)).toBe("");
            expect(scrubSecrets(undefined)).toBe("");
        });
    });

    describe('getAgentPrompt', () => {
        it('should include codebase content in the prompt', () => {
            const codebase = 'console.log("hello");';
            const prompt = getAgentPrompt('Security', codebase, []);
            expect(prompt).toContain(codebase);
            expect(prompt).toContain('expert security code reviewer');
        });

        it('should include the nitpicking warning in the security prompt', () => {
            const prompt = getAgentPrompt('Security', 'content', []);
            expect(prompt).toContain('AVOID nitpicking minor stylistic choices');
            expect(prompt).toContain('DO NOT report "missing input validation" for simple parameters');
        });

        it('should include specific anti-patterns in the performance prompt', () => {
            const prompt = getAgentPrompt('Performance', 'content', []);
            expect(prompt).toContain('Forced Synchronous Layout (Reflow)');
            expect(prompt).toContain('offsetHeight');
            expect(prompt).toContain('toDataURL');
            expect(prompt).toContain('Memory Bloat');
        });
    });

    describe('callGemini', () => {
        it('should extract JSON from markdown response', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{
                                text: '```json\n{"pass": true, "reasons": []}\n```'
                            }]
                        }
                    }]
                })
            });

            const result = await callGemini('api-key', 'prompt', 'Security');
            expect(result).toEqual({ pass: true, reasons: [] });
        });

        it('should handle API errors gracefully', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: () => Promise.resolve('Error message')
            });

            const result = await callGemini('api-key', 'prompt', 'Security');
            expect(result).toBeNull();
        });
    });

    describe('mergeFindings', () => {
        it('should not add duplicate tasks', () => {
            const existingTasks = [
                { id: 'SEC-1', file: 'app.js', line: '10', suggestions: 'Issue 1', status: 'Open', agentType: 'Security' }
            ];
            const newFindings = [
                { file: 'app.js', line: '10', suggestions: 'Issue 1', agentType: 'Security' }
            ];

            const { newTasks, addedTasks } = mergeFindings(existingTasks, newFindings);
            expect(addedTasks).toHaveLength(0);
            expect(newTasks).toHaveLength(1);
        });

        it('should add new tasks and generate unique IDs', () => {
            const existingTasks = [
                { id: 'SEC-1', file: 'app.js', line: '10', suggestions: 'Issue 1', status: 'Open' }
            ];
            const newFindings = [
                { file: 'other.js', line: '20', suggestions: 'New Issue', agentType: 'Performance' }
            ];

            const { newTasks, addedTasks } = mergeFindings(existingTasks, newFindings);
            expect(addedTasks).toHaveLength(1);
            expect(addedTasks[0].id).toMatch(/PERF-\d+/);
            expect(newTasks).toHaveLength(2);
        });
    });
});

