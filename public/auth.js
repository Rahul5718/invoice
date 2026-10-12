// Toggle between Login and Registration views
function switchTab(mode) {
  clearAlert();

  const isLogin = mode === 'login';
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabReg = document.getElementById('tab-register');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const footerText = document.getElementById('footer-text');

  if (isLogin) {
    loginForm.style.display = 'flex';
    regForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
    title.textContent = 'Welcome Back';
    subtitle.textContent = 'Sign in to manage and dispatch your invoices.';
    footerText.innerHTML = `Don't have an account? <a href="#" onclick="switchTab('register'); return false;">Sign up</a>`;
  } else {
    loginForm.style.display = 'none';
    regForm.style.display = 'flex';
    tabReg.classList.add('active');
    tabLogin.classList.remove('active');
    title.textContent = 'Create an Account';
    subtitle.textContent = 'Start issuing clean invoices and tracking revenue.';
    footerText.innerHTML = `Already registered? <a href="#" onclick="switchTab('login'); return false;">Sign in</a>`;
  }
}

function showAlert(message, type = 'error') {
  const alertBox = document.getElementById('alert-box');
  alertBox.className = `alert-box alert-${type}`;
  alertBox.textContent = message;
  alertBox.style.display = 'block';
}

function clearAlert() {
  const alertBox = document.getElementById('alert-box');
  alertBox.style.display = 'none';
  alertBox.textContent = '';
}


// LOGIN: Store the user in localStorage, then redirect to the dashboard
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid email or password.');

    // Save user info for the dashboard session.
    localStorage.setItem('invoicely_user', JSON.stringify(data.user));

    showAlert('Login successful! Redirecting to dashboard...', 'success');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 700);
  } catch (err) {
    showAlert(err.message, 'error');
  }
});

function handleForgotPassword(e) {
  e.preventDefault();
  showAlert('Password reset link sent to your email (demo).', 'success');
}

// 1. REGISTER: Upon success, switch directly to the Login tab
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const nameInput = document.getElementById('reg-name');
  const businessInput = document.getElementById('reg-business');
  const emailInput = document.getElementById('reg-email');
  const passwordInput = document.getElementById('reg-password');

  const name = nameInput.value.trim();
  const businessName = businessInput.value.trim() || 'Freelance Studio';
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name, businessName, email, password })
    });

    // Check content type to prevent "Unexpected token '<'"
    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const errorText = await res.text();
      console.error('Raw non-JSON server response:', errorText);
      throw new Error(`Server error (${res.status}). Verify backend route in server.js`);
    }

    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account.');
    }

    // Show success message
    showAlert('Account created! Please sign in with your credentials.', 'success');
    document.getElementById('register-form').reset();

    // Auto-fill login email and switch to login tab
    document.getElementById('login-email').value = email;
    setTimeout(() => {
      switchTab('login');
    }, 1000);

  } catch (err) {
    console.error('Registration failed:', err);
    showAlert(err.message, 'error');
  }
});