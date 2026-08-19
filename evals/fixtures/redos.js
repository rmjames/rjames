// Fixture: Catastrophic backtracking regular expression for email validation
function validateEmail(email) {
    // Vulnerable to ReDoS on input like: "aaaaaaaaaaaaaaaaaaaaaaaaaaaa!"
    const regex = /^([a-zA-Z0-9]+)+@([a-zA-Z0-9]+)+\.com$/;
    return regex.test(email);
}

const input = 'a'.repeat(30) + '!';
validateEmail(input);
