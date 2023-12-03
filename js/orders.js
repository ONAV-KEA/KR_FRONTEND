fetch(`/participating/${eventId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Fetch error');
        }
        return response.json();
    })
    .then(data => {
        const confirmedAttendeesCount = data.length;
        updateConfirmedAttendanceCount(confirmedAttendeesCount);
    })
    .catch(error => {
        console.error('There was a problem with the fetch: ', error);
    });

const updateConfirmedAttendanceCount = (count) => {
    const countElement = document.getElementById('confirmedAttendanceCount');
    if (countElement) {
        countElement.textContent = count;
    }
};