const { exec } = require('child_process');

function runUserCommand(userInput) {
    // REGRESSION: This is a blatant command injection vulnerability
    exec('ls -la ' + userInput, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}
