const API = "http://localhost:8080/api/user";

function checkUserToken() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
        window.location.href = "index.html";
    }
}


checkUserToken();