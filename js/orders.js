import { getToken } from './getToken.js';

const API = "https://api-onav.azurewebsites.net/api"
const PAGE_SIZE = 10;
let sortColumn = "name";
let sortDirection = 'asc';

export function setupOrdersLink(evt) {
    evt.preventDefault();
    document.getElementById('main').innerHTML = '';
    // create bootstrap table
    const table = document.createElement('table');
    table.id = 'orders-table';
    table.classList.add('table', 'table-striped', 'table-hover', 'w-75');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Event Name</th>
                <th></th>
                <th>Users participating</th>
            </tr>
        </thead>
        <tbody id="orders-table-body"></tbody>
    `;
    document.getElementById('main').appendChild(table);

    // create pagination
    const pagination = document.createElement('ul');
    pagination.classList.add('pagination', 'justify-content-center');
    pagination.id = 'pagination';
    document.getElementById('main').appendChild(pagination);

    getAllEvents();

    // set up pagination event handler
    document.querySelector('#pagination').onclick = function (evt) {
        evt.preventDefault();
        if (evt.target.tagName === 'A' && evt.target.hasAttribute('data-page')) {
            const page = parseInt(evt.target.getAttribute('data-page'));
            getAllEvents(page);
        }
    };
}

async function makeEventRows(events, eventUsersMap) {
    const tableBody = document.getElementById("orders-table-body");

    //Change the button display
    document.getElementById("add-event-btn").style.display = "none";

    const rows = events.map(event => {
        const users = eventUsersMap.get(event.id);
        let userRows = '';
        if (users) {
            userRows = users.map(user => `
                <tr>
                    <td style="padding-right: 100px;" id="username">${user.name}</td>
                    <td id="notes">${user.additionalNotes}</td>
                </tr>
            `).join("");
        }
        return `
        <tr data-event-id="${event.id}">
            <td id="event-name">${event.name}</td>
            <td>
                <button class="btn btn-primary btn-download-stats" data-event-id="${event.id}">Download CSV</button>
            </td>
            <td>
                <table>
                    <thead>
                        <tr>
                            <th style="padding-right: 100px;">User Name</th>
                            <th>Additional Notes</th>
                        </tr>
                    </thead>
                    <tbody id=user-rows">
                        ${userRows}
                    </tbody>
                </table>
                Total Users: ${users ? users.length : 0}
            </td>
        </tr>
        `;
    });
   
    tableBody.innerHTML = rows.join("");
}
async function getAllEvents(page = 0, size = PAGE_SIZE, sort = sortColumn) {
    return await fetch(`${API}/event?page=${page}&size=${size}&sort=${sort},${sortDirection}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        }
    })
        .then(response => response.json())
        .then(async data => {
            const eventUsersMap = new Map();
            for (const event of data.content) {
                const users = await fetchParticipatingUsers(event.id);
                eventUsersMap.set(event.id, users);
            }
            makeEventRows(data.content, eventUsersMap);
            displayPagination(data.totalPages, page);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            throw error;
        });
}

async function fetchParticipatingUsers(eventId) {
    return fetch(`${API}/event/participating/${eventId}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Fetch error');
            }
            return response.json();
        })
        .then(users => Promise.all(users.map(user => fetchAdditionalNotes(user, eventId))))
        .catch(error => {
            console.error('There was a problem with the fetch: ', error);
        });
}

async function fetchAdditionalNotes(user, eventId) {
    return fetch(`${API}/event/additionalNotes/${user.id}/${eventId}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Fetch error');
            }
            return response.json();
        })
        .then(notes => ({...user, additionalNotes: notes}))
        .catch(error => {
            console.error('There was a problem with the fetch: ', error);
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
        getAllEvents(page);
    }
};

// Stats section
document.addEventListener('click', function (event) {
    if (event.target.matches('.btn-download-stats')) {
        const eventId = event.target.getAttribute('data-event-id');
        showDownloadDialog(eventId);
    }
});

function showDownloadDialog(eventId) {
    const downloadAsCsv = window.confirm('Do you want to download the stats as CSV?');
    if (downloadAsCsv) {
        downloadStats(eventId);
    }
}



async function downloadStats(eventId) {
    // Fetch the event and its participating users
    const event = await fetchEvent(eventId);
    const users = await fetchParticipatingUsers(eventId);

    // Prepare CSV data
    let csvContent = "Event Name,User Name,Additional Notes\n";
    for (const user of users) {
        csvContent += `${event.name},${user.name},${user.additionalNotes}\n`;
    }

    // Create a blob from the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a link element, set its href to the blob, and click it to start the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${event.name}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function fetchEvent(eventId) {
    return fetch(`${API}/event/${eventId}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Fetch error');
            }
            return response.json();
        })
        .catch(error => {
            console.error('There was a problem with the fetch: ', error);
        });
}