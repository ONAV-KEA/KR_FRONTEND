const api = "http://localhost:8080/api/event"

document.getElementById("openbtn").addEventListener("click", openNav);
document.getElementById("closebtn").addEventListener("click", closeNav);
document.getElementById("add-event-btn").addEventListener("click", showAddEventModal);

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
    fetch(`${api}`, options)
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    myModal.hide();
}