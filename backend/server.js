const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const userCodePath = path.join(__dirname, 'user_code');
if (!fs.existsSync(userCodePath)) {
    fs.mkdirSync(userCodePath);
}

wss.on('connection', (ws) => {
    console.log("New client connected");

    ws.on('message', (message) => {
        const { code, language, userInput } = JSON.parse(message);
        const fileName = `user_code.${language === 'python' ? 'py' : 'cpp'}`;
        const fullPath = path.join(userCodePath, fileName);

        // Write user code to file
        fs.writeFileSync(fullPath, code);

        // Log the code to be executed
        console.log(`Code written to ${fullPath}`);

        // Get the Docker command
        const dockerCommand = getDockerCommand(language, fullPath, userInput);

        console.log(`Running Docker command: ${dockerCommand}`);

        // Execute the code using Docker
        const process = exec(dockerCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing the code: ${error.message}`);
                ws.send(`Error: ${error.message}`);
                return;
            }

            if (stderr) {
                console.error(`stderr: ${stderr}`);
                ws.send(`stderr: ${stderr}`);
            }

            if (stdout) {
                console.log(`stdout: ${stdout}`);
                ws.send(stdout); // Send the output back to the frontend
            }
        });

        process.on('exit', () => {
            fs.unlinkSync(fullPath); // Clean up the code file after execution
        });
    });
});

// Function to generate the Docker command based on language
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

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
