const API = 'https://api-onav.azurewebsites.net/api/user';
import { getToken } from './getToken.js';
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('loginForm').addEventListener('submit', login);
});

function login(event) {
    event.preventDefault();
    const usernameField = document.getElementById("usernameField").value;
    const passwordField = document.getElementById("passwordField").value;
    let payload = {
        username: usernameField,
        password: passwordField
    };
    payload = JSON.stringify(payload);
    fetch(`${API}/login`, {
        method: "POST",
        body: payload,
        headers: {'content-type': 'application/json'}
    })
        .then(function (res) {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error('Wrong username or password');
            }
        })
        .then(async function (data) {
            console.log(data);
            localStorage.setItem('user', JSON.stringify(data));
            const user = await getUserByToken()
            if (user.role === 'MANAGER' || user.role === 'HEADCHEF'){
                window.location.href = "admin.html";
            } else{
                window.location.href = "events.html";
            }
        })
        .catch(function (error) {
            console.log(error.message, "red");
        });
}


function getUserByToken(){
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

function logout(event) {
    event.preventDefault();

    window.location.href = "index.html";
    localStorage.removeItem('user');
}
