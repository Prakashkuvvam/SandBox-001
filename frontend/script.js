const { Terminal } = require('xterm');
const { fit } = require('xterm/lib/addons/fit/fit');  // Addon to fit terminal to container

// Create a new terminal instance
const terminal = new Terminal({
    cursorBlink: true,       // Enable cursor blinking
    scrollback: 1000,        // Allow up to 1000 lines of scrollback
    rows: 20,                // Terminal rows
    cols: 100,               // Terminal columns
});

// Open terminal inside the div with ID 'terminal-container'
terminal.open(document.getElementById('terminal-container'));

// Ensure the terminal fits within the container
fit(terminal);

// Connect to the WebSocket server
const socket = new WebSocket('ws://localhost:3000');

// When the WebSocket connection is established
socket.onopen = () => {
    console.log("Connected to WebSocket server");
    terminal.write('Connection established. You can run your code...\n');
};

// When receiving a message from the server (output from backend)
socket.onmessage = (event) => {
    const data = event.data;  // Data received (code output)
    terminal.write(data);     // Write output to the terminal
};

// When the WebSocket connection is closed
socket.onclose = () => {
    console.log("Disconnected from WebSocket server");
};

// Function to run the code (triggered when the user clicks the "Run" button)
function runCode() {
    // Get code from the textarea, language selection, and user input
    const code = document.getElementById('code-input').value;
    const language = document.getElementById('language-select').value;
    const userInput = document.getElementById('user-input').value;

    // Prepare the message to send to the WebSocket server
    const message = {
        code: code,            // User code
        language: language,    // Selected language (Python or C++)
        userInput: userInput   // User input (e.g., for `input()` in Python or `cin` in C++)
    };

    // Send the message to the backend through WebSocket
    socket.send(JSON.stringify(message));

    // Display a loading message in the terminal
    terminal.write('Running your code...\n');
}

// Attach event listener to the "Run Code" button
document.getElementById('run-btn').addEventListener('click', runCode);
