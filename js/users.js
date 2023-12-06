import { getToken } from './getToken.js';

const API = "http://localhost:8080/api";
const PAGE_SIZE = 10;
let sortColumn = "name";
let sortDirection = 'asc';

export async function setupUserLink(evt) {
    evt.preventDefault();
    document.getElementById('main').innerHTML = '';
    const table = document.createElement('table');
    table.id = 'users-table';
    table.classList.add('table', 'table-striped', 'table-hover', 'w-75');
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
                <th></th>
            </tr>
        </thead>
        <tbody id="users-table-body"></tbody>
    `;
    document.getElementById('main').appendChild(table);

    const pagination = document.createElement('ul');
    pagination.classList.add('pagination', 'justify-content-center');
    pagination.id = 'pagination';
    document.getElementById('main').appendChild(pagination);

    await getAllUsers();
}

async function makeUserRows(users) {
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
                <button class="btn btn-outline-primary btn-sm btn-edit-user" data-event="${user.id}">Edit <i class="fa fa-pencil"></i></button>
            </td>
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