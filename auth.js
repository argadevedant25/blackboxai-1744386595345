// User accounts storage
let users = JSON.parse(localStorage.getItem('users')) || [];

// Current user session
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// Temporary user creation for testing
if (!users.some(user => user.username === 'testuser')) {
    users.push({ username: 'testuser', password: 'password123', bookings: [] });
    localStorage.setItem('users', JSON.stringify(users));
}

function toggleForm() {
    const signupForm = document.getElementById('signupForm');
    signupForm.classList.toggle('hidden');
}

function signup() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (users.some(user => user.username === username)) {
        alert('Username already exists!');
        return;
    }

    users.push({ username, password, bookings: [] });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created successfully! Please login.');
    toggleForm();
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'booking.html';
    } else {
        alert('Invalid credentials!');
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}
