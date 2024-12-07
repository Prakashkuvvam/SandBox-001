const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { executeCode } = require('./execute');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(bodyParser.json());

app.post('/execute', async (req, res) => {
    const { code, language, input } = req.body;

    try {
        const result = await executeCode(code, language, input);
        res.json({ output: result });
    } catch (error) {
        res.status(500).json({ output: 'Error executing code' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
