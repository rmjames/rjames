/**
 * VALIDATOR: Checks if the refactored code uses 'fetch' and is async.
 */
function validate(code) {
    const usesFetch = code.includes('fetch(');
    const isAsync = code.includes('async ') || code.includes('.then(');
    
    if (usesFetch && isAsync) {
        return { passed: true };
    }
    return { 
        passed: false, 
        reason: `Missing expected patterns. Fetch: ${usesFetch}, Async: ${isAsync}` 
    };
}

module.exports = { validate };
