const API = "http://localhost:8080/api/user";

function checkUserToken() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
        window.location.href = "index.html";
    }
}

export function getUserByToken(){
    const localstorage_user = JSON.parse(localStorage.getItem('user'))
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localstorage_user.token}`
        }
    }
    return fetch(`${API}?token=${localstorage_user.token}`, options)
    .then(res => res.json())
}


checkUserToken();