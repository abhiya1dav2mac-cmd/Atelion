// ==============================================================================
// ATELION AI WORKSPACE - FRONTEND CLIENT CONTROLLER
// ==============================================================================

const API_BASE = '/api/auth';

let currentRole = 'student'; // 'student' or 'professional'
let pendingEmail = '';
let otpCountdownInterval = null;
let googleProfilePending = null;

// ==============================================================================
// 1. NAVIGATION & VIEW SWITCHER
// ==============================================================================

function switchAuthMode(mode) {
  hideAllViews();
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const authTabs = document.getElementById('authTabs');

  authTabs.classList.remove('hidden');

  if (mode === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    document.getElementById('viewLogin').classList.remove('hidden');
  } else if (mode === 'register') {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    document.getElementById('viewRegisterRole').classList.remove('hidden');
  }
}

function hideAllViews() {
  const views = [
    'viewLogin',
    'viewRegisterRole',
    'viewRegisterForm',
    'viewOtp',
    'viewGoogleCompletion',
    'viewPasskeyPrompt',
    'viewForgotPassword',
    'viewDashboard',
  ];
  views.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

function selectRole(role) {
  currentRole = role;
  hideAllViews();
  document.getElementById('viewRegisterForm').classList.remove('hidden');

  const roleBadge = document.getElementById('regRoleBadge');
  const roleIcon = document.getElementById('regRoleIcon');
  const roleLabel = document.getElementById('regRoleLabel');
  const studentBlock = document.getElementById('studentFieldsBlock');
  const professionalBlock = document.getElementById('professionalFieldsBlock');

  if (role === 'student') {
    roleIcon.textContent = '🎓';
    roleLabel.textContent = 'Student Registration';
    studentBlock.classList.remove('hidden');
    professionalBlock.classList.add('hidden');
    document.getElementById('regCollegeName').setAttribute('required', 'true');
    document.getElementById('regCompanyName').removeAttribute('required');
    document.getElementById('regDesignation').removeAttribute('required');
    document.getElementById('regEmployeeEmail').removeAttribute('required');
  } else {
    roleIcon.textContent = '💼';
    roleLabel.textContent = 'Professional Registration';
    studentBlock.classList.add('hidden');
    professionalBlock.classList.remove('hidden');
    document.getElementById('regCollegeName').removeAttribute('required');
    document.getElementById('regCompanyName').setAttribute('required', 'true');
    document.getElementById('regDesignation').setAttribute('required', 'true');
    document.getElementById('regEmployeeEmail').setAttribute('required', 'true');
  }
}

function goBackToRoleSelection() {
  hideAllViews();
  document.getElementById('viewRegisterRole').classList.remove('hidden');
}

function goBackToForm() {
  hideAllViews();
  document.getElementById('viewRegisterForm').classList.remove('hidden');
}

// ==============================================================================
// 2. REGISTRATION SUBMIT & OTP SEND
// ==============================================================================

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btnRegisterSubmit');

  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  if (password !== confirmPassword) {
    showToast('Passwords do not match!', 'error');
    return;
  }

  const payload = {
    role: currentRole,
    name: document.getElementById('regName').value.trim(),
    email: document.getElementById('regEmail').value.trim(),
    mobile: document.getElementById('regMobile').value.trim(),
    password,
  };

  if (currentRole === 'student') {
    payload.collegeName = document.getElementById('regCollegeName').value.trim();
    payload.collegeEmail = document.getElementById('regCollegeEmail').value.trim();
  } else {
    payload.companyName = document.getElementById('regCompanyName').value.trim();
    payload.designation = document.getElementById('regDesignation').value.trim();
    payload.employeeEmail = document.getElementById('regEmployeeEmail').value.trim();
  }

  setButtonLoading(btn, true, 'Sending Verification Passcode...');

  try {
    const res = await fetch(`${API_BASE}/register/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send verification code.');

    pendingEmail = payload.email;
    document.getElementById('otpTargetEmail').textContent = pendingEmail;

    showToast('Verification code dispatched via Brevo!', 'success');
    hideAllViews();
    document.getElementById('authTabs').classList.add('hidden');
    document.getElementById('viewOtp').classList.remove('hidden');

    startOtpCountdown(10 * 60); // 10 minutes
    setupOtpInputs();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(btn, false, 'Send Verification Passcode');
  }
}

// ==============================================================================
// 3. OTP VERIFICATION
// ==============================================================================

function setupOtpInputs() {
  const inputs = document.querySelectorAll('.otp-box');
  inputs.forEach((input, index) => {
    input.value = '';
    input.oninput = (e) => {
      if (input.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    };
    input.onkeydown = (e) => {
      if (e.key === 'Backspace' && input.value === '' && index > 0) {
        inputs[index - 1].focus();
      }
    };
    input.onpaste = (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
      if (/^\d{6}$/.test(pasted)) {
        pasted.split('').forEach((char, i) => {
          if (inputs[i]) inputs[i].value = char;
        });
        inputs[inputs.length - 1].focus();
      }
    };
  });
  if (inputs[0]) inputs[0].focus();
}

function getEnteredOtp() {
  let code = '';
  document.querySelectorAll('.otp-box').forEach((input) => {
    code += input.value.trim();
  });
  return code;
}

async function handleOtpSubmit(e) {
  e.preventDefault();
  const otp = getEnteredOtp();
  if (otp.length !== 6) {
    showToast('Please enter the full 6-digit verification code.', 'error');
    return;
  }

  const btn = document.getElementById('btnVerifyOtpSubmit');
  setButtonLoading(btn, true, 'Verifying...');

  try {
    const res = await fetch(`${API_BASE}/register/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: pendingEmail,
        otp,
        role: currentRole,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed.');

    showToast('Account verified! Set up your Passkey.', 'success');
    promptPasskeyOnboarding(data.token, data.user);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(btn, false, 'Verify & Launch Workspace');
  }
}

async function resendRegistrationOtp() {
  const btn = document.getElementById('btnResendOtp');
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/register/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: pendingEmail,
        role: currentRole,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resend code.');

    showToast('New verification code sent!', 'success');
    startOtpCountdown(10 * 60);
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
  }
}

function startOtpCountdown(seconds) {
  if (otpCountdownInterval) clearInterval(otpCountdownInterval);
  const timerDisplay = document.getElementById('otpTimer');
  const resendBtn = document.getElementById('btnResendOtp');
  resendBtn.disabled = true;

  let remaining = seconds;
  otpCountdownInterval = setInterval(() => {
    remaining--;
    const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
    const secs = String(remaining % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;

    if (remaining <= 0) {
      clearInterval(otpCountdownInterval);
      timerDisplay.textContent = 'Expired';
      resendBtn.disabled = false;
    }
  }, 1000);
}

// ==============================================================================
// 4. SIGN IN SUBMIT
// ==============================================================================

async function handleLoginSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btnLoginSubmit');
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  setButtonLoading(btn, true, 'Signing In...');

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed.');

    showToast('Signed in successfully!', 'success');
    saveSessionAndShowDashboard(data.token, data.user);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(btn, false, 'Sign In to Workspace');
  }
}

// ==============================================================================
// 5. GOOGLE OAUTH 2.0 (ONE-TAP & BUTTON)
// ==============================================================================

function triggerGoogleSignIn() {
  if (typeof google === 'undefined' || !google.accounts) {
    showToast('Google Services loading. Please try again in a moment.', 'error');
    return;
  }

  // Use Google Identity Token Client
  google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      showToast('Popup or cookie blocked. Please ensure Google popup is allowed.', 'error');
    }
  });
}

// Global Google Credential Callback
window.handleGoogleCredentialResponse = async function (response) {
  try {
    const credential = response.credential;
    const res = await fetch(`${API_BASE}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google authentication failed.');

    if (data.action === 'LOGIN_SUCCESS') {
      showToast('Signed in with Google!', 'success');
      saveSessionAndShowDashboard(data.token, data.user);
    } else if (data.action === 'REQUIRES_PROFILE_COMPLETION') {
      // Prompt user to pick role and complete student/professional details
      openGoogleCompletionView(data.googleProfile);
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

function openGoogleCompletionView(profile) {
  googleProfilePending = profile;
  hideAllViews();
  document.getElementById('authTabs').classList.add('hidden');
  document.getElementById('viewGoogleCompletion').classList.remove('hidden');

  document.getElementById('gCompGreeting').textContent = `Welcome, ${profile.name}!`;
  const avatarEl = document.getElementById('gCompAvatar');
  if (profile.avatar) {
    avatarEl.innerHTML = `<img src="${profile.avatar}" style="width:100%; height:100%; border-radius:50%;" alt="User">`;
  } else {
    avatarEl.textContent = profile.name.charAt(0).toUpperCase();
  }

  selectGoogleRole('student');
}

function selectGoogleRole(role) {
  const btnStudent = document.getElementById('gRoleStudent');
  const btnProf = document.getElementById('gRoleProfessional');
  const sFields = document.getElementById('gStudentFields');
  const pFields = document.getElementById('gProfessionalFields');

  if (role === 'student') {
    btnStudent.classList.add('active');
    btnProf.classList.remove('active');
    sFields.classList.remove('hidden');
    pFields.classList.add('hidden');
    document.getElementById('gCollegeName').setAttribute('required', 'true');
    document.getElementById('gCompanyName').removeAttribute('required');
    document.getElementById('gDesignation').removeAttribute('required');
    document.getElementById('gEmployeeEmail').removeAttribute('required');
  } else {
    btnProf.classList.add('active');
    btnStudent.classList.remove('active');
    sFields.classList.add('hidden');
    pFields.classList.remove('hidden');
    document.getElementById('gCollegeName').removeAttribute('required');
    document.getElementById('gCompanyName').setAttribute('required', 'true');
    document.getElementById('gDesignation').setAttribute('required', 'true');
    document.getElementById('gEmployeeEmail').setAttribute('required', 'true');
  }
}

async function handleGoogleCompletionSubmit(e) {
  e.preventDefault();
  if (!googleProfilePending) return;

  const btn = document.getElementById('btnGoogleCompleteSubmit');
  const isStudent = document.getElementById('gRoleStudent').classList.contains('active');
  const role = isStudent ? 'student' : 'professional';

  const payload = {
    email: googleProfilePending.email,
    name: googleProfilePending.name,
    googleId: googleProfilePending.googleId,
    avatar: googleProfilePending.avatar,
    role,
    mobile: document.getElementById('gMobile').value.trim(),
    password: document.getElementById('gOptionalPassword').value || null,
  };

  if (isStudent) {
    payload.collegeName = document.getElementById('gCollegeName').value.trim();
    payload.collegeEmail = document.getElementById('gCollegeEmail').value.trim();
  } else {
    payload.companyName = document.getElementById('gCompanyName').value.trim();
    payload.designation = document.getElementById('gDesignation').value.trim();
    payload.employeeEmail = document.getElementById('gEmployeeEmail').value.trim();
  }

  setButtonLoading(btn, true, 'Completing setup...');

  try {
    const res = await fetch(`${API_BASE}/google/complete-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to complete profile.');

    showToast('Profile completed! Set up your Passkey.', 'success');
    promptPasskeyOnboarding(data.token, data.user);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(btn, false, 'Complete Setup & Enter Workspace');
  }
}

// ==============================================================================
// 6. FORGOT PASSWORD
// ==============================================================================

function openForgotPasswordModal() {
  hideAllViews();
  document.getElementById('authTabs').classList.add('hidden');
  document.getElementById('viewForgotPassword').classList.remove('hidden');
  document.getElementById('forgotStepEmail').classList.remove('hidden');
  document.getElementById('forgotStepReset').classList.add('hidden');
}

async function handleForgotEmailSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btnForgotEmailSubmit');
  const email = document.getElementById('forgotEmail').value.trim();

  setButtonLoading(btn, true, 'Sending recovery code...');

  try {
    const res = await fetch(`${API_BASE}/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send recovery code.');

    pendingEmail = email;
    showToast('Recovery passcode dispatched to your email!', 'success');
    document.getElementById('forgotStepEmail').classList.add('hidden');
    document.getElementById('forgotStepReset').classList.remove('hidden');
    document.getElementById('forgotOtpCode').focus();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(btn, false, 'Send Recovery Code');
  }
}

async function handleForgotResetSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btnForgotResetSubmit');
  const otp = document.getElementById('forgotOtpCode').value.trim();
  const newPassword = document.getElementById('forgotNewPassword').value;
  const confirmPassword = document.getElementById('forgotConfirmPassword').value;

  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match.', 'error');
    return;
  }

  setButtonLoading(btn, true, 'Updating password...');

  try {
    const res = await fetch(`${API_BASE}/forgot-password/verify-and-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: pendingEmail,
        otp,
        newPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password reset failed.');

    showToast('Password updated! Please sign in with your new password.', 'success');
    switchAuthMode('login');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(btn, false, 'Update Password & Sign In');
  }
}

// ==============================================================================
// 7. DASHBOARD & SESSION
// ==============================================================================

function saveSessionAndShowDashboard(token, user) {
  localStorage.setItem('atelion_token', token);
  localStorage.setItem('atelion_user', JSON.stringify(user));

  hideAllViews();
  document.getElementById('authTabs').classList.add('hidden');
  document.getElementById('viewDashboard').classList.remove('hidden');

  document.getElementById('dashName').textContent = user.name || 'User';
  document.getElementById('dashEmail').textContent = user.email || '';
  document.getElementById('dashRole').textContent = user.role === 'student' ? '🎓 Student' : '💼 Professional';

  const extraEl = document.getElementById('dashExtra');
  if (user.role === 'student') {
    extraEl.textContent = `🏛️ ${user.collegeName || 'College'}${user.collegeEmail ? ' • ' + user.collegeEmail : ''}`;
  } else {
    extraEl.textContent = `🏢 ${user.companyName || 'Company'} • ${user.designation || 'Role'} (${user.employeeEmail || ''})`;
  }

  const avatarEl = document.getElementById('dashAvatar');
  if (user.avatar) {
    avatarEl.innerHTML = `<img src="${user.avatar}" style="width:100%; height:100%; border-radius:50%;" alt="Avatar">`;
  } else {
    avatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();
  }

  // Update Passkey Status Badge on Dashboard
  const hasPasskey = (user.passkeys && user.passkeys.length > 0) || user.hasPasskey;
  const statusPill = document.getElementById('dashPkStatusPill');
  const statusDesc = document.getElementById('dashPkDesc');
  const setupBtn = document.getElementById('btnDashSetupPasskey');

  if (hasPasskey) {
    if (statusPill) {
      statusPill.textContent = 'Active';
      statusPill.style.background = 'rgba(16, 185, 129, 0.15)';
      statusPill.style.color = '#34D399';
    }
    if (statusDesc) {
      const count = (user.passkeys && user.passkeys.length) || 1;
      statusDesc.textContent = `Protected by ${count} FIDO2 biometric key(s) (Windows Hello / Touch ID).`;
    }
    if (setupBtn) setupBtn.classList.add('hidden');
  } else {
    if (statusPill) {
      statusPill.textContent = 'Not Enabled';
      statusPill.style.background = 'rgba(239, 68, 68, 0.15)';
      statusPill.style.color = '#F87171';
    }
    if (statusDesc) {
      statusDesc.textContent = 'Enable Windows Hello or Touch ID for 1-touch passwordless sign-in.';
    }
    if (setupBtn) setupBtn.classList.remove('hidden');
  }

  document.getElementById('dashTokenSnippet').textContent = `${token.slice(0, 36)}...`;
}

function handleLogout() {
  localStorage.removeItem('atelion_token');
  localStorage.removeItem('atelion_user');
  showToast('Signed out of session.', 'info');
  switchAuthMode('login');
}

// Check existing session on boot
window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('atelion_token');
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        saveSessionAndShowDashboard(token, data.user);
        return;
      }
    } catch {
      localStorage.removeItem('atelion_token');
    }
  }

  // Initialize Google Identity Services
  if (window.google && google.accounts) {
    google.accounts.id.initialize({
      client_id: 'your_google_client_id_here.apps.googleusercontent.com',
      callback: window.handleGoogleCredentialResponse,
    });
  }
});

// ==============================================================================
// 8. HELPERS & UTILITIES
// ==============================================================================

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function setButtonLoading(btn, isLoading, text) {
  if (!btn) return;
  btn.disabled = isLoading;
  const span = btn.querySelector('span');
  if (span) span.textContent = text;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span><span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==============================================================================
// 9. FIDO2 / WEBAUTHN PASSKEY LOGIC
// ==============================================================================

let pendingSession = null;

function promptPasskeyOnboarding(token, user) {
  pendingSession = { token, user };
  hideAllViews();
  document.getElementById('authTabs').classList.add('hidden');
  document.getElementById('viewPasskeyPrompt').classList.remove('hidden');
}

function skipPasskeyRegistration() {
  if (pendingSession) {
    saveSessionAndShowDashboard(pendingSession.token, pendingSession.user);
    pendingSession = null;
  } else {
    switchAuthMode('login');
  }
}

// Base64URL Conversion Helpers
function base64URLToBuffer(base64url) {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64URL(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function detectDeviceName() {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'Windows Hello (Biometric Passkey)';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Apple Touch ID / Passkey';
  if (/iPhone|iPad/i.test(ua)) return 'Apple Face ID / Touch ID';
  if (/Android/i.test(ua)) return 'Android Biometric Key';
  return 'FIDO2 Security Key';
}

async function nativeWebAuthnRegister(options) {
  const createOptions = {
    ...options,
    challenge: base64URLToBuffer(options.challenge),
    user: {
      ...options.user,
      id: typeof options.user.id === 'string' ? new TextEncoder().encode(options.user.id) : options.user.id,
    },
    excludeCredentials: (options.excludeCredentials || []).map((cred) => ({
      ...cred,
      id: base64URLToBuffer(cred.id),
    })),
  };

  const cred = await navigator.credentials.create({ publicKey: createOptions });
  if (!cred) throw new Error('No credential created.');

  return {
    id: cred.id,
    rawId: bufferToBase64URL(cred.rawId),
    response: {
      clientDataJSON: bufferToBase64URL(cred.response.clientDataJSON),
      attestationObject: bufferToBase64URL(cred.response.attestationObject),
      transports: cred.response.getTransports ? cred.response.getTransports() : ['internal', 'hybrid'],
    },
    type: cred.type,
    clientExtensionResults: cred.getClientExtensionResults ? cred.getClientExtensionResults() : {},
  };
}

async function nativeWebAuthnAuthenticate(options) {
  const getOptions = {
    challenge: base64URLToBuffer(options.challenge),
    rpId: options.rpId || options.rpID,
    userVerification: options.userVerification || 'preferred',
    allowCredentials: (options.allowCredentials || []).map((cred) => ({
      ...cred,
      id: base64URLToBuffer(cred.id),
    })),
  };

  const cred = await navigator.credentials.get({ publicKey: getOptions });
  if (!cred) throw new Error('No credential returned.');

  return {
    id: cred.id,
    rawId: bufferToBase64URL(cred.rawId),
    response: {
      clientDataJSON: bufferToBase64URL(cred.response.clientDataJSON),
      authenticatorData: bufferToBase64URL(cred.response.authenticatorData),
      signature: bufferToBase64URL(cred.response.signature),
      userHandle: cred.response.userHandle ? bufferToBase64URL(cred.response.userHandle) : null,
    },
    type: cred.type,
    clientExtensionResults: cred.getClientExtensionResults ? cred.getClientExtensionResults() : {},
  };
}

async function registerUserPasskey() {
  const btn = document.getElementById('btnActivatePasskey');
  const dashBtn = document.getElementById('btnDashSetupPasskey');

  let targetUser = (pendingSession && pendingSession.user) ? pendingSession.user : null;
  if (!targetUser) {
    const storedUser = localStorage.getItem('atelion_user');
    if (storedUser) {
      try { targetUser = JSON.parse(storedUser); } catch (e) {}
    }
  }

  if (!targetUser || !targetUser.email) {
    showToast('Please sign in or complete registration first.', 'error');
    return;
  }

  if (!window.PublicKeyCredential) {
    showToast('WebAuthn / Passkeys not supported by this browser.', 'error');
    if (pendingSession) skipPasskeyRegistration();
    return;
  }

  if (btn) setButtonLoading(btn, true, 'Requesting device biometric...');
  if (dashBtn) dashBtn.textContent = 'Setting up...';

  try {
    const optRes = await fetch(`${API_BASE}/passkey/register-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetUser.email }),
    });

    const options = await optRes.json();
    if (!optRes.ok) throw new Error(options.error || 'Failed to initialize Passkey registration.');

    let attResp;
    if (window.SimpleWebAuthnBrowser && typeof window.SimpleWebAuthnBrowser.startRegistration === 'function') {
      attResp = await window.SimpleWebAuthnBrowser.startRegistration({ optionsJSON: options });
    } else {
      attResp = await nativeWebAuthnRegister(options);
    }

    const verifyRes = await fetch(`${API_BASE}/passkey/verify-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: targetUser.email,
        response: attResp,
        deviceName: detectDeviceName(),
      }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(verifyData.error || 'Failed to verify biometric passkey.');

    showToast('🛡️ Biometric Passkey activated successfully!', 'success');
    saveSessionAndShowDashboard(verifyData.token, verifyData.user);
    pendingSession = null;
  } catch (err) {
    console.error('Passkey registration error:', err);
    if (err.name === 'NotAllowedError') {
      showToast('Biometric setup was cancelled or timed out.', 'error');
    } else {
      showToast(err.message || 'Passkey setup failed.', 'error');
    }
  } finally {
    if (btn) setButtonLoading(btn, false, '🛡️ Yes, Activate Biometric Passkey');
    if (dashBtn) dashBtn.textContent = '+ Enable Passkey';
  }
}

async function triggerPasskeySignIn() {
  if (!window.PublicKeyCredential) {
    showToast('WebAuthn / Passkeys not supported by this browser.', 'error');
    return;
  }

  const emailInput = document.getElementById('loginEmail');
  const email = emailInput ? emailInput.value.trim() : '';

  try {
    showToast('Requesting biometric authentication...', 'info');

    const optRes = await fetch(`${API_BASE}/passkey/login-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email || undefined }),
    });

    const options = await optRes.json();
    if (!optRes.ok) throw new Error(options.error || 'Failed to generate authentication options.');

    let asseResp;
    if (window.SimpleWebAuthnBrowser && typeof window.SimpleWebAuthnBrowser.startAuthentication === 'function') {
      asseResp = await window.SimpleWebAuthnBrowser.startAuthentication({ optionsJSON: options });
    } else {
      asseResp = await nativeWebAuthnAuthenticate(options);
    }

    const verifyRes = await fetch(`${API_BASE}/passkey/verify-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email || undefined,
        response: asseResp,
      }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(verifyData.error || 'Biometric authentication failed.');

    showToast('Signed in with Biometric Passkey!', 'success');
    saveSessionAndShowDashboard(verifyData.token, verifyData.user);
  } catch (err) {
    console.error('Passkey login error:', err);
    if (err.name === 'NotAllowedError') {
      showToast('Biometric authentication cancelled.', 'error');
    } else {
      showToast(err.message || 'Biometric sign-in failed.', 'error');
    }
  }
}

// ==============================================================================
// 10. DASHBOARD SUB-NAVIGATION TABS
// ==============================================================================

let knowledgeGraphInstance = null;
let whiteboardInstance = null;

function switchDashTab(tabName) {
  const tabs = ['overview', 'notes', 'student', 'prof', 'graph', 'whiteboard', 'vault', 'helpdesk'];
  tabs.forEach((t) => {
    const btn = document.getElementById(`btnNav${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const content = document.getElementById(`dashSub${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (btn) btn.classList.toggle('active', t === tabName);
    if (content) content.classList.toggle('hidden', t !== tabName);
  });

  if (tabName === 'vault') {
    loadEncryptedVaultItems();
  } else if (tabName === 'helpdesk') {
    loadHelpDeskTickets();
  } else if (tabName === 'student') {
    if (window.workspaceEngine) {
      workspaceEngine.renderCurrentFlashcard();
      workspaceEngine.updatePomodoroDisplay();
    }
  } else if (tabName === 'graph') {
    setTimeout(() => {
      if (!knowledgeGraphInstance && window.AtelionKnowledgeGraph) {
        knowledgeGraphInstance = new AtelionKnowledgeGraph('knowledgeGraphCanvas');
      } else if (knowledgeGraphInstance) {
        knowledgeGraphInstance.resizeCanvas();
      }
    }, 50);
  } else if (tabName === 'whiteboard') {
    setTimeout(() => {
      if (!whiteboardInstance && window.AtelionWhiteboard) {
        whiteboardInstance = new AtelionWhiteboard('whiteboardCanvas');
      } else if (whiteboardInstance) {
        whiteboardInstance.resizeCanvas();
      }
    }, 50);
  }
}

// ==============================================================================
// 11. ZERO-KNOWLEDGE E2EE VAULT CLIENT LOGIC
// ==============================================================================

let activeVaultSecret = null;
let cachedVaultItems = [];

function unlockVault() {
  const input = document.getElementById('vaultSecretInput');
  const secret = input.value.trim();
  if (!secret) {
    showToast('Please enter a vault master passphrase.', 'error');
    return;
  }

  activeVaultSecret = secret;
  input.value = '';

  document.getElementById('vaultLockBox').classList.add('hidden');
  document.getElementById('vaultWorkArea').classList.remove('hidden');

  const dot = document.getElementById('vaultStatusDot');
  const text = document.getElementById('vaultStatusText');
  const indicator = document.getElementById('vaultStatusIndicator');

  if (dot) dot.classList.add('unlocked');
  if (text) text.textContent = 'Unlocked';
  if (indicator) indicator.classList.add('unlocked');

  showToast('🔓 Vault unlocked. AES-256 session active in browser RAM.', 'success');
  loadEncryptedVaultItems();
}

function lockVault() {
  activeVaultSecret = null;
  document.getElementById('vaultWorkArea').classList.add('hidden');
  document.getElementById('vaultLockBox').classList.remove('hidden');
  document.getElementById('decryptedViewer').classList.add('hidden');

  const dot = document.getElementById('vaultStatusDot');
  const text = document.getElementById('vaultStatusText');
  const indicator = document.getElementById('vaultStatusIndicator');

  if (dot) dot.classList.remove('unlocked');
  if (text) text.textContent = 'Locked';
  if (indicator) indicator.classList.remove('unlocked');

  showToast('🔒 Vault locked. Encryption keys purged from memory.', 'info');
}

function toggleNewVaultItemModal() {
  const form = document.getElementById('newVaultItemForm');
  form.classList.toggle('hidden');
}

async function handleSaveEncryptedDocument() {
  if (!activeVaultSecret) {
    showToast('Vault is locked. Unlock vault first.', 'error');
    return;
  }

  const title = document.getElementById('vaultNewTitle').value.trim();
  const content = document.getElementById('vaultNewContent').value;
  const btn = document.getElementById('btnEncryptSave');

  if (!title || !content) {
    showToast('Please fill in title and content.', 'error');
    return;
  }

  const token = localStorage.getItem('atelion_token');
  if (!token) return;

  setButtonLoading(btn, true, 'Encrypting on device...');

  try {
    // 1. Encrypt title and content with AES-GCM-256 in browser
    const encrypted = await AtelionVaultCrypto.encryptDocument({
      title,
      content,
      passphraseOrSeed: activeVaultSecret,
    });

    // 2. Transmit unreadable ciphertext to server
    const res = await fetch('/api/vault/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(encrypted),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save encrypted document.');

    showToast('Document encrypted with AES-256-GCM and stored!', 'success');
    document.getElementById('vaultNewTitle').value = '';
    document.getElementById('vaultNewContent').value = '';
    toggleNewVaultItemModal();
    loadEncryptedVaultItems();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(btn, false, '🔒 Encrypt & Save to DB');
  }
}

async function loadEncryptedVaultItems() {
  const token = localStorage.getItem('atelion_token');
  if (!token) return;

  try {
    const res = await fetch('/api/vault/items', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load vault items.');

    cachedVaultItems = data.items || [];
    const countEl = document.getElementById('vaultItemCount');
    if (countEl) countEl.textContent = cachedVaultItems.length;

    renderVaultItemsList();
  } catch (err) {
    console.error('Failed to load vault items:', err);
  }
}

async function renderVaultItemsList() {
  const container = document.getElementById('vaultItemsList');
  if (!container) return;

  if (cachedVaultItems.length === 0) {
    container.innerHTML = '<div class="empty-state">No encrypted items yet. Create your first zero-knowledge document!</div>';
    return;
  }

  let html = '';
  for (const item of cachedVaultItems) {
    let displayTitle = '🔒 [Ciphertext Protected]';

    // If vault is unlocked, decrypt title client-side on the fly!
    if (activeVaultSecret) {
      try {
        const key = await AtelionVaultCrypto.deriveKey(activeVaultSecret, item.salt);
        displayTitle = await AtelionVaultCrypto.decryptString(item.titleCipher, item.iv, key);
      } catch {
        displayTitle = '🔒 [Decryption Key Mismatch]';
      }
    }

    const dateStr = new Date(item.updatedAt || item.createdAt).toLocaleDateString();
    const sizeKB = (item.sizeBytes / 1024).toFixed(1);

    html += `
      <div class="vault-item-card">
        <div class="vic-left">
          <span class="vic-icon">🔐</span>
          <div class="vic-details">
            <span class="vic-title">${displayTitle}</span>
            <span class="vic-meta">AES-256-GCM • ${sizeKB} KB • Updated ${dateStr}</span>
          </div>
        </div>
        <button type="button" class="btn-decrypt-doc" onclick="handleDecryptAndRead('${item._id}')">
          🔓 Decrypt & Read
        </button>
      </div>
    `;
  }

  container.innerHTML = html;
}

async function handleDecryptAndRead(itemId) {
  if (!activeVaultSecret) {
    showToast('Please unlock vault with your master passphrase first.', 'error');
    return;
  }

  const token = localStorage.getItem('atelion_token');
  if (!token) return;

  try {
    const res = await fetch(`/api/vault/items/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch encrypted payload.');

    const item = data.item;

    // Decrypt on client device
    const decrypted = await AtelionVaultCrypto.decryptDocument({
      titleCipher: item.titleCipher,
      ciphertext: item.ciphertext,
      iv: item.iv,
      salt: item.salt,
      passphraseOrSeed: activeVaultSecret,
    });

    document.getElementById('decryptedTitle').textContent = decrypted.title;
    document.getElementById('decryptedContent').textContent = decrypted.content;
    document.getElementById('decryptedViewer').classList.remove('hidden');

    showToast('Decrypted securely on your device!', 'success');
  } catch (err) {
    showToast('Decryption failed. Ensure you entered the correct passphrase.', 'error');
  }
}

function closeDecryptedViewer() {
  document.getElementById('decryptedViewer').classList.add('hidden');
}

// ==============================================================================
// 12. ISOLATED TURSO HELPDESK CLIENT LOGIC
// ==============================================================================

let activeTicketId = null;

function toggleNewTicketForm() {
  const form = document.getElementById('newTicketForm');
  form.classList.toggle('hidden');
}

async function loadHelpDeskTickets() {
  const token = localStorage.getItem('atelion_token');
  if (!token) return;

  const container = document.getElementById('ticketsList');

  try {
    const res = await fetch('/api/helpdesk/tickets', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load support tickets from Turso.');

    const tickets = data.tickets || [];
    if (tickets.length === 0) {
      container.innerHTML = '<div class="empty-state">No support tickets found. Submit a new ticket to contact support!</div>';
      return;
    }

    container.innerHTML = tickets
      .map((t) => {
        const statusClass = t.status === 'resolved' ? 'tc-status-resolved' : t.status === 'closed' ? 'tc-status-closed' : 'tc-status-open';
        const dateStr = new Date(t.created_at).toLocaleDateString();
        return `
        <div class="ticket-card" onclick="openTicketThread('${t.id}')">
          <div class="tc-left">
            <span class="tt-number">#${t.ticket_number}</span>
            <div class="tc-details">
              <span class="tc-subject">${t.subject}</span>
              <span class="tc-meta">Category: ${t.category} • Priority: ${t.priority} • ${dateStr}</span>
            </div>
          </div>
          <span class="tc-status-pill ${statusClass}">${t.status}</span>
        </div>
      `;
      })
      .join('');
  } catch (err) {
    if (container) container.innerHTML = `<div class="empty-state">Unable to load tickets: ${err.message}</div>`;
  }
}

async function handleCreateTicketSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem('atelion_token');
  if (!token) return;

  const btn = document.getElementById('btnSubmitTicket');
  const payload = {
    category: document.getElementById('ticketCategory').value,
    priority: document.getElementById('ticketPriority').value,
    subject: document.getElementById('ticketSubject').value.trim(),
    description: document.getElementById('ticketDescription').value.trim(),
  };

  setButtonLoading(btn, true, 'Submitting to Turso...');

  try {
    const res = await fetch('/api/helpdesk/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create ticket.');

    showToast(`Support ticket #${data.ticket.ticketNumber} created in Turso DB!`, 'success');
    document.getElementById('ticketSubject').value = '';
    document.getElementById('ticketDescription').value = '';
    toggleNewTicketForm();
    loadHelpDeskTickets();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(btn, false, '🚀 Submit to Turso Helpdesk');
  }
}

async function openTicketThread(ticketId) {
  const token = localStorage.getItem('atelion_token');
  if (!token) return;

  activeTicketId = ticketId;
  const viewer = document.getElementById('ticketThreadViewer');
  const msgList = document.getElementById('threadMessagesList');

  try {
    const res = await fetch(`/api/helpdesk/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch ticket conversation.');

    document.getElementById('threadTicketNumber').textContent = `#${data.ticket.ticket_number}`;
    document.getElementById('threadSubject').textContent = data.ticket.subject;

    msgList.innerHTML = (data.messages || [])
      .map((m) => {
        const timeStr = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isAgent = m.sender_type === 'support_agent';
        return `
        <div class="tt-msg ${isAgent ? 'tt-msg-agent' : ''}">
          <div class="tt-msg-header">
            <span class="tt-msg-sender">${isAgent ? '🛡️ Support Team' : '👤 ' + m.sender_name}</span>
            <span class="tt-msg-time">${timeStr}</span>
          </div>
          <div class="tt-msg-body">${m.message}</div>
        </div>
      `;
      })
      .join('');

    viewer.classList.remove('hidden');
    msgList.scrollTop = msgList.scrollHeight;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleTicketReplySubmit(e) {
  e.preventDefault();
  if (!activeTicketId) return;

  const token = localStorage.getItem('atelion_token');
  if (!token) return;

  const input = document.getElementById('ticketReplyInput');
  const message = input.value.trim();
  if (!message) return;

  const btn = document.getElementById('btnSendReply');
  setButtonLoading(btn, true, 'Sending...');

  try {
    const res = await fetch(`/api/helpdesk/tickets/${activeTicketId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send reply.');

    input.value = '';
    showToast('Reply dispatched to Turso DB.', 'success');
    openTicketThread(activeTicketId);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(btn, false, 'Send');
  }
}

function closeTicketThread() {
  activeTicketId = null;
  document.getElementById('ticketThreadViewer').classList.add('hidden');
}

// ==============================================================================
// 13. SMART NOTES & SLASH-COMMAND HANDLERS
// ==============================================================================

function triggerSlashShortcut(cmd) {
  const editor = document.getElementById('smartNoteEditor');
  if (editor && window.workspaceEngine) {
    workspaceEngine.executeSlashCommand(cmd, editor);
  }
}

function handleLocalAISummarize() {
  const editor = document.getElementById('smartNoteEditor');
  if (editor && window.workspaceEngine) {
    workspaceEngine.executeSlashCommand('/summarize', editor);
  }
}

function handleLocalAIActions() {
  const editor = document.getElementById('smartNoteEditor');
  if (editor && window.workspaceEngine) {
    workspaceEngine.executeSlashCommand('/actions', editor);
  }
}

function renderEditorPreview() {
  const editor = document.getElementById('smartNoteEditor');
  const output = document.getElementById('previewRenderOutput');
  if (!editor || !output) return;

  const text = editor.value;
  if (!text.trim()) {
    output.innerHTML = '<div class="empty-state">No content to preview. Type something in the editor!</div>';
    return;
  }

  // 1. Process Markdown basics
  let html = text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\- \[x\] (.*$)/gim, '<div class="preview-todo done">☑ $1</div>')
    .replace(/^\- \[ \] (.*$)/gim, '<div class="preview-todo">☐ $1</div>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/\n$/gim, '<br />');

  // 2. Render KaTeX Math ($$...$$ and $...$)
  if (window.katex) {
    html = html.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
      try {
        return `<div class="katex-display">${katex.renderToString(math, { displayMode: true })}</div>`;
      } catch (e) {
        return match;
      }
    });

    html = html.replace(/\$([^$\n]+)\$/g, (match, math) => {
      try {
        return katex.renderToString(math, { displayMode: false });
      } catch (e) {
        return match;
      }
    });
  }

  output.innerHTML = html;

  // 3. Render Mermaid Diagrams
  if (window.mermaid) {
    try {
      mermaid.initialize({ startOnLoad: false, theme: 'dark' });
      mermaid.run({ nodes: output.querySelectorAll('.mermaid') });
    } catch (e) {
      console.warn('Mermaid render error:', e);
    }
  }
}

// ==============================================================================
// 14. STUDENT SUITE HANDLERS
// ==============================================================================

function flipFlashcard() {
  const inner = document.getElementById('flashcardInner');
  if (inner) inner.classList.toggle('flipped');
}

function handleAddNewFlashcard() {
  const qInput = document.getElementById('newFcQ');
  const aInput = document.getElementById('newFcA');
  const q = qInput.value.trim();
  const a = aInput.value.trim();

  if (!q || !a) {
    showToast('Please enter both question and answer.', 'error');
    return;
  }

  if (window.workspaceEngine) {
    workspaceEngine.addFlashcard(q, a);
    qInput.value = '';
    aInput.value = '';
  }
}

function generateFlashcardsFromCornell() {
  const notes = document.getElementById('cornellNotes').value;
  if (!notes || notes.trim().length < 20) {
    showToast('Add more lecture notes to generate flashcards.', 'error');
    return;
  }

  const cards = AtelionWorkspaceEngine.generateFlashcardsFromText(notes);
  if (cards.length > 0 && window.workspaceEngine) {
    cards.forEach((c) => workspaceEngine.addFlashcard(c.question, c.answer));
    showToast(`Generated ${cards.length} flashcards from Cornell Notes!`, 'success');
    switchDashTab('student');
  }
}

// ==============================================================================
// 15. PROFESSIONAL SUITE HANDLERS
// ==============================================================================

function handleGeneratePRD() {
  const name = document.getElementById('prdName').value.trim() || 'Core Feature';
  const audience = document.getElementById('prdAudience').value.trim() || 'Enterprise Teams';
  const problem = document.getElementById('prdProblem').value.trim() || 'Operational latency and data silo';
  const metrics = document.getElementById('prdMetrics').value.trim() || '<50ms latency, 99.99% uptime';

  const prdText = `
# 📋 Product Requirement Document: ${name}
**Target Audience:** ${audience}
**Status:** Approved for Sprint Planning
**Date:** ${new Date().toLocaleDateString()}

## 1. Problem Statement
${problem}

## 2. Key Performance Indicators (KPIs)
- ${metrics}
- High test coverage with zero security regressions.

## 3. High-Level Architecture
\`\`\`mermaid
graph LR
  Client[Web/Mobile Client] --> Cloudflare[Cloudflare Edge CDN]
  Cloudflare --> Express[Atelion Backend]
  Express --> Mongo[(Primary Atlas DB)]
  Express --> Turso[(Support Turso SQLite)]
\`\`\`

## 4. Milestone Schedule
- [x] Technical Architecture RFC
- [ ] Staging Cluster Release
- [ ] Enterprise Security Audit
`;

  const editor = document.getElementById('smartNoteEditor');
  if (editor) {
    editor.value = prdText;
    switchDashTab('notes');
    renderEditorPreview();
    showToast(`PRD for "${name}" generated and opened in Smart Notes!`, 'success');
  }
}

function handleAddNewAction() {
  const input = document.getElementById('newActionText');
  const text = input.value.trim();
  if (!text) return;

  const list = document.getElementById('profActionList');
  if (!list) return;

  const item = document.createElement('label');
  item.className = 'action-item';
  item.innerHTML = `
    <input type="checkbox">
    <span>${text}</span>
    <span class="priority-pill pri-high">High</span>
  `;
  list.appendChild(item);
  input.value = '';
  showToast('Milestone added to matrix', 'success');
}

// ==============================================================================
// 16. KNOWLEDGE GRAPH & WHITEBOARD HANDLERS
// ==============================================================================

function handleAddNewGraphNode() {
  const input = document.getElementById('newGraphNodeLabel');
  const label = input.value.trim();
  if (!label) return;

  if (knowledgeGraphInstance) {
    knowledgeGraphInstance.addNode(label, 'core');
    input.value = '';
    showToast(`Neural node "${label}" connected to knowledge map!`, 'success');
  }
}

function setWhiteboardTool(tool) {
  if (whiteboardInstance) whiteboardInstance.setTool(tool);
}

function setWhiteboardColor(color) {
  if (whiteboardInstance) whiteboardInstance.setColor(color);
}

