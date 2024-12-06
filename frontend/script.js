// Import the terminal and fit addon from XTerm
const { Terminal } = require('xterm');
const { fit } = require('xterm/lib/addons/fit/fit');  // To automatically fit the terminal to the container

// Create and open a new terminal instance
const terminal = new Terminal({
    cursorBlink: true,       // Enable cursor blink
    scrollback: 1000,        // Number of scrollback lines
    rows: 20,                // Number of terminal rows
    cols: 100,               // Number of terminal columns
});

// Open the terminal inside the 'terminal-container' div
terminal.open(document.getElementById('terminal-container'));

// Fit the terminal to the size of the container
fit(terminal);

// Establish a WebSocket connection to the backend
const socket = new WebSocket('ws://localhost:3000');

// When the WebSocket connection is open
socket.onopen = () => {
    console.log("Connected to WebSocket server");
    terminal.write('Connection established. You can run your code...\n');
};

// Handle incoming messages (output from executed code)
socket.onmessage = (event) => {
    const data = event.data;  // Data received from the server
    terminal.write(data);     // Write data to terminal
};

// If the WebSocket is closed
socket.onclose = () => {
    console.log("Disconnected from WebSocket server");
};

// Function to run the code when the user clicks the "Run" button
function runCode() {
    // Get the code, language, and user input from the HTML page
    const code = document.getElementById('code-input').value;
    const language = document.getElementById('language-select').value;
    const userInput = document.getElementById('user-input').value;

    // Prepare the message to be sent to the backend
    const message = {
        code: code,            // Code entered by the user
        language: language,    // Selected language (python/cpp)
        userInput: userInput   // User input (e.g., for input() in Python or cin in C++)
    };

    // Send the message as a stringified JSON object to the WebSocket server
    socket.send(JSON.stringify(message));

    // Display loading text in the terminal
    terminal.write('Running your code...\n');
}

// Set up event listeners for the "Run" button and other controls
document.getElementById('run-btn').addEventListener('click', runCode);
