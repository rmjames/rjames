// Fixture: Recursive deep merge vulnerable to prototype pollution
function deepMerge(target, source) {
    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

const userInput = JSON.parse('{"__proto__": {"isAdmin": true}}');
const config = deepMerge({}, userInput);
