const API = "http://localhost:8080/api/event"
const PAGE_SIZE = 9;
let sortColumn = "startDate";
let sortDirection = 'asc';

async function getAllEvents(page = 0, size = PAGE_SIZE, sort = sortColumn) {
    return await fetch(`${API}?page=${page}&size=${size}&sort=${sort},${sortDirection}`)
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

document.addEventListener("DOMContentLoaded", async () => {
    await getAllEvents(page = 0, size = PAGE_SIZE, sort = sortColumn);
});

function makeCards(events) {
    const cards = events.map(event => {
        let dateText = formatDate(event.startDate);

        if (event.endDate && event.startDate !== event.endDate) {
            dateText += ` - ${formatDate(event.endDate)}`;
        }
        return `
        <div class="col-md-4 mb-4">
            <a href="/events/${event.id}" class="card-link">
                <div class="card" style="width: 18rem; position: relative;">
                    <img src="${event.imgRef === "" ? "../assets/images/coming-soon.png" : event.imgRef}" class="card-img-top" alt="">
                    <div class="date-square">${dateText}</div>
                    <div class="card-body">
                        <h5 class="card-title">${event.name}</h5>
                        <p class="card-text">${event.location}</p>
                    </div>
                </div>
            </a>
        </div>
        `;
    });

    const cardContainer = document.getElementById("cardsRow");
    cardContainer.innerHTML = cards.join("");

    const cardLinks = document.querySelectorAll('.card-link');
    cardLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const eventUrl = this.getAttribute('href');
            history.pushState({}, null, eventUrl);
            // TODO: Fetch the event and render it and remove everything else
            
        });
    });
}





function formatDate(dateString) {
    // Assuming your date is in a string format, you may need to format it accordingly
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

