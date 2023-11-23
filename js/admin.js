const API = "http://localhost:8080/api/event"
const PAGE_SIZE = 10;
let sortColumn = "name";
let sortDirection = 'asc';
let name = "";
let startDate = "";
let endDate = "";
let loc = "";

document.getElementById("openbtn").addEventListener("click", openNav);
document.getElementById("closebtn").addEventListener("click", closeNav);
document.getElementById("add-event-btn").addEventListener("click", showAddEventModal);

document.getElementById('header-row').onclick = function (evt) {
    const id = evt.target.id;
    if(!id.startsWith('sort-')) return;
    //TODO handle sorting here
      sortColumn = id.substring(5);
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    getAllEvents();
  };

  function handleCrudClicks(){
    document.querySelectorAll(".btn-delete-event").forEach(button => {
        button.removeEventListener("click", deleteEvent);
        button.addEventListener("click", deleteEvent);
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

function showAddEventModal() {
    const myModal = new bootstrap.Modal(document.getElementById('event-modal'));
    document.getElementById("event-modal-title").innerHTML = "Add event";
    document.getElementById("btn-add-event").addEventListener("click", addEvent);
    myModal.show()
}

function addEvent() {
    const myModal = new bootstrap.Modal(document.getElementById('event-modal'));
    const title = document.getElementById("eventName").value;
    const description = document.getElementById("eventDescription").value;
    const startDate = document.getElementById("eventStartDate").value;
    const endDate = document.getElementById("eventEndDate").value;
    const location = document.getElementById("eventLocation").value;
    const image = document.getElementById("eventImg").value;
    const eventData = {
        name: title,
        description: description,
        startDate: startDate,
        endDate: endDate,
        location: location,
        imgRef: image
    }

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // TODO: add authorization header
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
                <button class="btn btn-warning btn-sm">Edit</button>
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
            console.log(data);
            makeEventRows(data.content);
            displayPagination(data.totalPages, page);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            throw error; // Rethrow the error to propagate it to the caller
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
    console.log(eventId);
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
            // You might want to handle the error here or log it
        });
}


getAllEvents(0);
