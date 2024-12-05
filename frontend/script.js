function submitCode() {
    const code = document.getElementById('code').value;
    const language = document.getElementById('language').value;

    fetch('/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('output').textContent = data.output;
    })
    .catch(error => console.error('Error:', error));
}
