const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { executeCode } = require('./execute');

const app = express();
const port = 3000;

// Serve static files (HTML, CSS, JS) from the 'frontend' directory
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

// This line is not strictly necessary as Express will serve 'index.html' by default
// for the root route. But it's here just to be explicit about the route.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
