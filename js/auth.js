// User authentication related functionality

// DOM Elements
// Login page elements
const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('username');
const loginPassword = document.getElementById('password');
const loginAlert = document.getElementById('loginAlert');
const registerLink = document.getElementById('registerLink');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// Password reset elements
const passwordResetModal = document.getElementById('passwordResetModal');
const closePasswordModal = document.getElementById('closePasswordModal');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');
const resetUsername = document.getElementById('resetUsername');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const resetAlert = document.getElementById('resetAlert');

// Registration page elements
const registerForm = document.getElementById('registerForm');
const registerAlert = document.getElementById('registerAlert');

// Default admin account
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin',
    fullName: 'System Administrator',
    email: 'admin@example.com',
    role: 'admin'
};

// Database initialization
function initializeDatabase() {
    // Check if users are already initialized
    const users = localStorage.getItem('users');
    if (!users) {
        // Create default admin user
        const initialUsers = [DEFAULT_ADMIN];
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }
}

// User authentication
function authenticateUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(user => user.username === username && user.password === password);
}

// Show alert message
function showAlert(element, message, type = 'danger') {
    element.textContent = message;
    element.classList.remove('hidden', 'alert-success', 'alert-danger');
    element.classList.add(`alert-${type}`);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        element.classList.add('hidden');
    }, 5000);
}

// Event Listeners
// Initialize database when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDatabase();
    
    // Check if user is already logged in except on login page
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isLoginPage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');
    const isRegisterPage = window.location.pathname.includes('register.html');
    
    if (!isLoginPage && !isRegisterPage && !currentUser) {
        // Redirect to login page if not authenticated
        window.location.href = isLoginPage ? 'index.html' : '../index.html';
    }

    // If logged in and on login page, redirect to company page
    if (isLoginPage && currentUser) {
        window.location.href = 'pages/create-company.html';
    }
});

// Login form submission
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = loginUsername.value.trim();
        const password = loginPassword.value;
        
        if (!username || !password) {
            showAlert(loginAlert, 'कृपया प्रयोगकर्ता नाम र पासवर्ड प्रविष्ट गर्नुहोस्।');
            return;
        }
        
        const user = authenticateUser(username, password);
        
        if (user) {
            // Store current user (exclude password for security)
            const { password, ...userWithoutPassword } = user;
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            
            // Redirect to company page
            window.location.href = 'pages/create-company.html';
        } else {
            showAlert(loginAlert, 'अमान्य प्रयोगकर्ता नाम वा पासवर्ड।');
        }
    });
}

// Registration form handling
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmRegisterPassword').value;
        const role = document.getElementById('role').value;
        
        // Validation
        if (!fullName || !email || !username || !password) {
            showAlert(registerAlert, 'सबै फिल्डहरू आवश्यक छन्।');
            return;
        }
        
        if (password !== confirmPassword) {
            showAlert(registerAlert, 'पासवर्डहरू मेल खाँदैनन्।');
            return;
        }
        
        // Check if username already exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(user => user.username === username)) {
            showAlert(registerAlert, 'यो प्रयोगकर्ता नाम पहिले नै प्रयोग भइसकेको छ।');
            return;
        }
        
        // Add new user
        const newUser = {
            fullName,
            email,
            username,
            password,
            role,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Show success message
        showAlert(registerAlert, 'खाता सफलतापूर्वक सिर्जना गरियो! अब तपाईं लगइन गर्न सक्नुहुन्छ।', 'success');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    });
}

// Forgot password link
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        passwordResetModal.style.display = 'block';
    });
}

// Close password reset modal
if (closePasswordModal) {
    closePasswordModal.addEventListener('click', () => {
        passwordResetModal.style.display = 'none';
    });
}

// Reset password functionality
if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener('click', () => {
        const username = resetUsername.value.trim();
        const newPass = newPassword.value;
        const confirmPass = confirmPassword.value;
        
        if (!username || !newPass || !confirmPass) {
            showAlert(resetAlert, 'सबै फिल्डहरू आवश्यक छन्।');
            return;
        }
        
        if (newPass !== confirmPass) {
            showAlert(resetAlert, 'पासवर्डहरू मेल खाँदैनन्।');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => user.username === username);
        
        if (userIndex === -1) {
            showAlert(resetAlert, 'प्रयोगकर्ता फेला परेन।');
            return;
        }
        
        // Update password
        users[userIndex].password = newPass;
        localStorage.setItem('users', JSON.stringify(users));
        
        showAlert(resetAlert, 'पासवर्ड सफलतापूर्वक अद्यावधिक गरियो!', 'success');
        
        // Close modal and clear fields after 2 seconds
        setTimeout(() => {
            passwordResetModal.style.display = 'none';
            resetUsername.value = '';
            newPassword.value = '';
            confirmPassword.value = '';
        }, 2000);
    });
}

// Register link click event
if (registerLink) {
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'pages/register.html';
    });
}

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === passwordResetModal) {
        passwordResetModal.style.display = 'none';
    }
}); 