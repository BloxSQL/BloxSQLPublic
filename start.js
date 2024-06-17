const { spawn } = require('child_process');
const readline = require('readline');

// Function to run each script and handle its output
function runScript(script) {
    const process = spawn('node', [script]);

    process.stdout.on('data', (data) => {
        console.log(`[${script}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`[${script} ERROR] ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
        console.log(`[${script}] process exited with code ${code}`);
    });

    return process;
}

// Setup readline interface to get user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Are you running local or VPS? ', (answer) => {
    let scripts = [];

    if (answer.toLowerCase() === 'local') {
        scripts.push('./server.js');
    } else if (answer.toLowerCase() === 'vps') {
        scripts.push('./server_VPS.js');
    } else {
        console.log('Invalid input. Exiting.');
        rl.close();
        return;
    }

    // Run all scripts
    scripts.forEach(runScript);

    // Close the readline interface
    rl.close();

    // Keep the main process alive
    const keepAlive = () => setTimeout(keepAlive, 1000);
    keepAlive();
});
