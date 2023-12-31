import { getToken } from './getToken.js';
import { showConfirmationMessage, showErrorMessage } from './admin.js';

const API = "https://api-onav.azurewebsites.net/api";
const PAGE_SIZE = 10;
let sortColumn = "name";
let sortDirection = 'asc';

export async function setupUserLink(evt) {
    evt.preventDefault();
    document.getElementById('main').innerHTML = '';

    const row = document.createElement('div');
    row.classList.add('row', 'my-3', 'justify-content-between');

    const tableColumn = document.createElement('div');
    tableColumn.classList.add('col-xl-6');
    const header = document.createElement('h3');
    header.classList.add('text-center');
    header.innerHTML = 'Current Users';
    const table = document.createElement('table');
    table.id = 'users-table';
    table.classList.add('table', 'table-striped', 'table-hover', 'm-4');
    table.innerHTML = `
        <thead>
            <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Department</th>
                <th></th>
            </tr>
        </thead>
        <tbody id="users-table-body"></tbody>
    `;
    tableColumn.appendChild(header);
    tableColumn.appendChild(table);

    const formColumn = document.createElement('div');
    formColumn.classList.add('col-xl-4');
    const formContainer = document.createElement('div');
    formContainer.classList.add('w-100', 'p-3'); // Adjust styling as needed

    const form = document.createElement('form');
    form.id = 'user-form';
    form.innerHTML = `
        <h3 class="text-center">Create New User</h3>
        <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input type="text" class="form-control" id="name" name="name" required>
        </div>
        <div class="mb-3">
            <label for="email" class="form-label">Email Address</label>
            <input type="email" class="form-control" id="email" name="email" required>
        </div>
        <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" name="password">
        </div>
        <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" class="form-control" id="username" name="username" required>
        </div>
        <div class="mb-3">
            <label for="role" class="form-label">Role</label>
            <select class="form-select" id="role" name="role" required>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="HEADCHEF">HEADCHEF</option>
                <option value="MANAGER">MANAGER</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="department" class="form-label">Department</label>
            <select class="form-select" id="department" name="department" required>
                <option value="1">IT</option>
                <option value="2">Økonomi</option>
                <option value="3">Advokat</option>
                <option value="4">Køkken</option>
                <option value="5">P&D</option>
            </select>
        </div>
        
        <button type="submit" class="btn btn-primary" id="btn-create-user">Create</button>
    `;
    formContainer.appendChild(form);
    formColumn.appendChild(formContainer);

    row.appendChild(tableColumn);
    row.appendChild(formColumn);
    document.getElementById('main').appendChild(row);

    const pagination = document.createElement('ul');
    pagination.classList.add('pagination', 'justify-content-center', 'mt-3');
    pagination.id = 'pagination';
    document.getElementById('main').appendChild(pagination);

    const confirmationMessage = document.createElement('div');
    confirmationMessage.id = 'confirmation-message';
    confirmationMessage.className = 'confirmation-message'
    document.getElementById('main').appendChild(confirmationMessage);

    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message';
    errorMessage.className = 'error-message'
    document.getElementById('main').appendChild(errorMessage);

    handleCrudClicks(evt);
    await getAllUsers();
}

async function makeUserRows(users) {
    document.getElementById("add-event-btn").style.display = "none";

    const tableBody = document.getElementById("users-table-body");

    const rows = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>${user.department.name}</td>
            <td>
                <button class="btn btn-danger btn-sm btn-delete-user" data-event="${user.id}">Delete <i class="fa fa-trash"></i></button>
            </td>
        </tr>
    `);

    tableBody.innerHTML = rows.join("");
}

export async function getAllUsers(page = 0, size = PAGE_SIZE, sort = sortColumn) {
    return await fetch(`${API}/user/getAllUsers?page=${page}&size=${size}&sort=${sort},${sortDirection}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        }
    })
        .then(response => response.json())
        .then(data => {
            makeUserRows(data.content);
            displayPagination(data.totalPages, page);
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            throw error;
        });
}

function displayPagination(totalPages, currentPage) {
    let paginationHtml = '';
    const paginationElement = document.getElementById('pagination');

    if (currentPage > 0) {
        paginationHtml += `<li class="page-item"><a class="page-link" data-page="${currentPage - 1}" href="#">Previous</a></li>`;
    }

    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHtml += `<li class="page-item active"><a class="page-link" href="#">${i + 1}</a></li>`;
        } else {
            paginationHtml += `<li class="page-item"><a class="page-link" data-page="${i}" href="#">${i + 1}</a></li>`;
        }
    }

    if (currentPage < totalPages - 1) {
        paginationHtml += `<li class="page-item"><a class="page-link" data-page="${currentPage + 1}" href="#">Next</a></li>`;
    }

    paginationElement.innerHTML = paginationHtml;
}

document.querySelector('#pagination').onclick = function (evt) {
    evt.preventDefault();
    if (evt.target.tagName === 'A' && evt.target.hasAttribute('data-page')) {
        const page = parseInt(evt.target.getAttribute('data-page'));
        getAllUsers(page).then(r => console.log(r));
    }
};


async function createUser(userData) {
    return await fetch(`${API}/user/createUser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (!response.ok) {
                showErrorMessage('Error creating user');
                throw new Error('Network response was not ok');
            }
            showConfirmationMessage('User created successfully');
            return response.json();
        })
        .catch(error => {
            showErrorMessage(error.message);
            throw error;
        });
}



async function deleteUser(id) {

    const confirmDelete = confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${API}/user/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`
            },
        });

        if (!response.ok) {
            showErrorMessage('Error deleting user');
            throw new Error('Network response was not ok');
        }

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        showConfirmationMessage('User deleted successfully');

    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

function handleCrudClicks(evt){
    evt.preventDefault();

    // Add an event listener to handle form submission
    document.getElementById('btn-create-user').addEventListener('click', async function (evt) {
        evt.preventDefault();
        console.log("submit");
        const userData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            username: document.getElementById('username').value,
            role: document.getElementById('role').value,
            department: {
                id: document.getElementById('department').value,
                // Add other department properties if needed
            }
        };
        

        console.log(userData);
    
        try {
            await createUser(userData); // Implement this function to send data to the backend
            // Optionally, refresh the user list after creation
            await getAllUsers();
        } catch (error) {
            console.error('Error creating user:', error);
        }
    });
    

document.getElementById('main').addEventListener('click', async function (evt) {
    evt.preventDefault();
    if (evt.target.matches('.btn-delete-user')) {
        const userId = evt.target.getAttribute('data-event');
        await deleteUser(userId);
        await getAllUsers();
    }
});

}




// Add an event listener to handle sorting
document.getElementById('main').addEventListener('click', async function (evt) {
    evt.preventDefault();
    if (evt.target.classList.contains('sortable')) {
        sortColumn = evt.target.getAttribute('data-column');
        sortDirection = evt.target.getAttribute('data-direction');
        try {
            await getAllUsers();
        } catch (error) {
            console.error('Error sorting users:', error);
        }
    }
});