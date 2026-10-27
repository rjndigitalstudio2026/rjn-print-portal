'use strict';

/* =========================================================
   RJN PRINT PORTAL — FRONTEND APPLICATION
   Keeps existing dashboard, services, wallet and admin APIs.
   ========================================================= */

const $ = selector => document.querySelector(selector);

const esc = value =>
  String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);

const money = amount => '₹' + Number(amount || 0).toFixed(2);

let me = null;
let settings = {};
let services = [];
let view = 'home';
let authMode = 'login';
let demoItems = [];
let demoTimer = null;
let authBusy = false;

/* =========================
   API HELPERS
   ========================= */

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    // Some responses may not contain JSON.
  }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed. Please try again.');
  }

  return data;
}

const post = (url, data) => api(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

function notice(message) {
  window.alert(message);
}

function setButtonLoading(button, loading, loadingText = 'Please wait...') {
  if (!button) return;

  if (loading) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = loadingText;
    button.setAttribute('aria-busy', 'true');
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
    button.removeAttribute('aria-busy');
  }
}

function authMessage(message, type = 'error') {
  const area = $('#auth-message');
  if (!area) {
    notice(message);
    return;
  }

  area.textContent = message;
  area.className = 'auth-message ' + type;
  area.hidden = false;
}

function clearAuthMessage() {
  const area = $('#auth-message');
  if (area) {
    area.textContent = '';
    area.hidden = true;
    area.className = 'auth-message';
  }
}

/* =========================
   INITIALIZE PORTAL
   ========================= */

async function init() {
  try {
    const account = await api('/api/me');

    me = account.user || null;
    settings = account.settings || {};
    services = await api('/api/services');

    const logoutButton = $('#logout');

    if (logoutButton) {
      logoutButton.hidden = !me;

      logoutButton.onclick = async () => {
        try {
          await post('/api/logout', {});
          window.location.reload();
        } catch (error) {
          notice(error.message);
        }
      };
    }

    document.querySelectorAll('[data-view]').forEach(button => {
      button.onclick = () => render(button.dataset.view);
    });

    render('home');
  } catch (error) {
    const app = $('#app');

    if (app) {
      app.innerHTML = `
        <section class="panel">
          <h2>Cannot load portal</h2>
          <p>${esc(error.message)}</p>
          <button type="button" onclick="location.reload()">
            Try again
          </button>
        </section>
      `;
    }
  }
}

/* =========================
   AUTHENTICATION SCREEN
   ========================= */

function auth(mode = 'login') {
  const app = $('#app');
  if (!app) return;

  document.body.classList.add('auth-view');

  authMode = mode;
  authBusy = false;

  app.innerHTML = `
    <section class="auth-scene">

      <div class="auth-poster-panel">
        <img
          class="auth-ad-poster"
          src="${esc(settings.posterUrl || '/assets/rjn-print-portal-advertisement.png')}"
          alt="RJN PRINT PORTAL promotional advertisement"
        >

        <div class="auth-poster-caption">
          <span>RJN PRINT PORTAL</span>
          <strong>Your Digital Service &amp; Printing Partner</strong>
          <small>Fast · Simple · Convenient</small>
        </div>
      </div>

      <div class="panel auth-panel">

        <div class="auth-brand-mini">
          <img
            src="${esc(settings.logoUrl || '/assets/rjn-print-portal-logo.png')}"
            alt="RJN PRINT PORTAL logo"
          >
        </div>

        <div id="auth-form-area"></div>

        <p class="auth-footer muted">
          &copy; ${new Date().getFullYear()} RJN PRINT PORTAL
        </p>

      </div>
    </section>
  `;

  drawAuthForm();
}

/* =========================
   AUTH FORM COMPONENTS
   ========================= */

function passwordField(name, label, options = {}) {
  const {
    autocomplete = 'new-password',
    minlength = 8,
    placeholder = 'Enter password'
  } = options;

  return `
    <label class="password-field">
      <span>${esc(label)}</span>

      <span class="password-input-wrap">
        <input
          id="auth-${esc(name)}"
          name="${esc(name)}"
          type="password"
          autocomplete="${esc(autocomplete)}"
          minlength="${minlength}"
          placeholder="${esc(placeholder)}"
          required
        >

        <button
          class="password-toggle"
          type="button"
          data-toggle-password="auth-${esc(name)}"
          aria-label="Show password"
          aria-pressed="false"
        >Show</button>
      </span>
    </label>
  `;
}

function pinField(name = 'pin', label = 'PIN') {
  return `
    <label class="password-field">
      <span>${esc(label)}</span>

      <span class="password-input-wrap">
        <input
          id="auth-${esc(name)}"
          name="${esc(name)}"
          type="password"
          inputmode="numeric"
          pattern="[0-9]{4,8}"
          minlength="4"
          maxlength="8"
          autocomplete="off"
          placeholder="Enter your 4–8 digit PIN"
          required
        >

        <button
          class="password-toggle"
          type="button"
          data-toggle-password="auth-${esc(name)}"
          aria-label="Show PIN"
          aria-pressed="false"
        >Show</button>
      </span>
    </label>
  `;
}

function drawAuthForm() {
  const area = $('#auth-form-area');
  if (!area) return;

  clearAuthMessage();

  /* -------- REGISTER -------- */

  if (authMode === 'register') {
    area.innerHTML = `
      <h2>Create Account</h2>
      <p class="muted">
        Join RJN PRINT PORTAL to access your digital services.
      </p>

      <div id="auth-message" class="auth-message" role="status" hidden></div>

      <form id="register-form" class="auth-form">

        <label>
          Full name
          <input
            name="name"
            type="text"
            autocomplete="name"
            maxlength="100"
            placeholder="Enter your full name"
            required
          >
        </label>

        <label>
          Mobile number
          <input
            name="phone"
            type="tel"
            autocomplete="tel"
            maxlength="20"
            placeholder="Enter your mobile number"
            required
          >
        </label>

        <label>
          Email address
          <input
            name="email"
            type="email"
            autocomplete="email"
            maxlength="254"
            placeholder="Enter your email address"
            required
          >
        </label>

        ${passwordField('password', 'Password (minimum 8 characters)', {
          autocomplete: 'new-password',
          placeholder: 'Create a password'
        })}

        ${pinField('pin', 'Password recovery PIN (4–8 digits)')}

        <label class="auth-consent">
          <input type="checkbox" name="consent" required>
          <span>
            I confirm that the information provided is correct and agree
            to use this portal responsibly.
          </span>
        </label>

        <button class="auth-submit" type="submit">
          CREATE ACCOUNT
        </button>

      </form>

      <p class="auth-switch">
        Already registered?
        <button class="auth-link" type="button" data-auth="login">
          Sign in
        </button>
      </p>
    `;

    bindAuthControls();
    return;
  }

  /* -------- FORGOT PASSWORD -------- */

  if (authMode === 'forgot') {
    area.innerHTML = `
      <h2>Forgot Password?</h2>

      <p class="muted">
        Enter your account details and recovery PIN to continue.
      </p>

      <div id="auth-message" class="auth-message" role="status" hidden></div>

      <form id="forgot-verify-form" class="auth-form">

        <label>
          Full name
          <input
            name="name"
            type="text"
            autocomplete="name"
            maxlength="100"
            placeholder="Enter your registered name"
            required
          >
        </label>

        <label>
          Mobile number or Email ID
          <input
            name="identifier"
            type="text"
            autocomplete="username"
            placeholder="Enter registered mobile or email"
            required
          >
        </label>

        ${pinField('pin', 'Recovery PIN')}

        <button class="auth-submit" type="submit">
          VERIFY DETAILS
        </button>

      </form>

      <p class="auth-switch">
        <button class="auth-link" type="button" data-auth="login">
          ← Back to sign in
        </button>
      </p>
    `;

    bindAuthControls();
    return;
  }

  /* -------- RESET PASSWORD -------- */

  if (authMode === 'reset') {
    area.innerHTML = `
      <h2>Create New Password</h2>

      <p class="muted">
        Your details were verified. Choose a new password.
      </p>

      <div id="auth-message" class="auth-message" role="status" hidden></div>

      <form id="reset-password-form" class="auth-form">

        ${passwordField('password', 'New password', {
          autocomplete: 'new-password',
          placeholder: 'Enter a new password'
        })}

        ${passwordField('confirm', 'Confirm new password', {
          autocomplete: 'new-password',
          placeholder: 'Enter the new password again'
        })}

        <button class="auth-submit" type="submit">
          SAVE NEW PASSWORD
        </button>

      </form>

      <p class="muted small">
        Use at least 8 characters. Do not reuse a password that you use
        for another account.
      </p>
    `;

    bindAuthControls();
    return;
  }

  /* -------- LOGIN -------- */

  area.innerHTML = `
    <h2 class="auth-welcome">
      Welcome back <span aria-hidden="true">👋</span>
    </h2>

    <p class="muted">
      Sign in to continue to <strong>RJN PRINT PORTAL</strong>.
    </p>

    <div id="auth-message" class="auth-message" role="status" hidden></div>

    <form id="login-form" class="auth-form">

      <label>
        Mobile number or Email ID
        <input
          name="identifier"
          type="text"
          autocomplete="username"
          placeholder="Enter your mobile or email"
          required
        >
      </label>

      <div class="password-heading">
        <span>Password</span>
        <button
          type="button"
          class="auth-link compact"
          data-auth="forgot"
        >
          Forgot password?
        </button>
      </div>

      ${passwordField('password', 'Password', {
        autocomplete: 'current-password',
        placeholder: 'Enter your password'
      }).replace('<span>Password</span>', '')}

      <label class="auth-remember">
        <input type="checkbox" name="remember">
        <span>Remember this device</span>
      </label>

      <button class="auth-submit" type="submit">
        Sign in &rarr;
      </button>

    </form>

    <div class="auth-new">
      <span>New here?</span>
      <button
        class="auth-secondary"
        type="button"
        data-auth="register"
      >
        Create a free account
      </button>
    </div>
  `;

  bindAuthControls();
}

/* =========================
   AUTH CONTROL BINDINGS
   ========================= */

function bindAuthControls() {
  document.querySelectorAll('[data-auth]').forEach(button => {
    button.onclick = () => {
      auth(button.dataset.auth);
    };
  });

  document.querySelectorAll('[data-toggle-password]').forEach(button => {
    button.onclick = () => {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;

      const show = input.type === 'password';

      input.type = show ? 'text' : 'password';
      button.textContent = show ? 'Hide' : 'Show';
      button.setAttribute('aria-pressed', String(show));
      button.setAttribute(
        'aria-label',
        show ? 'Hide password' : 'Show password'
      );
    };
  });

  const loginForm = $('#login-form');
  if (loginForm) loginForm.onsubmit = handleLogin;

  const registerForm = $('#register-form');
  if (registerForm) registerForm.onsubmit = handleRegister;

  const forgotForm = $('#forgot-verify-form');
  if (forgotForm) forgotForm.onsubmit = handleForgotPassword;

  const resetForm = $('#reset-password-form');
  if (resetForm) resetForm.onsubmit = handleResetPassword;
}

/* =========================
   LOGIN
   ========================= */

async function handleLogin(event) {
  event.preventDefault();

  if (authBusy) return;

  const form = event.currentTarget;
  const formData = new FormData(form);
  const button = form.querySelector('[type="submit"]');

  const identifier = String(formData.get('identifier') || '').trim();
  const password = String(formData.get('password') || '');

  if (!identifier || !password) {
    authMessage('Enter your mobile/email and password.');
    return;
  }

  authBusy = true;
  setButtonLoading(button, true, 'Signing in...');

  try {
    const data = await post('/api/login', {
      identifier,
      password
    });

    me = data.user || null;

    const logoutButton = $('#logout');
    if (logoutButton) logoutButton.hidden = !me;

    notice('Login successful. Welcome, ' + (me?.name || 'Customer') + '!');

    await render('home');
  } catch (error) {
    authMessage(
      'Unable to sign in with those details. Check your information and try again.'
    );
  } finally {
    authBusy = false;

    if (button && button.isConnected) {
      setButtonLoading(button, false);
    }
  }
}

/* =========================
   REGISTER
   ========================= */

async function handleRegister(event) {
  event.preventDefault();

  if (authBusy) return;

  const form = event.currentTarget;
  const formData = new FormData(form);
  const button = form.querySelector('[type="submit"]');

  const name = String(formData.get('name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const pin = String(formData.get('pin') || '');
  const consent = formData.get('consent');

  if (!name || !phone || !email || !password || !pin) {
    authMessage('Please complete every required field.');
    return;
  }

  if (password.length < 8) {
    authMessage('Your password must contain at least 8 characters.');
    return;
  }

  if (!/^[0-9]{4,8}$/.test(pin)) {
    authMessage('Your recovery PIN must contain 4–8 digits.');
    return;
  }

  if (!consent) {
    authMessage('Please confirm the registration statement.');
    return;
  }

  authBusy = true;
  setButtonLoading(button, true, 'Creating account...');

  try {
    const data = await post('/api/register', {
      name,
      phone,
      email,
      password,
      pin
    });

    me = data.user || null;

    const logoutButton = $('#logout');
    if (logoutButton) logoutButton.hidden = !me;

    notice(
      'Account created successfully. Welcome, ' +
      (me?.name || name) + '!'
    );

    await render('home');
  } catch (error) {
    authMessage(error.message || 'Unable to create your account.');
  } finally {
    authBusy = false;

    if (button && button.isConnected) {
      setButtonLoading(button, false);
    }
  }
}

/* =========================
   FORGOT PASSWORD
   ========================= */

async function handleForgotPassword(event) {
  event.preventDefault();

  if (authBusy) return;

  const form = event.currentTarget;
  const formData = new FormData(form);
  const button = form.querySelector('[type="submit"]');

  const name = String(formData.get('name') || '').trim();
  const identifier = String(formData.get('identifier') || '').trim();
  const pin = String(formData.get('pin') || '');

  if (!name || !identifier || !pin) {
    authMessage('Complete all fields to verify your account.');
    return;
  }

  authBusy = true;
  setButtonLoading(button, true, 'Verifying...');

  try {
    await post('/api/forgot-password/verify', {
      name,
      identifier,
      pin
    });

    auth('reset');
    authMessage('Account verified. You can now choose a new password.', 'success');
  } catch (error) {
    authMessage(
      'The details could not be verified. Check them and try again.'
    );
  } finally {
    authBusy = false;

    if (button && button.isConnected) {
      setButtonLoading(button, false);
    }
  }
}

/* =========================
   RESET PASSWORD
   ========================= */

async function handleResetPassword(event) {
  event.preventDefault();

  if (authBusy) return;

  const form = event.currentTarget;
  const formData = new FormData(form);
  const button = form.querySelector('[type="submit"]');

  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm') || '');

  if (password.length < 8) {
    authMessage('Your new password must contain at least 8 characters.');
    return;
  }

  if (password !== confirm) {
    authMessage('The passwords do not match. Please try again.');
    return;
  }

  authBusy = true;
  setButtonLoading(button, true, 'Saving password...');

  try {
    await post('/api/forgot-password/reset', {
      password
    });

    auth('login');
    authMessage(
      'Password changed successfully. Please sign in with your new password.',
      'success'
    );
  } catch (error) {
    authMessage(error.message || 'Unable to reset your password.');
  } finally {
    authBusy = false;

    if (button && button.isConnected) {
      setButtonLoading(button, false);
    }
  }
}

/* =========================
   HOME PAGE
   ========================= */

function home() {
  return `
    <section class="hero">

      <h1>${esc(settings.portalName || 'RJN PRINT PORTAL')}</h1>

      <p>
        Digital services, print tools and application tracking in one place.
      </p>

      <img
        class="poster dashboard-ad"
        src="${esc(settings.posterUrl || '/assets/rjn-print-portal-advertisement.png')}"
        alt="RJN PRINT PORTAL advertisement poster"
      >

      <p>
        ${
          me
            ? `Welcome, ${esc(me.name)} · Wallet: <b>${money(me.wallet)}</b>`
            : 'Sign in to access services, wallet and applications.'
        }
      </p>

      ${
        !me
          ? `
            <div class="home-auth-actions">
              <button type="button" data-auth="login">Sign In</button>
              <button type="button" data-auth="register">Create Account</button>
            </div>
          `
          : ''
      }

    </section>

    <section class="panel demo-activity">

      <div class="section-title">
        <div>
          <span class="pill demo-pill">DEMO ONLY</span>
          <h2>Recent Activity Preview</h2>
          <p class="muted">
            Sample entries rotate every few seconds.
            These are not real customer applications.
          </p>
        </div>

        <span class="live-dot">● LIVE PREVIEW</span>
      </div>

      <div id="demoActivity" class="demo-activity-row">
        <strong>Loading demo activity...</strong>
      </div>

    </section>

    <div class="grid">

      <div class="panel">
        <h3>Digital services</h3>
        <p>Browse the services currently configured in your portal.</p>
        <button type="button" data-view="services">Browse services</button>
      </div>

      <div class="panel">
        <h3>Wallet history</h3>
        <p>View credits, debits, refunds and top-up requests.</p>
        <button type="button" data-view="wallet">Open wallet</button>
      </div>

      <div class="panel">
        <h3>My Applications</h3>
        <p>Track your submitted service requests and their status.</p>
        <button type="button" data-view="orders">View applications</button>
      </div>

      ${
        me
          ? `
            <div class="panel">
              <h3>Notifications</h3>
              <p>Check your account notifications.</p>
              <button type="button" data-view="notifications">
                View notifications
              </button>
            </div>
          `
          : ''
      }

    </div>
  `;
}

/* =========================
   SERVICES
   ========================= */

function servicePage() {
  return `
    <h1>All services</h1>

    <p class="muted">
      Available services and prices are loaded from the portal.
      Each service must have a working backend workflow before it can
      successfully process customer requests.
    </p>

    <div class="grid">
      ${
        services.map(service => `
          <article class="service">

            <div class="service-icon-wrap">
              <img
                class="service-icon"
                src="${esc(
                  service.icon ||
                  '/icons/services/01-color-aadhaar-maker-ai-instant-2-0.svg'
                )}"
                alt=""
                loading="lazy"
              >
            </div>

            <span class="pill">${esc(service.category)}</span>

            <h3>${esc(service.name)}</h3>

            <p class="muted">
              ${esc(service.notes || 'RJN digital service')}
            </p>

            <div class="price">
              ${Number(service.price) === 0 ? 'Free' : money(service.price)}
            </div>

            <button
              type="button"
              data-order="${esc(service.id)}"
              ${!me ? 'disabled' : ''}
            >
              ${me ? 'Submit request' : 'Sign in to use'}
            </button>

          </article>
        `).join('')
      }
    </div>
  `;
}

/* =========================
   WALLET
   ========================= */

async function walletPage() {
  if (!me) {
    auth('login');
    return '';
  }

  const data = await api('/api/customer/wallet');

  return `
    <section class="hero">
      <h2>My Wallet</h2>
      <div class="price">${money(data.balance)}</div>
      <p class="muted">
        Top-ups are credited only after admin verifies the payment.
      </p>
    </section>

    <section class="panel">
      <h3>Add money request</h3>

      <div class="row">

        <div class="field">
          <label for="topAmount">Amount (₹)</label>
          <input id="topAmount" type="number" min="1" step="1" value="100">
        </div>

        <div class="field">
          <label for="topUtr">UTR / transaction reference</label>
          <input
            id="topUtr"
            type="text"
            maxlength="100"
            placeholder="Enter payment reference"
          >
        </div>

      </div>

      <button id="topSubmit" type="button">
        Submit for admin verification
      </button>
    </section>

    <section class="panel">

      <h3>Wallet history</h3>

      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>Date / time</th>
              <th>Type</th>
              <th>Details</th>
              <th>Amount</th>
              <th>Balance after</th>
            </tr>
          </thead>

          <tbody>
            ${
              data.history.map(item => `
                <tr>
                  <td>${esc(new Date(item.createdAt).toLocaleString())}</td>
                  <td>${esc(item.type)}</td>
                  <td>${esc(item.note)}</td>
                  <td class="${
                    item.type === 'DEBIT'
                      ? 'red'
                      : item.type === 'REFUND'
                        ? 'yellow'
                        : 'green'
                  }">
                    ${item.type === 'DEBIT' ? '-' : '+'}${money(item.amount)}
                  </td>
                  <td>${money(item.balanceAfter)}</td>
                </tr>
              `).join('') ||
              '<tr><td colspan="5">No transactions yet.</td></tr>'
            }
          </tbody>
        </table>
      </div>

      <h3>Top-up requests</h3>

      ${
        data.topups.map(item => `
          <p>
            ${money(item.amount)}
            · ${esc(item.utr)}
            · ${esc(item.status)}
          </p>
        `).join('') || 'No top-up requests.'
      }

    </section>
  `;
}

/* =========================
   APPLICATIONS
   ========================= */

async function ordersPage() {
  if (!me) {
    auth('login');
    return '';
  }

  const orders = await api('/api/customer/orders');

  return `
    <section class="panel">
      <h2>My Applications</h2>

      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Service</th>
              <th>Charge</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            ${
              orders.map(order => `
                <tr>
                  <td>${esc(order.id)}</td>
                  <td>${esc(order.serviceName)}</td>
                  <td>${money(order.price)}</td>
                  <td>${esc(order.status)}</td>
                  <td>${esc(new Date(order.createdAt).toLocaleString())}</td>
                </tr>
              `).join('') ||
              '<tr><td colspan="5">No applications submitted.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/* =========================
   NOTIFICATIONS
   ========================= */

async function notificationsPage() {
  if (!me) {
    auth('login');
    return '';
  }

  const notifications = await api('/api/customer/notifications');

  return `
    <section class="panel">
      <h2>Notifications</h2>

      ${
        notifications.map(item => `
          <article class="service">
            <b>${esc(item.title)}</b>
            <p>${esc(item.message)}</p>

            <small>
              ${esc(new Date(item.createdAt).toLocaleString())}
              · ${item.read ? 'Read' : 'Unread'}
            </small>

            ${
              item.read
                ? ''
                : `
                  <button
                    type="button"
                    data-read="${esc(item.id)}"
                  >
                    Mark read
                  </button>
                `
            }
          </article>
        `).join('') || 'No notifications.'
      }
    </section>
  `;
}

/* =========================
   ADMIN PAGE
   ========================= */

async function adminPage() {
  if (!me) {
    auth('login');
    return '';
  }

  try {
    const [
      overview,
      adminServices,
      users,
      walletRequests,
      orders,
      ledger
    ] = await Promise.all([
      api('/api/admin/overview'),
      api('/api/admin/services'),
      api('/api/admin/customers'),
      api('/api/admin/wallet-requests'),
      api('/api/admin/orders'),
      api('/api/admin/ledger')
    ]);

    const adminSettings = overview.settings || {};

    return `
      <section class="panel">

        <h2>Admin control centre</h2>

        <div class="stats">

          <div class="stat">
            Customers
            <strong>${esc(overview.customers)}</strong>
          </div>

          <div class="stat">
            Services
            <strong>${esc(overview.services)}</strong>
          </div>

          <div class="stat">
            Orders
            <strong>${esc(overview.orders)}</strong>
          </div>

          <div class="stat">
            Pending top-ups
            <strong>${esc(overview.pendingTopups)}</strong>
          </div>

        </div>
      </section>

      <section class="panel">

        <h3>Service manager</h3>

        <div class="scroll">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th>Price</th>
                <th>Enabled</th>
                <th>Save</th>
              </tr>
            </thead>

            <tbody>
              ${
                adminServices.map(service => `
                  <tr>
                    <td>${esc(service.name)}</td>
                    <td>${esc(service.category)}</td>

                    <td>
                      <input
                        id="price-${esc(service.id)}"
                        type="number"
                        min="0"
                        step="0.01"
                        value="${esc(service.price)}"
                        style="width:100px"
                      >
                    </td>

                    <td>
                      <input
                        id="enabled-${esc(service.id)}"
                        type="checkbox"
                        ${service.enabled ? 'checked' : ''}
                        aria-label="Enable ${esc(service.name)}"
                      >
                    </td>

                    <td>
                      <button
                        type="button"
                        data-save-service="${esc(service.id)}"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>

        <h4>Add service</h4>

        <div class="row">
          <input id="newName" placeholder="Service name">

          <input
            id="newPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price ₹"
          >

          <select id="newCategory">
            <option value="automatic">automatic</option>
            <option value="pan">pan</option>
            <option value="manual">manual</option>
          </select>
        </div>

        <button id="addService" type="button">Add service</button>

      </section>

      <section class="panel">

        <h3>Wallet requests</h3>

        ${
          walletRequests.map(request => `
            <p>
              ${esc(request.utr)}
              · ${money(request.amount)}
              · ${esc(request.status)}

              ${
                request.status === 'PENDING'
                  ? `
                    <button type="button" data-approve="${esc(request.id)}">
                      Approve
                    </button>

                    <button type="button" data-reject="${esc(request.id)}">
                      Reject
                    </button>
                  `
                  : ''
              }
            </p>
          `).join('') || 'No requests.'
        }

      </section>

      <section class="panel">

        <h3>Manual wallet adjustment</h3>

        <div class="row">

          <select id="walletUser">
            ${
              users.map(user => `
                <option value="${esc(user.id)}">
                  ${esc(user.name)} · ${esc(user.phone)}
                </option>
              `).join('')
            }
          </select>

          <input
            id="walletAmount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Amount ₹"
          >

          <select id="walletType">
            <option value="CREDIT">Add money</option>
            <option value="DEBIT">Debit money</option>
            <option value="REFUND">Refund</option>
          </select>

        </div>

        <div class="field">
          <label for="walletReason">Reason / reference (required)</label>
          <input id="walletReason" maxlength="250">
        </div>

        <button id="walletAdjust" type="button">Apply adjustment</button>

      </section>

      <section class="panel">

        <h3>Broadcast notification</h3>

        <div class="field">
          <label for="ntitle">Title</label>
          <input id="ntitle" maxlength="150">
        </div>

        <div class="field">
          <label for="nmessage">Message</label>
          <textarea id="nmessage" maxlength="2000"></textarea>
        </div>

        <button id="broadcast" type="button">
          Send to all retailers/customers
        </button>

      </section>

      <section class="panel">

        <h3>Branding and advertisement</h3>

        <div class="field">
          <label for="portalName">Portal name</label>
          <input
            id="portalName"
            maxlength="100"
            value="${esc(adminSettings.portalName || 'RJN PRINT PORTAL')}"
          >
        </div>

        <div class="field">
          <label for="logoUrl">Logo image URL</label>
          <input
            id="logoUrl"
            type="url"
            maxlength="1000"
            value="${esc(adminSettings.logoUrl || '')}"
          >
        </div>

        <div class="field">
          <label for="posterUrl">Advertisement poster image URL</label>
          <input
            id="posterUrl"
            type="url"
            maxlength="1000"
            value="${esc(adminSettings.posterUrl || '')}"
          >
        </div>

        <div class="field">
          <label for="upiId">UPI ID</label>
          <input
            id="upiId"
            maxlength="200"
            value="${esc(adminSettings.upiId || '')}"
          >
        </div>

        <button id="saveSettings" type="button">Save settings</button>

        <p class="muted small">
          This section accepts image URLs. Secure file uploads and durable
          media storage require separate server-side configuration.
        </p>

      </section>

      <section class="panel">

        <h3>Recent wallet ledger</h3>

        <div class="scroll">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>User ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Reason</th>
              </tr>
            </thead>

            <tbody>
              ${
                ledger.slice(0, 100).map(item => `
                  <tr>
                    <td>${esc(new Date(item.createdAt).toLocaleString())}</td>
                    <td>${esc(item.userId)}</td>
                    <td>${esc(item.type)}</td>
                    <td>${money(item.amount)}</td>
                    <td>${money(item.balanceAfter)}</td>
                    <td>${esc(item.note)}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>

      </section>
    `;
  } catch (error) {
    return `
      <section class="panel">
        <h2>Admin panel unavailable</h2>
        <p>${esc(error.message)}</p>
        <p>Sign in with an authorized administrator account.</p>
      </section>
    `;
  }
}

/* =========================
   DEMO ACTIVITY
   ========================= */

async function startDemoActivity() {
  if (!demoItems.length) {
    try {
      const response = await fetch('/demo-activity.json', {
        cache: 'no-store'
      });

      if (!response.ok) return;

      const data = await response.json();
      demoItems = Array.isArray(data) ? data : [];
    } catch {
      return;
    }
  }

  if (demoTimer) {
    clearInterval(demoTimer);
  }

  const paint = () => {
    const element = $('#demoActivity');

    if (!element || !demoItems.length) return;

    const index = Math.floor(Date.now() / 2000) % demoItems.length;
    const item = demoItems[index] || {};

    const name = String(item.name || 'Sample user');
    const service = String(item.service || 'Sample service');

    element.innerHTML = `
      <div class="demo-index">
        #${index + 1} / ${demoItems.length}
      </div>

      <div class="demo-avatar">
        ${esc(name.slice(0, 1).toUpperCase())}
      </div>

      <div class="demo-copy">
        <strong>${esc(name)}</strong>
        <span>Demo entry · ${esc(service)}</span>
      </div>

      <span class="demo-tag">SAMPLE</span>
    `;
  };

  paint();
  demoTimer = setInterval(paint, 2000);
}

/* =========================
   PAGE RENDERING
   ========================= */

async function render(nextView) {
  document.body.classList.remove('auth-view');

  view = nextView;

  if (demoTimer) {
    clearInterval(demoTimer);
    demoTimer = null;
  }

  const app = $('#app');
  if (!app) return;

  try {
    let content;

    switch (nextView) {
      case 'home':
        content = home();
        break;

      case 'services':
        content = servicePage();
        break;

      case 'wallet':
        content = await walletPage();
        break;

      case 'orders':
        content = await ordersPage();
        break;

      case 'notifications':
        content = await notificationsPage();
        break;

      case 'admin':
        content = await adminPage();
        break;

      default:
        view = 'home';
        content = home();
    }

    // Auth-only pages are rendered by auth() and should not be replaced.
    if (document.body.classList.contains('auth-view')) return;

    app.innerHTML = content || '';

    bind();

    if (view === 'home') {
      startDemoActivity();
    }
  } catch (error) {
    app.innerHTML = `
      <section class="panel">
        <h2>Could not load this section</h2>
        <p>${esc(error.message)}</p>
        <button type="button" onclick="location.reload()">Try again</button>
      </section>
    `;
  }
}

/* =========================
   MAIN PAGE EVENT BINDINGS
   ========================= */

function bind() {
  document.querySelectorAll('[data-auth]').forEach(button => {
    button.onclick = () => auth(button.dataset.auth);
  });

  document.querySelectorAll('[data-view]').forEach(button => {
    button.onclick = () => render(button.dataset.view);
  });

  /* Submit service request */

  document.querySelectorAll('[data-order]').forEach(button => {
    button.onclick = async () => {
      if (!me) {
        auth('login');
        return;
      }

      const service = services.find(
        item => String(item.id) === String(button.dataset.order)
      );

      if (!service) {
        notice('Service not found. Please refresh the page.');
        return;
      }

      if (!window.confirm(
        `Submit ${service.name} for ${money(service.price)}?`
      )) {
        return;
      }

      setButtonLoading(button, true, 'Submitting...');

      try {
        const data = await post(
          '/api/service/' + encodeURIComponent(service.id) + '/request',
          { data: {} }
        );

        if (me && data.balance !== undefined) {
          me.wallet = data.balance;
        }

        notice('Order submitted: ' + (data.order?.id || 'Success'));

        await render('orders');
      } catch (error) {
        notice(error.message);
      } finally {
        if (button.isConnected) {
          setButtonLoading(button, false);
        }
      }
    };
  });

  /* Wallet top-up request */

  const topSubmit = $('#topSubmit');

  if (topSubmit) {
    topSubmit.onclick = async () => {
      const amount = Number($('#topAmount')?.value);
      const utr = String($('#topUtr')?.value || '').trim();

      if (!Number.isFinite(amount) || amount < 1) {
        notice('Enter a valid top-up amount.');
        return;
      }

      if (!utr) {
        notice('Enter your UTR / transaction reference.');
        return;
      }

      setButtonLoading(topSubmit, true, 'Submitting...');

      try {
        await post('/api/wallet/request', { amount, utr });

        notice('Top-up request sent for admin review.');

        await render('wallet');
      } catch (error) {
        notice(error.message);
      } finally {
        if (topSubmit.isConnected) {
          setButtonLoading(topSubmit, false);
        }
      }
    };
  }

  /* Mark notification as read */

  document.querySelectorAll('[data-read]').forEach(button => {
    button.onclick = async () => {
      setButtonLoading(button, true, 'Updating...');

      try {
        await post(
          '/api/customer/notifications/' +
          encodeURIComponent(button.dataset.read) +
          '/read',
          {}
        );

        await render('notifications');
      } catch (error) {
        notice(error.message);
      } finally {
        if (button.isConnected) {
          setButtonLoading(button, false);
        }
      }
    };
  });

  /* Save service price and availability */

  document.querySelectorAll('[data-save-service]').forEach(button => {
    button.onclick = async () => {
      const id = button.dataset.saveService;
      const priceInput = $('#price-' + CSS.escape(id));
      const enabledInput = $('#enabled-' + CSS.escape(id));

      const price = Number(priceInput?.value);

      if (!Number.isFinite(price) || price < 0) {
        notice('Enter a valid service price.');
        return;
      }

      setButtonLoading(button, true, 'Saving...');

      try {
        await api(
          '/api/admin/services/' + encodeURIComponent(id),
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              price,
              enabled: Boolean(enabledInput?.checked)
            })
          }
        );

        notice('Service updated successfully.');

        await render('admin');
      } catch (error) {
        notice(error.message);
      } finally {
        if (button.isConnected) {
          setButtonLoading(button, false);
        }
      }
    };
  });

  /* Add service */

  const addService = $('#addService');

  if (addService) {
    addService.onclick = async () => {
      const name = String($('#newName')?.value || '').trim();
      const price = Number($('#newPrice')?.value);
      const category = $('#newCategory')?.value || 'automatic';

      if (!name) {
        notice('Enter a service name.');
        return;
      }

      if (!Number.isFinite(price) || price < 0) {
        notice('Enter a valid price.');
        return;
      }

      setButtonLoading(addService, true, 'Adding...');

      try {
        await post('/api/admin/services', {
          name,
          price,
          category
        });

        services = await api('/api/services');

        notice('Service added successfully.');

        await render('admin');
      } catch (error) {
        notice(error.message);
      } finally {
        if (addService.isConnected) {
          setButtonLoading(addService, false);
        }
      }
    };
  }

  /* Approve wallet request */

  document.querySelectorAll('[data-approve]').forEach(button => {
    button.onclick = async () => {
      if (!window.confirm('Approve this wallet top-up request?')) return;

      setButtonLoading(button, true, 'Approving...');

      try {
        await post(
          '/api/admin/wallet-requests/' +
          encodeURIComponent(button.dataset.approve) +
          '/approve',
          {}
        );

        notice('Wallet request approved.');

        await render('admin');
      } catch (error) {
        notice(error.message);
      } finally {
        if (button.isConnected) {
          setButtonLoading(button, false);
        }
      }
    };
  });

  /* Reject wallet request */

  document.querySelectorAll('[data-reject]').forEach(button => {
    button.onclick = async () => {
      if (!window.confirm('Reject this wallet top-up request?')) return;

      setButtonLoading(button, true, 'Rejecting...');

      try {
        await post(
          '/api/admin/wallet-requests/' +
          encodeURIComponent(button.dataset.reject) +
          '/reject',
          {}
        );

        notice('Wallet request rejected.');

        await render('admin');
      } catch (error) {
        notice(error.message);
      } finally {
        if (button.isConnected) {
          setButtonLoading(button, false);
        }
      }
    };
  });

  /* Manual wallet adjustment */

  const walletAdjust = $('#walletAdjust');

  if (walletAdjust) {
    walletAdjust.onclick = async () => {
      const userId = $('#walletUser')?.value;
      const amount = Number($('#walletAmount')?.value);
      const type = $('#walletType')?.value;
      const reason = String($('#walletReason')?.value || '').trim();

      if (!userId) {
        notice('Select a customer.');
        return;
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        notice('Enter a valid amount greater than zero.');
        return;
      }

      if (!reason) {
        notice('Enter a reason or reference.');
        return;
      }

      if (!window.confirm('Apply this wallet adjustment?')) return;

      setButtonLoading(walletAdjust, true, 'Updating...');

      try {
        await post('/api/admin/wallet-adjustment', {
          userId,
          amount,
          type,
          reason
        });

        notice('Wallet updated successfully.');

        await render('admin');
      } catch (error) {
        notice(error.message);
      } finally {
        if (walletAdjust.isConnected) {
          setButtonLoading(walletAdjust, false);
        }
      }
    };
  }

  /* Broadcast notification */

  const broadcast = $('#broadcast');

  if (broadcast) {
    broadcast.onclick = async () => {
      const title = String($('#ntitle')?.value || '').trim();
      const message = String($('#nmessage')?.value || '').trim();

      if (!title || !message) {
        notice('Enter both a notification title and message.');
        return;
      }

      if (!window.confirm('Send this notification to all customers?')) {
        return;
      }

      setButtonLoading(broadcast, true, 'Sending...');

      try {
        const data = await post('/api/admin/notifications/broadcast', {
          title,
          message,
          audience: 'all'
        });

        notice('Notification sent to ' + (data.sent ?? 0) + ' accounts.');

        await render('admin');
      } catch (error) {
        notice(error.message);
      } finally {
        if (broadcast.isConnected) {
          setButtonLoading(broadcast, false);
        }
      }
    };
  }

  /* Save portal settings */

  const saveSettings = $('#saveSettings');

  if (saveSettings) {
    saveSettings.onclick = async () => {
      const portalName = String($('#portalName')?.value || '').trim();
      const logoUrl = String($('#logoUrl')?.value || '').trim();
      const posterUrl = String($('#posterUrl')?.value || '').trim();
      const upiId = String($('#upiId')?.value || '').trim();

      if (!portalName) {
        notice('Enter a portal name.');
        return;
      }

      setButtonLoading(saveSettings, true, 'Saving...');

      try {
        const data = await post('/api/admin/settings', {
          portalName,
          logoUrl,
          posterUrl,
          upiId
        });

        settings = data.settings || {
          ...settings,
          portalName,
          logoUrl,
          posterUrl,
          upiId
        };

        notice('Portal settings saved successfully.');

        await render('admin');
      } catch (error) {
        notice(error.message);
      } finally {
        if (saveSettings.isConnected) {
          setButtonLoading(saveSettings, false);
        }
      }
    };
  }
}

/* =========================
   START PORTAL
   ========================= */

init();
