const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const executeCode = (code, language) => {
    return new Promise((resolve, reject) => {
        const userCodePath = path.join(__dirname, 'user_code');
        const fileName = `user_code.${language === 'python' ? 'py' : 'cpp'}`;
        const fullPath = path.join(userCodePath, fileName);

        // Ensure the directory exists
        if (!fs.existsSync(userCodePath)) {
            fs.mkdirSync(userCodePath);
        }

        // Write code to the file
        fs.writeFileSync(fullPath, code);

        // Docker command to run code inside a container
        const dockerCommand = getDockerCommand(language, fullPath);

        // Execute the command
        exec(dockerCommand, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout);
            }

            // Clean up the code file after execution, only if it exists
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });
    });
};

// Get the Docker command based on the language
const getDockerCommand = (language, codePath) => {
    switch (language) {
        case 'python':
            return `docker run --rm -v ${codePath}:/code python:3 python /code`;
        case 'cpp':
            return `docker run --rm -v ${codePath}:/code gcc:latest bash -c "g++ /code -o /code/output && /code/output"`;
        default:
            throw new Error('Unsupported language');
    }
};

module.exports = { executeCode };
