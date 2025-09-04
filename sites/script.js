document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      body.classList.toggle('light-mode');
    });
  }
});
