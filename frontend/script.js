document.getElementById('codeForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const code = document.getElementById('codeInput').value;
    const language = document.getElementById('languageSelect').value;
    const inputData = document.getElementById('inputData').value;
    const resultElement = document.getElementById('result');
    const loadingElement = document.getElementById('loading');

    loadingElement.classList.remove('hidden');
    resultElement.textContent = '';

    fetch('/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input: inputData }),
    })
        .then((response) => response.json())
        .then((data) => {
            loadingElement.classList.add('hidden');
            resultElement.textContent = data.output;
        })
        .catch((error) => {
            loadingElement.classList.add('hidden');
            resultElement.textContent = 'Error executing code: ' + error.message;
        });
});
