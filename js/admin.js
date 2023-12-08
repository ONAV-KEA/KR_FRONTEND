const API = "http://localhost:8080/api"
const PAGE_SIZE = 10;
let sortColumn = "name";
let sortDirection = 'asc';

function encode(str) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    return str;
}

document.getElementById('adminLink').addEventListener('click', (evt) => {
    document.getElementById('main').innerHTML = '';
    //Change the button display
    document.getElementById("add-event-btn").style.display = "block";
    // create bootstrap table
    const table = document.createElement('table');
    table.id = 'events-table';
    table.classList.add('table', 'table-striped', 'table-hover', 'w-75');
    table.innerHTML = `
        <thead>
            <tr>
                <th id="sort-name">Event Name</th>
                <th id="sort-startDate">Start Date</th>
                <th id="sort-endDate">End Date</th>
                <th id="sort-location">Location</th>
                <th>View Event</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
        </thead>
        <tbody id="events-table-body"></tbody>
    `;
    document.getElementById('main').appendChild(table);

    // create pagination
    const pagination = document.createElement('ul');
    pagination.classList.add('pagination', 'justify-content-center');
    pagination.id = 'pagination';
    document.getElementById('main').appendChild(pagination);

    getAllEvents();
});

// admin.js
document.getElementById('ordersLink').addEventListener('click', async (evt) => {
        evt.preventDefault();
    const script = document.createElement('script');
        script.id = 'ordersScript';
        script.src = 'js/orders.js';
        script.type = 'module';
        document.body.appendChild(script);

        // Wait for the script to load
        await new Promise(resolve => script.onload = resolve);
    // Call the setup function
    import('./orders.js').then(module => {
            module.setupOrdersLink(evt);
        });
});

document.getElementById('userLink').addEventListener('click', async (evt) => {
    evt.preventDefault();

        const script = document.createElement('script');
        script.id = 'usersScript';
        script.src = 'js/users.js';
        script.type = 'module';
        document.body.appendChild(script);

        // Wait for the script to load
        await new Promise(resolve => script.onload = resolve);

        // Call the setup function
        import('./users.js').then(module => {
            module.setupUserLink(evt);
        });

});

document.addEventListener("DOMContentLoaded", async () => {
    const departments = await getAllDepartments();
    const departmentSelect = document.getElementById("eventDepartments");

    departments.forEach(department => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = department.id;
        checkbox.value = department.name;
        checkbox.className = "form-check-input";

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.className = "form-check-label";
        label.textContent = department.name;

        const div = document.createElement("div");
        div.className = "form-check";
        div.appendChild(checkbox);
        div.appendChild(label);

        departmentSelect.appendChild(div);
    });
});
document.getElementById("openbtn").addEventListener("click", openNav);
document.getElementById("closebtn").addEventListener("click", closeNav);
document.getElementById("add-event-btn").addEventListener("click", showAddEventModal);
document.getElementById("search-image-btn").addEventListener("click", searchUnsplashImage);

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
    document.getElementById("mySidebar").style.width = "180px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}

function resetModal() {
    document.getElementById("eventName").value = "";
    document.getElementById("eventDescription").value = "";
    document.getElementById("eventStartDate").value = "";
    document.getElementById("eventEndDate").value = "";
    document.getElementById("eventLocation").value = "";
    document.getElementById("eventImg").value = "";
    document.getElementById("imageToDisplay").src = "";
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
    document.getElementById("eventImg").value = event.imgRef;
    document.getElementById("imageToDisplay").src = event.imgRef;

    // Uncheck all checkboxes
    const checkboxes = document.querySelectorAll('#eventDepartments .form-check-input');
    checkboxes.forEach(checkbox => checkbox.checked = false);

    // Check the checkboxes for the departments of the event
    event.departments.forEach(department => {
        const checkbox = document.getElementById(department.id);
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    eventBtn.innerHTML = "Save changes";
    if (event.imgRef) {
        const imageContainer = document.getElementById("imageToDisplay");
        imageContainer.src = event.imgRef;
        selectedImageUrl = event.imgRef;
    }
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
                <button class="btn btn-primary btn-sm">View Event <i class="fa fa-eye"></i></button>
            </td>
            <td>
                <button class="btn btn-outline-primary btn-sm btn-edit-event" data-event="${event.id}">Edit <i class="fa fa-pencil"></i></button>
            </td>
            <td>
                <button class="btn btn-danger btn-sm btn-delete-event" data-event="${event.id}">Delete <i class="fa fa-trash"></i></button>
            </td>
        </tr>
        `;
    });
   
    tableBody.innerHTML = rows.join("");
    handleCrudClicks();
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
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`

        }
    }
    return await fetch(`${API}/event/${id}`, options)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('Error fetching event:', error);
            throw error;
        });
}

async function getAllDepartments() {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`

        }
    }
    return await fetch(`${API}/department`, options)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('Error fetching departments:', error);
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
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        }
    };

    fetch(`${API}/event/${eventId}`, options)
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

let selectedImageUrl = '';

async function searchUnsplashImage() {
    const searchQuery = document.getElementById("eventImg").value.trim();

    if (searchQuery === "") {
        // Handle empty search query
        console.log("Empty search query");A
        return;
    }

    const imageContainer = document.getElementById("imageToDisplay");
    imageContainer.src = ""; // Clear previous image (if any)

    const imageUrl = await getUnsplashImage(searchQuery);
    imageContainer.src = imageUrl; // Display fetched image in an <img> element
    console.log("Fetched image URL:", imageUrl);

    selectedImageUrl = imageUrl;
}

async function getUnsplashImage(searchQuery) {
    const apiKey = "ghdemshFN49d3S0RbExlmtShkG5MK0e9-o6fzqk1-ns";
    const unsplashRequestUrl = `https://api.unsplash.com/search/photos?query=${searchQuery}&client_id=${apiKey}`;

    try {
        const response = await fetch(unsplashRequestUrl);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.results.length);
            return data.results[randomIndex].urls.regular;
        }
        return "https://via.placeholder.com/250x350";
    } catch (error) {
        console.error("Error fetching images from Unsplash:", error);
        return "https://via.placeholder.com/250x350";
    }
}

async function handleEvent(evt) {
    const myModalEl = document.getElementById('event-modal');
    const myModal = new bootstrap.Modal(document.getElementById('event-modal'));

    let checkedDepartments = document.querySelectorAll("#eventDepartments input:checked");

    if (checkedDepartments.length === 0) {
        checkedDepartments = document.querySelectorAll("#eventDepartments input");
    }

    let eventData = {
        name: encode(document.getElementById("eventName").value),
        startDate: encode(document.getElementById("eventStartDate").value),
        endDate: encode(document.getElementById("eventEndDate").value === "" ? document.getElementById("eventStartDate").value : document.getElementById("eventEndDate").value),
        description: encode(document.getElementById("eventDescription").value),
        location: encode(document.getElementById("eventLocation").value),
        imgRef: encode(selectedImageUrl),
        departments: Array.from(checkedDepartments).map(department => {
            return {
                id: parseInt(department.id),
                name: department.value
            };
        })        
    };

    if (myModalEl.getAttribute('data-mode') === 'add') {
        addEvent(eventData);
    } else {
        const eventId = evt.currentTarget.dataset.eventId;
        editEvent(eventId, eventData);
    }
}

function editEvent(eventId, eventData) {
    console.log(eventData);
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(eventData),
    };

    console.log(options);

    fetch(`${API}/event/${eventId}`, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error updating event');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            getAllEvents();
        })
        .catch(error => {
            console.error('Error updating event:', error);
        });
}


function addEvent(eventData) {
    const myModal = new bootstrap.Modal(document.getElementById('event-modal'));

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(eventData)
    };

    fetch(`${API}/event`, options)
        .then(response => {
            if (!response.ok) {
                showErrorMessage('Error adding event!');
            } else{
                showConfirmationMessage('Event successfully added!');
            }
            getAllEvents();
        })
    myModal.hide();
}

function getToken(){
    const localstorage_user = JSON.parse(localStorage.getItem('user'))
    return  localstorage_user.token
}

function showConfirmationMessage(message) {
    const confirmationMessage = document.getElementById('confirmation-message');
    confirmationMessage.textContent = message;
    confirmationMessage.style.display = 'block';
    setTimeout(() => {
        confirmationMessage.style.display = 'none';
    }, 2000); // Adjust the duration as needed
}

function showErrorMessage(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 2000); // Adjust the duration as needed
}

getAllEvents(0);
