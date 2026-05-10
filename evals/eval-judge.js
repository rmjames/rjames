const fs = require('fs');
const path = require('path');
const { callGemini, getAgentPrompt } = require('../scripts/judge.js');

const MANIFEST_PATH = path.join(__dirname, 'manifest.json');
const API_KEY = process.env.GEMINI_API_KEY;

async function runEvals() {
    if (!API_KEY) {
        console.error("Error: GEMINI_API_KEY environment variable is not set.");
        process.exit(1);
    }

    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error("Error: manifest.json not found.");
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    const results = [];

    console.log(`\n🔍 Starting Evaluation of judge.js using ${manifest.length} fixtures...\n`);

    for (const test of manifest) {
        console.log(`Testing: ${test.name} (${test.file})...`);
        
        try {
            const absolutePath = path.join(__dirname, '..', test.file);
            const content = fs.readFileSync(absolutePath, 'utf-8');
            const codebaseContext = `--- File: ${test.file} ---\n${content}`;
            
            const prompt = test.type === 'capability' 
                ? `${test.task}\n\nCode:\n${content}`
                : getAgentPrompt(test.agentType, codebaseContext, []);
            
            const response = await callGemini(API_KEY, prompt, test.agentType);

            if (!response) {
                console.error(`  ❌ Failed to get response for ${test.name}`);
                results.push({ ...test, passed: false, error: 'No response' });
                continue;
            }

            let testPassed = false;
            let failureDetail = '';

            if (test.type === 'capability') {
                // Capability Eval: Run the validator
                const validatorPath = path.join(__dirname, '..', test.validator);
                const { validate } = require(validatorPath);
                // We assume for capability, we might need the raw text if response.reasons is for detection
                // But if our judge.js always returns JSON, we might need a raw mode or extract from suggestions
                const llmCode = response.reasons ? response.reasons.map(r => r.suggestions).join('\n') : (typeof response === 'string' ? response : JSON.stringify(response));
                const validation = validate(llmCode);
                testPassed = validation.passed;
                failureDetail = validation.reason;
            } else {
                // Detection Eval: Check for expected keywords
                const foundExpected = test.expectedIssue 
                    ? response.reasons.some(r => r.suggestions.toLowerCase().includes(test.expectedIssue.toLowerCase()))
                    : response.pass === true;

                const isFalsePositive = !test.expectedIssue && response.pass === false;
                testPassed = foundExpected && !isFalsePositive;
                failureDetail = response.reasons ? response.reasons.map(r => r.suggestions).join(', ') : 'No reasons';
            }

            if (testPassed) {
                console.log(`  ✅ Passed`);
                results.push({ ...test, passed: true });
            } else {
                console.log(`  ❌ Failed`);
                results.push({ ...test, passed: false, actual: failureDetail });
            }
        } catch (e) {
            console.error(`  ❌ Error processing ${test.name}: ${e.message}`);
            results.push({ ...test, passed: false, error: e.message });
        }
    }

    printSummary(results);
}

function printSummary(results) {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const recall = (passed / total) * 100;

    console.log("\n" + "=".repeat(40));
    console.log("📊 EVALUATION SUMMARY");
    console.log("=".repeat(40));
    console.log(`Total Tests: ${total}`);
    console.log(`Passed:      ${passed}`);
    console.log(`Recall:      ${recall.toFixed(2)}%`);
    console.log("=".repeat(40));

    if (passed < total) {
        console.log("\nFailures:");
        results.filter(r => !r.passed).forEach(r => {
            const status = r.expectedIssue ? "False Negative (Missing Issue)" : "False Positive (Unexpected Issue)";
            console.log(`\n[${status}] - ${r.name}`);
            if (r.error) {
                console.log(`  Error: ${r.error}`);
            } else if (r.expectedIssue) {
                console.log(`  Expected keyword: "${r.expectedIssue}"`);
                console.log(`  Actual findings:\n    ${Array.isArray(r.actual) ? r.actual.join('\n    ') : r.actual}`);
            } else {
                console.log(`  Unexpected findings in "clean" file:\n    ${Array.isArray(r.actual) ? r.actual.join('\n    ') : r.actual}`);
            }
        });
    }
    console.log("\n");
}

runEvals();
