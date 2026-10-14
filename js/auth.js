// SpendWise Authentication Controller

let currentAuthTab = 'login';

function initAuth() {
  window.addEventListener('auth:expired', () => {
    showToast('Session expired. Please sign in again.', 'warning');
    openAuthModal('login');
  });

  const currentUser = api.getCurrentUser();
  if (currentUser) {
    updateUserHeader(currentUser);
  } else {
    // If not authenticated, open auth modal with options to login or register
    openAuthModal('login');
  }
}

function openAuthModal(tab = 'login') {
  currentAuthTab = tab;
  switchAuthTab(tab);
  document.getElementById('authModal').classList.add('active');
}

function closeAuthModal() {
  if (!api.isAuthenticated()) {
    showToast('Please sign in or register to access your account.', 'info');
    return;
  }
  document.getElementById('authModal').classList.remove('active');
}

function switchAuthTab(tab) {
  currentAuthTab = tab;
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');

  document.getElementById('loginFormContainer').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerFormContainer').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('authError').textContent = '';
  document.getElementById('authError').style.display = 'none';
}

function showAuthError(message) {
  const errEl = document.getElementById('authError');
  errEl.textContent = message;
  errEl.style.display = 'block';
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!identifier || !password) {
    showAuthError('Please fill in both fields.');
    return;
  }

  const btn = document.getElementById('loginSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

  try {
    const data = await api.login(identifier, password);
    updateUserHeader(data);
    document.getElementById('authModal').classList.remove('active');
    showToast(`Welcome back, ${data.fullName || data.username}!`, 'success');
    window.dispatchEvent(new CustomEvent('auth:login_success'));
  } catch (err) {
    showAuthError(err.message || 'Login failed. Please check your credentials.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In';
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('regFullName').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const currency = document.getElementById('regCurrency').value || 'USD';

  if (!fullName || !username || !email || !password) {
    showAuthError('All fields are required.');
    return;
  }
  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters.');
    return;
  }

  const btn = document.getElementById('regSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';

  try {
    const data = await api.register(username, email, password, fullName, currency);
    updateUserHeader(data);
    document.getElementById('authModal').classList.remove('active');
    showToast(`Account created successfully! Welcome, ${data.fullName}!`, 'success');
    window.dispatchEvent(new CustomEvent('auth:login_success'));
  } catch (err) {
    showAuthError(err.message || 'Registration failed.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
  }
}

async function handleLogout() {
  if (confirm('Are you sure you want to log out?')) {
    await api.logout();
    updateUserHeader(null);
    showToast('Logged out successfully.', 'info');
    openAuthModal('login');
  }
}

function fillDemoCredentials() {
  document.getElementById('loginIdentifier').value = 'alice';
  document.getElementById('loginPassword').value = 'password123';
}

function updateUserHeader(user) {
  const headerContainer = document.getElementById('userHeaderArea');
  if (user && api.isAuthenticated()) {
    const initial = (user.fullName || user.username || 'U').charAt(0).toUpperCase();
    headerContainer.innerHTML = `
      <div class="user-menu-btn" onclick="handleLogout()" title="Click to log out">
        <div class="user-avatar">${initial}</div>
        <div style="text-align:left; display:none; @media(min-width:640px){display:block;}">
          <p style="font-size:12px; font-weight:600; line-height:1.2;">${user.fullName || user.username}</p>
          <p style="font-size:10px; color:var(--text-muted);">${user.currency || 'USD'}</p>
        </div>
        <i class="fa-solid fa-arrow-right-from-bracket" style="font-size:11px; color:var(--text-muted); margin-left:4px;"></i>
      </div>
    `;
  } else {
    headerContainer.innerHTML = `
      <button class="btn-primary" onclick="openAuthModal('login')" style="padding:8px 16px; font-size:13px;">
        <i class="fa-solid fa-user"></i> Sign In
      </button>
    `;
  }
}
