// get id from url
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const API = 'http://localhost:8080/api/event';

document.addEventListener("DOMContentLoaded", async () => {
    const event = await getEventById(id);

    let dateText = formatDate(event.startDate);

        if (event.endDate && event.startDate !== event.endDate) {
            dateText += ` - ${formatDate(event.endDate)}`;
        }

    document.getElementById("event-title").innerText = event.name;
    document.getElementById("event-image").src = event.imgRef ? event.imgRef : "../assets/images/coming-soon.png";
    document.getElementById("event-description").innerText = event.description;
    document.getElementById("event-date").innerText = dateText;
    document.getElementById("form-title").innerText = `Vil du deltage i ${event.name}?`;
})

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

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}