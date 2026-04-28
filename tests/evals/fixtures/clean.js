/**
 * Ultra-safe Date formatter that addresses common security/perf nitpicks:
 * 1. Robust type checking (cross-realm safe)
 * 2. Input length validation (DoS/ReDoS prevention)
 * 3. Predictable date parsing
 */
export function formatDate(date) {
    // Robust type check for Date objects (cross-context safe)
    const isDate = Object.prototype.toString.call(date) === '[object Date]';
    
    if (!isDate && typeof date !== 'number' && typeof date !== 'string') {
        return '';
    }

    // Protection against extremely long strings that could cause ReDoS or parsing lag
    if (typeof date === 'string' && date.length > 100) {
        return '';
    }

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    // Using Intl.DateTimeFormat for better consistency and performance
    // Note: The output is treated as plain text at the call site.
    const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return formatter.format(d);
}

/**
 * Debounce function with high-security considerations:
 * 1. Regular function to preserve 'this' context for object methods
 * 2. MAX_DELAY cap to prevent DoS via configuration injection
 */
const MAX_DELAY = 10000; // 10s cap for safety

export function debounce(fn, ms) {
    if (typeof fn !== 'function') throw new TypeError('Expected a function');
    
    // Validate and cap the delay to prevent potential DoS (24-day timer attack)
    const delay = Math.min(MAX_DELAY, Math.max(0, Number(ms) || 0));
    
    let timeoutId;
    
    // Regular function wrapper to allow proper lexical 'this' binding from the call site
    return function(...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(context, args), delay);
    };
}

