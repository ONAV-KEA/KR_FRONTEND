const API = "http://localhost:8080/api/event"
const PAGE_SIZE = 10;
let sortColumn = "name";
let sortDirection = 'asc';

document.getElementById("openbtn").addEventListener("click", openNav);
document.getElementById("closebtn").addEventListener("click", closeNav);
document.getElementById("add-event-btn").addEventListener("click", showAddEventModal);

document.getElementById('header-row').onclick = function (evt) {
    const id = evt.target.id;
    if(!id.startsWith('sort-')) return;
    sortColumn = id.substring(5);
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    getAllEvents();
};

function handleCrudClicks() {
    document.querySelectorAll(".btn-delete-event").forEach(button => {
        button.removeEventListener("click", deleteEvent);
        button.addEventListener("click", deleteEvent);
    });

    document.querySelectorAll(".btn-edit-event").forEach(button => {
        button.removeEventListener("click", showEditEventModal);
        button.addEventListener("click", showEditEventModal);
    });
}

function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.getElementById("openbtn").style.display = "none";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
    document.getElementById("openbtn").style.display = "block";
}

function resetModal() {
    document.getElementById("eventName").value = "";
    document.getElementById("eventDescription").value = "";
    document.getElementById("eventStartDate").value = "";
    document.getElementById("eventEndDate").value = "";
    document.getElementById("eventLocation").value = "";
    document.getElementById("eventImg").value = "";
}

function showAddEventModal() {
    resetModal();
    const myModalEl = document.getElementById('event-modal');
    const myModal = new bootstrap.Modal(myModalEl);
    myModalEl.setAttribute('data-mode', 'add');
    document.getElementById("event-modal-title").innerHTML = "Add event";
    let eventBtn = document.getElementById("btn-add-event");
    eventBtn.innerHTML = "Add event";
    eventBtn.removeEventListener("click", handleEvent);
    eventBtn.addEventListener("click", handleEvent);
    myModal.show();
}

async function showEditEventModal(evt) {
    resetModal();
    const eventId = evt.currentTarget.getAttribute("data-event");
    const event = await getEventById(eventId);
    const myModalEl = document.getElementById('event-modal');
    const myModal = new bootstrap.Modal(myModalEl);
    myModalEl.setAttribute('data-mode', 'edit');
    let eventBtn = document.getElementById("btn-add-event");
    eventBtn.dataset.eventId = eventId;  // Set eventId to button's dataset
    eventBtn.removeEventListener("click", handleEvent);
    eventBtn.addEventListener("click", handleEvent);
    document.getElementById("event-modal-title").innerHTML = "Edit event";
    document.getElementById("eventName").value = event.name;
    document.getElementById("eventDescription").value = event.description;
    document.getElementById("eventStartDate").value = event.startDate;
    document.getElementById("eventEndDate").value = event.endDate;
    document.getElementById("eventLocation").value = event.location;
    eventBtn.innerHTML = "Save changes";
    myModal.show();
}


async function makeEventRows(events) {
    const tableBody = document.getElementById("events-table-body");
   
    const rows = events.map(event => {
        return `
        <tr>
            <td>${event.name}</td>
            <td>${event.startDate}</td>
            <td>${event.endDate}</td>
            <td>${event.location}</td>
            <td>
                <button class="btn btn-primary btn-sm">View Event</button>
            </td>
            <td>
                <button class="btn btn-warning btn-sm btn-edit-event" data-event="${event.id}">Edit</button>
            </td>
            <td>
                <button class="btn btn-danger btn-sm btn-delete-event" data-event="${event.id}">Delete</button>
            </td>
        </tr>
        `;
    });
   
    tableBody.innerHTML = rows.join("");
    handleCrudClicks();
}

async function getAllEvents(page = 0, size = PAGE_SIZE, sort = sortColumn) {
    return await fetch(`${API}?page=${page}&size=${size}&sort=${sort},${sortDirection}`)
        .then(response => response.json())
        .then(data => {
            makeEventRows(data.content);
            displayPagination(data.totalPages, page);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            throw error;
        });
}

async function getEventById(id) {
    return await fetch(`${API}/${id}`)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('Error fetching event:', error);
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
        getAllEvents(page);
    }
};

function deleteEvent(evt) {
    const eventId = evt.currentTarget.getAttribute("data-event");
    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch(`${API}/${eventId}`, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // The delete request was successful, now call getAllEvents
            getAllEvents();
        })
        .catch(error => {
            console.error('Error deleting event:', error);
        });
    }

    function handleEvent(evt) {
        const myModalEl = document.getElementById('event-modal');
        const myModal = new bootstrap.Modal(document.getElementById('event-modal'));
        if (myModalEl.getAttribute('data-mode') === 'add') {
            addEvent();
        } else {
            const eventId = evt.currentTarget.dataset.eventId;  // Get eventId from button's dataset
            editEvent(eventId);
        }
    }
    

function editEvent(eventId) {
    const myModal = new bootstrap.Modal(document.getElementById('event-modal'));
    const eventData = {
        name: document.getElementById("eventName").value,
        startDate: document.getElementById("eventStartDate").value,
        endDate: document.getElementById("eventEndDate").value,
        description: document.getElementById("eventDescription").value,
        location: document.getElementById("eventLocation").value,
        imgRef: document.getElementById("eventImg").value
    }
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
    }
    fetch(`${API}/${eventId}`, options)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        getAllEvents();
    })
    myModal.hide();
}

function addEvent() {
    const myModal = new bootstrap.Modal(document.getElementById('event-modal'));
    const eventData = {
        name: document.getElementById("eventName").value,
        startDate: document.getElementById("eventStartDate").value,
        endDate: document.getElementById("eventEndDate").value,
        description: document.getElementById("eventDescription").value,
        location: document.getElementById("eventLocation").value,
        imgRef: document.getElementById("eventImg").value
    }
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
    }
    fetch(`${API}`, options)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        getAllEvents();
    })
    myModal.hide();
}

getAllEvents(0);
