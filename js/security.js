import {getUserByToken} from "./auth.js";

const API = 'http://localhost:8080/api/user';
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


function getToken(){
    const localstorage_user = JSON.parse(localStorage.getItem('user'))
    return  localstorage_user.token
}

function logout(event) {
    event.preventDefault();

    window.location.href = "index.html";
    localStorage.removeItem('user');
}
