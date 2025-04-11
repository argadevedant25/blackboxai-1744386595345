// Initialize seat states
const totalSeats = 80;
const rows = 11;
const seatsPerRow = 7;
const lastRowSeats = 3;
let maxBookings = 7;
let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

// Get all booked seats from all users
function getAllBookedSeats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.flatMap(user => user.bookings);
}

// Check if seat is already booked
function isSeatBooked(seatId) {
    return getAllBookedSeats().includes(seatId);
}

// Function to update max bookings
function updateMaxBookings(value) {
    const newMax = parseInt(value) || 7;
    if (newMax < 1 || newMax > 7) {
        alert('Maximum bookings must be between 1 and 7');
        document.getElementById('maxBooking').value = maxBookings;
        return;
    }
    maxBookings = newMax;
    document.getElementById('seatNumber').max = maxBookings;
}

// Function to generate seats with row structure
function generateSeats() {
    const seatsGrid = document.getElementById('seatsGrid');
    seatsGrid.innerHTML = '';
    let seatNumber = 1;

    for (let row = 1; row <= 12; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'flex gap-2 mb-4';
        
        const seatsInRow = row === 12 ? lastRowSeats : seatsPerRow;
        for (let seat = 1; seat <= seatsInRow; seat++) {
            const seatId = `R${row}S${seat}`;
            const seatElement = document.createElement('div');
            seatElement.className = `seat w-12 h-12 rounded-lg flex items-center justify-center 
                                   ${isSeatBooked(seatId) ? 'bg-gray-600' : 'bg-gray-200'}`;
            seatElement.innerText = seatNumber;
            seatElement.dataset.seatId = seatId;
            rowDiv.appendChild(seatElement);
            seatNumber++;
        }
        seatsGrid.appendChild(rowDiv);
    }
    updateSelectedCount();
}

// Function to find best available seats
function findBestAvailableSeats(numSeats) {
    const availableSeats = [];
    const seatsByRow = new Map();
    
    // Group available seats by row
    document.querySelectorAll('.seat').forEach(seat => {
        if (!seat.classList.contains('bg-gray-600')) {
            const seatId = seat.dataset.seatId;
            const row = parseInt(seatId.match(/R(\d+)/)[1]);
            
            if (!seatsByRow.has(row)) {
                seatsByRow.set(row, []);
            }
            seatsByRow.get(row).push(seatId);
            availableSeats.push(seatId);
        }
    });

    if (availableSeats.length < numSeats) {
        alert(`Only ${availableSeats.length} seats available!`);
        return null;
    }

    // Try to find consecutive seats in a single row
    for (const [row, seats] of seatsByRow) {
        if (seats.length >= numSeats) {
            const consecutive = seats.slice(0, numSeats);
            if (consecutive.length === numSeats) {
                return consecutive;
            }
        }
    }

    // If no consecutive seats found, return first available seats
    return availableSeats.slice(0, numSeats);
}

// Function to update selected count
function updateSelectedCount() {
    const bookedCountElement = document.getElementById('bookedCount');
    const availableCountElement = document.getElementById('availableCount');
    const totalBooked = getAllBookedSeats().length;
    
    bookedCountElement.innerText = totalBooked;
    availableCountElement.innerText = totalSeats - totalBooked;
}

// Function to book seats
function bookSeats() {
    if (!currentUser) {
        alert('Please login to book seats!');
        window.location.href = 'login.html';
        return;
    }

    const numSeats = parseInt(document.getElementById('seatNumber').value);
    if (isNaN(numSeats) || numSeats < 1 || numSeats > maxBookings) {
        alert(`Please enter a number between 1 and ${maxBookings}`);
        return;
    }

    const seatsToBook = findBestAvailableSeats(numSeats);
    if (!seatsToBook) return;

    // Update user's bookings
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    users[userIndex].bookings = [...users[userIndex].bookings, ...seatsToBook];
    localStorage.setItem('users', JSON.stringify(users));

    // Update UI
    seatsToBook.forEach(seatId => {
        const seat = document.querySelector(`[data-seat-id="${seatId}"]`);
        if (seat) {
            seat.classList.remove('bg-gray-200');
            seat.classList.add('bg-gray-600');
        }
    });

    updateSelectedCount();
    document.getElementById('seatNumber').value = '';
    alert(`Successfully booked ${seatsToBook.length} seats: ${seatsToBook.join(', ')}`);
}

// Function to reset all bookings
function resetBooking() {
    if (!currentUser) {
        alert('Please login to reset bookings!');
        window.location.href = 'login.html';
        return;
    }

    if (confirm('Are you sure you want to reset ALL bookings? This will clear all reservations!')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        users.forEach(user => user.bookings = []);
        localStorage.setItem('users', JSON.stringify(users));

        document.querySelectorAll('.seat').forEach(seat => {
            seat.classList.remove('bg-gray-600');
            seat.classList.add('bg-gray-200');
        });
        
        updateSelectedCount();
        alert('All bookings have been reset!');
    }
}

// Event listeners for buttons
const bookButton = document.getElementById('bookButton');
const resetButton = document.getElementById('resetButton');

if (bookButton && resetButton) {
    bookButton.addEventListener('click', bookSeats);
    resetButton.addEventListener('click', resetBooking);
}

// Initialize the page
window.onload = function() {
    currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    generateSeats();
    document.getElementById('maxBooking').value = maxBookings;
    document.getElementById('seatNumber').max = maxBookings;
};
