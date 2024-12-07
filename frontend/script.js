document.getElementById('codeForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const code = document.getElementById('codeInput').value;
    const language = document.getElementById('languageSelect').value;
    const resultElement = document.getElementById('result');
    const loadingElement = document.getElementById('loading');

    loadingElement.classList.remove('hidden');
    resultElement.textContent = '';

    fetch('/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
    })
        .then((response) => response.body)
        .then((stream) => {
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            function readChunk() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        loadingElement.classList.add('hidden');
                        return;
                    }
                    resultElement.textContent += decoder.decode(value, { stream: true });
                    readChunk();
                });
            }

            readChunk();
        })
        .catch((error) => {
            loadingElement.classList.add('hidden');
            resultElement.textContent = 'Error executing code: ' + error.message;
        });
});
