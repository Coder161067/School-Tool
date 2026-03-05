const toggleButton = document.getElementById('toggleButton');
const content = document.getElementById('content');

toggleButton.addEventListener('click', function() {
    content.classList.toggle('dark-mode');
});