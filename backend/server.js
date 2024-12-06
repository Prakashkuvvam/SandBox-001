const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files (like CSS, JS, and HTML) from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

const userCodePath = path.join(__dirname, 'user_code');

// Ensure user_code directory exists
if (!fs.existsSync(userCodePath)) {
    fs.mkdirSync(userCodePath);
}

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const { code, language, userInput } = JSON.parse(message);

        const fileName = `user_code.${language === 'python' ? 'py' : 'cpp'}`;
        const fullPath = path.join(userCodePath, fileName);

        // Write code to file
        fs.writeFileSync(fullPath, code);

        // Get the Docker command based on language
        const dockerCommand = getDockerCommand(language, fullPath, userInput);

        // Execute code and stream the output to the WebSocket
        const process = exec(dockerCommand);

        // Stream stdout to the terminal
        process.stdout.on('data', (data) => {
            ws.send(data.toString());
        });

        // Stream stderr to the terminal
        process.stderr.on('data', (data) => {
            ws.send(data.toString());
        });

        // Handle process exit
        process.on('exit', () => {
            fs.unlinkSync(fullPath); // Cleanup the code file after execution
        });
    });
});

// Function to get the Docker command based on the language
const getDockerCommand = (language, codePath, userInput) => {
    switch (language) {
        case 'python':
            return `echo "${userInput}" | docker run --rm -v ${path.dirname(codePath)}:/code python:3 python /code/$(basename ${codePath})`;
        case 'cpp':
            return `docker run --rm -v ${path.dirname(codePath)}:/code gcc:latest bash -c "g++ /code/$(basename ${codePath}) -o /code/output && echo '${userInput}' | /code/output"`;
        default:
            throw new Error('Unsupported language');
    }
};

// Start server on port 3000
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
