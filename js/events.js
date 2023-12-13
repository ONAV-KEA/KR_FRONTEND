import { getToken } from './getToken.js';
const API = "https://api-onav.azurewebsites.net/api";
const PAGE_SIZE = 6;
let sortColumn = "startDate";
let sortDirection = 'asc';

async function getAllEventsByDepartmentId(page = 0, size = PAGE_SIZE, sort = sortColumn) {
    const user = await getUserByToken()
    const departmentId = user.department.id
    
    return await fetch(`${API}/event/department/${departmentId}?page=${page}&size=${size}&sort=${sort},${sortDirection}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`

        }
    })
        .then(response => response.json())
        .then(data => {
            makeCards(data.content);
            displayPagination(data.totalPages, page);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            throw error;
        });
}

function getUserByToken(){
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        }
    }
    return fetch(`${API}/user?token=${getToken()}`, options)
    .then(res => res.json())
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
        getAllEventsByDepartmentId(page);
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    await getAllEventsByDepartmentId();
});

async function makeCards(events) {
    const user = await getUserByToken();
    const cards = await Promise.all(events.map(async event => {
        const isParticipating = await isUserParticipating(user.id, event.id);
        let dateText = formatDate(event.startDate);

        if (event.endDate && event.startDate !== event.endDate) {
            dateText += ` - ${formatDate(event.endDate)}`;
        }

        let participatingText = isParticipating ? "Du deltager" : "Du deltager ikke";
        return `
        <div class="col-md-4 mb-4">
            <a href="/event.html?id=${event.id}" class="card-link">
                <div class="card">
                    <img src="${event.imgRef === "" ? "../assets/images/coming-soon.png" : event.imgRef}" 
                    class="card-img-top" alt="" style="max-width: 100%; height: 350px; object-fit: cover;">
                    <div class="date-square">${dateText}</div>
                        <div class="participating-square">${participatingText}</div>
                            <div class="card-body">
                                <h5 class="card-title">${event.name}</h5>
                                <p class="card-text">${event.location}</p>
                            </div>
                        </div>
                    </a>
                </div>
        </div>
        `;
    }));

    const cardContainer = document.getElementById("cardsRow");
    cardContainer.innerHTML = cards.join("");
}

async function isUserParticipating(userId, eventId) {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        }
    }
    return fetch(`${API}/event/participating/${userId}/${eventId}`, options)
    .then(res => res.json())
}





function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

