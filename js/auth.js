const API = "https://api-onav.azurewebsites.net/api/user";

function checkUserToken() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
        window.location.href = "index.html";
    }
}


checkUserToken();