const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { executeCode } = require('./execute');

const app = express();
const port = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

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
