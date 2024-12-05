document.getElementById('codeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const code = document.getElementById('codeInput').value;
    const language = document.getElementById('languageSelect').value;
    const resultElement = document.getElementById('result');
    const loadingElement = document.getElementById('loading');

    // Show the loading indicator
    loadingElement.classList.remove('hidden');
    resultElement.textContent = '';  // Clear previous result

    // Send the code to the backend for execution
    fetch('/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
    })
    .then(response => response.json())
    .then(data => {
        // Hide the loading indicator
        loadingElement.classList.add('hidden');
        
        // Show the result of the code execution
        resultElement.textContent = data.output;
    })
    .catch(error => {
        // Hide the loading indicator in case of error
        loadingElement.classList.add('hidden');
        
        resultElement.textContent = 'Error executing code: ' + error.message;
    });
});
