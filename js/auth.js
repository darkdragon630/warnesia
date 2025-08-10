// Authentication JavaScript for Warnesia
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

// Initialize authentication functionality
function initializeAuth() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (loginForm) {
        setupLoginForm(loginForm);
    }
    
    if (signupForm) {
        setupSignupForm(signupForm);
        setupPasswordValidation(passwordInput);
        setupPasswordConfirmation(confirmPasswordInput);
    }
    
    // Check if user is already logged in
    checkAuthStatus();
}

// Setup login form
function setupLoginForm(form) {
    form.addEventListener('submit', handleLogin);
    
    // Setup real-time validation
    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');
    
    if (emailInput) {
        emailInput.addEventListener('blur', () => validateField(emailInput, 'email'));
        emailInput.addEventListener('input', () => clearFieldError(emailInput));
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', () => clearFieldError(passwordInput));
    }
}

// Setup signup form
function setupSignupForm(form) {
    form.addEventListener('submit', handleSignup);
    
    // Setup real-time validation
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input, input.type || input.name));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

// Setup password validation with strength indicator
function setupPasswordValidation(passwordInput) {
    if (!passwordInput) return;
    
    const strengthIndicator = document.getElementById('passwordStrength');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = getPasswordStrength(password);
        
        if (strengthIndicator) {
            strengthIndicator.className = `password-strength ${strength}`;
            strengthIndicator.setAttribute('data-strength', strength);
        }
        
        validateField(this, 'password');
    });
}

// Setup password confirmation validation
function setupPasswordConfirmation(confirmPasswordInput) {
    if (!confirmPasswordInput) return;
    
    const passwordInput = document.getElementById('password');
    
    function validatePasswordMatch() {
        if (passwordInput && confirmPasswordInput) {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (confirmPassword && password !== confirmPassword) {
                showFieldError(confirmPasswordInput, 'Passwords do not match');
                return false;
            } else {
                clearFieldError(confirmPasswordInput);
                return true;
            }
        }
    }
    
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    confirmPasswordInput.addEventListener('blur', validatePasswordMatch);
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Get form data
    const formData = new FormData(form);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
        remember: formData.get('remember') === 'on'
    };
    
    // Validate form
    if (!validateLoginForm(loginData)) {
        return;
    }
    
    try {
        // Show loading state
        showLoading(submitBtn);
        showLoadingModal();
        
        // Simulate API call (replace with actual API endpoint)
        await simulateLogin(loginData);
        
        // Success
        showNotification('Login successful!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '../chat/chat.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message || 'Login failed. Please try again.', 'error');
        hideLoading(submitBtn, originalBtnText);
    } finally {
        hideLoadingModal();
    }
}

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Get form data
    const formData = new FormData(form);
    const signupData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        terms: formData.get('terms') === 'on',
        newsletter: formData.get('newsletter') === 'on'
    };
    
    // Validate form
    if (!validateSignupForm(signupData)) {
        return;
    }
    
    try {
        // Show loading state
        showLoading(submitBtn);
        showLoadingModal();
        
        // Simulate API call (replace with actual API endpoint)
        await simulateSignup(signupData);
        
        // Success
        showNotification('Account created successfully!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = '../chat/chat.html';
        }, 1000);
        
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(error.message || 'Signup failed. Please try again.', 'error');
        hideLoading(submitBtn, originalBtnText);
    } finally {
        hideLoadingModal();
    }
}

// Validate login form
function validateLoginForm(data) {
    let isValid = true;
    
    // Validate email
    if (!data.email) {
        showFieldError(document.getElementById('email'), 'Email is required');
        isValid = false;
    } else if (!validateEmail(data.email)) {
        showFieldError(document.getElementById('email'), 'Please enter a valid email');
        isValid = false;
    }
    
    // Validate password
    if (!data.password) {
        showFieldError(document.getElementById('password'), 'Password is required');
        isValid = false;
    }
    
    return isValid;
}

// Validate signup form
function validateSignupForm(data) {
    let isValid = true;
    
    // Validate first name
    if (!data.firstName || data.firstName.trim().length < 2) {
        showFieldError(document.getElementById('firstName'), 'First name must be at least 2 characters');
        isValid = false;
    }
    
    // Validate last name
    if (!data.lastName || data.lastName.trim().length < 2) {
        showFieldError(document.getElementById('lastName'), 'Last name must be at least 2 characters');
        isValid = false;
    }
    
    // Validate email
    if (!data.email) {
        showFieldError(document.getElementById('email'), 'Email is required');
        isValid = false;
    } else if (!validateEmail(data.email)) {
        showFieldError(document.getElementById('email'), 'Please enter a valid email');
        isValid = false;
    }
    
    // Validate password
    const passwordChecks = validatePassword(data.password);
    if (!data.password) {
        showFieldError(document.getElementById('password'), 'Password is required');
        isValid = false;
    } else if (!passwordChecks.length) {
        showFieldError(document.getElementById('password'), 'Password must be at least 8 characters');
        isValid = false;
    }
    
    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
        showFieldError(document.getElementById('confirmPassword'), 'Passwords do not match');
        isValid = false;
    }
    
    // Validate terms acceptance
    if (!data.terms) {
        showNotification('You must accept the Terms of Service', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Validate individual field
function validateField(field, type) {
    const value = field.value.trim();
    
    clearFieldError(field);
    
    switch (type) {
        case 'email':
            if (value && !validateEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
            break;
            
        case 'password':
            if (value && value.length < 8) {
                showFieldError(field, 'Password must be at least 8 characters');
                return false;
            }
            break;
            
        case 'firstName':
        case 'lastName':
            if (value && value.length < 2) {
                showFieldError(field, 'Name must be at least 2 characters');
                return false;
            }
            break;
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.add('error');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.validation-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-message error';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.remove('error');
    formGroup.classList.remove('success');
    
    const errorMessage = formGroup.querySelector('.validation-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Show success for field
function showFieldSuccess(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.remove('error');
    formGroup.classList.add('success');
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('passwordToggleIcon');
    
    if (passwordInput && toggleIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }
}

// Show loading modal
function showLoadingModal() {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Hide loading modal
function hideLoadingModal() {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Check authentication status
function checkAuthStatus() {
    const user = getUserFromStorage();
    if (user) {
        // User is already logged in, redirect to dashboard
        const currentPath = window.location.pathname;
        if (currentPath.includes('login.html') || currentPath.includes('signup.html')) {
            window.location.href = '../chat/chat.html';
        }
    }
}

// Simulate login API call (replace with actual API)
async function simulateLogin(loginData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate validation
            if (loginData.email === 'demo@warnesia.com' && loginData.password === 'password123') {
                const user = {
                    id: 1,
                    name: 'Demo User',
                    email: loginData.email,
                    token: 'demo-jwt-token',
                    avatar: null,
                    loginTime: new Date().toISOString()
                };
                
                // Save user to localStorage
                saveToStorage('warnesia_user', user);
                resolve(user);
            } else {
                reject(new Error('Invalid email or password'));
            }
        }, 1500);
    });
}

// Simulate signup API call (replace with actual API)
async function simulateSignup(signupData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate email existence check
            if (signupData.email === 'existing@example.com') {
                reject(new Error('Email already exists'));
                return;
            }
            
            const user = {
                id: Date.now(),
                name: `${signupData.firstName} ${signupData.lastName}`,
                email: signupData.email,
                token: `demo-jwt-token-${Date.now()}`,
                avatar: null,
                signupTime: new Date().toISOString()
            };
            
            // Save user to localStorage
            saveToStorage('warnesia_user', user);
            resolve(user);
        }, 2000);
    });
}

// Logout function
function logout() {
    removeFromStorage('warnesia_user');
    showNotification('Logged out successfully', 'success');
    
    setTimeout(() => {
        window.location.href = '../auth/login.html';
    }, 1000);
}

// Social login handlers
function handleGoogleLogin() {
    showNotification('Google login integration coming soon!', 'info');
}

function handleGitHubLogin() {
    showNotification('GitHub login integration coming soon!', 'info');
}

// Add event listeners for social login buttons
document.addEventListener('DOMContentLoaded', function() {
    const googleBtns = document.querySelectorAll('.btn-google');
    const githubBtns = document.querySelectorAll('.btn-github');
    
    googleBtns.forEach(btn => {
        btn.addEventListener('click', handleGoogleLogin);
    });
    
    githubBtns.forEach(btn => {
        btn.addEventListener('click', handleGitHubLogin);
    });
});

// Password reset (placeholder)
function handleForgotPassword() {
    showNotification('Password reset feature coming soon!', 'info');
}

// Add click handler for forgot password links
document.addEventListener('DOMContentLoaded', function() {
    const forgotLinks = document.querySelectorAll('.forgot-password');
    forgotLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    });
});