import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
const { loadTasks, saveTasks, getAgentPrompt, callGemini, getAllFiles, scrubSecrets, mergeFindings } = require('./judge.js');

describe('judge.js', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('loadTasks', () => {
        it('should return an empty array if tasks.md does not exist', () => {
            const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
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
        it('should redact Gemini API keys', () => {
            const content = 'const key = "[REDACTED_GEMINI_MOCK]";';
            const scrubbed = scrubSecrets(content);
            expect(scrubbed).toBe('const key = "[REDACTED_SECRET]";');
        });

        it('should redact OpenAI API keys', () => {
            const content = '[REDACTED_OPENAI_MOCK]';
            const scrubbed = scrubSecrets(content);
            expect(scrubbed).toBe('[REDACTED_SECRET]');
        });

        it('should redact GitHub personal access tokens', () => {
            const content = '[REDACTED_GITHUB_MOCK]';
            const scrubbed = scrubSecrets(content);
            expect(scrubbed).toBe('[REDACTED_SECRET]');
        });

        it('should redact hex-like secrets (32+ chars)', () => {
            const content = 'my_secret = "[REDACTED_HEX_MOCK]";';
            const scrubbed = scrubSecrets(content);
            expect(scrubbed).toBe('my_secret = "[REDACTED_SECRET]";');
        });

        it('should redact multiple secrets in the same string', () => {
            const content = 'Gemini: [REDACTED_GEMINI_MOCK], OpenAI: [REDACTED_OPENAI_MOCK_SHORT]';
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

