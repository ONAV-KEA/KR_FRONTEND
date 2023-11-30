document.addEventListener("DOMContentLoaded", function () {
    updateLoginLinks();
});

function updateLoginLinks() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        // User is logged in
        const loginLinks = document.querySelectorAll('#loginLink');
        loginLinks.forEach(link => {
            link.textContent = 'Logout';
            link.removeEventListener('click', handleLogin);
            link.addEventListener('click', handleLogout);
        });
    } else {
        // User is not logged in
        const loginLinks = document.querySelectorAll('#loginLink');
        loginLinks.forEach(link => {
            link.textContent = 'Login';
            link.removeEventListener('click', handleLogout);
            link.addEventListener('click', handleLogin);
        });
    }
}

function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem('user');
    window.location.href = "index.html";
}

function handleLogin(event) {
    event.preventDefault();
    window.location.href = "login.html";
}