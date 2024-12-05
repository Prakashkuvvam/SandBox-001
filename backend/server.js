const express = require('express');
const bodyParser = require('body-parser');
const { executeCode } = require('./execute');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/execute', async (req, res) => {
    const { code, language } = req.body;

    try {
        const result = await executeCode(code, language);
        res.json({ output: result });
    } catch (error) {
        res.status(500).json({ output: 'Error executing code' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
