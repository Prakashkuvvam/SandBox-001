const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const executeCode = (code, language, userInput = '') => {
    return new Promise((resolve, reject) => {
        const userCodePath = path.join(__dirname, 'user_code');
        const fileName = `user_code.${language === 'python' ? 'py' : 'cpp'}`;
        const fullPath = path.join(userCodePath, fileName);

        if (!fs.existsSync(userCodePath)) {
            fs.mkdirSync(userCodePath);
        }

        fs.writeFileSync(fullPath, code);

        const dockerCommand = getDockerCommand(language, fullPath).split(' ');

        const process = spawn(dockerCommand[0], dockerCommand.slice(1), { stdio: ['pipe', 'pipe', 'pipe'] });
        let output = '';

        // Feed user input dynamically
        if (userInput) {
            process.stdin.write(userInput + '\n');
        }
        process.stdin.end();

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            output += data.toString();
        });

        process.on('close', (code) => {
            fs.unlinkSync(fullPath);
            code === 0 ? resolve(output) : reject(output);
        });
    });
};

const getDockerCommand = (language, codePath) => {
    switch (language) {
        case 'python':
            return `docker run --rm -i -v ${codePath}:/code python:3 python /code`;
        case 'cpp':
            return `docker run --rm -i -v ${path.dirname(codePath)}:/code gcc:latest bash -c "g++ /code/$(basename ${codePath}) -o /code/output && /code/output"`;
        default:
            throw new Error('Unsupported language');
    }
};

module.exports = { executeCode };
