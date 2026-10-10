'use strict';

const $ = (selector, root = document) => root.querySelector(selector);

const app = $('#app');
let nav = $('#nav');

let me = null;
let settings = {};
let services = [];
let chosen = null;

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));

const cash = value =>
  '₹' + Number(value || 0).toLocaleString('en-IN');

const uid = value => String(value ?? '');

function installStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #nav {
      display:flex;flex-wrap:wrap;align-items:center;gap:8px;
      padding:12px 5%;background:#21152e;color:white;
    }
    #nav button,.app-button {
      cursor:pointer;border:0;border-radius:9px;padding:11px 15px;
      font:inherit;font-weight:750;background:#7654ec;color:white;
    }
    #nav button:hover,.app-button:hover {filter:brightness(1.08)}
    .app-content {width:min(1200px,100%);margin:auto;padding:22px 5% 50px}
    .app-hero {
      padding:28px;border-radius:20px;color:white;
      background:linear-gradient(110deg,#7138e8,#b62ac1,#e63e75);
      margin-bottom:20px;
    }
    .app-hero h1 {margin:0 0 8px}
    .app-grid {
      display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
      gap:16px;margin:18px 0 26px;
    }
    .app-card {
      padding:22px;background:#fff;border:1px solid #e7e2ef;
      border-radius:17px;box-shadow:0 8px 25px #31204c0c;
      color:#242139;min-width:0;
    }
    .app-card h2,.app-card h3 {margin-top:0}
    .app-card p {line-height:1.55;overflow-wrap:anywhere}
    .app-card label {
      display:block;margin:14px 0;font-size:14px;font-weight:750;
    }
    .app-card input,.app-card textarea,.app-card select {
      display:block;width:100%;margin-top:7px;padding:12px;
      border:1px solid #ded8e9;border-radius:9px;background:white;
      color:#242139;font:inherit;max-width:100%;
    }
    .app-card textarea {min-height:90px;resize:vertical}
    .app-card button {margin:4px 5px 4px 0}
    .app-table {width:100%;border-collapse:collapse}
    .app-table td,.app-table th {
      text-align:left;padding:10px;border-bottom:1px solid #eee;
      overflow-wrap:anywhere;
    }
    .app-notice {
      padding:13px 15px;border-radius:10px;margin:12px 0;
      background:#e8f7ec;color:#176534;
    }
    .app-notice.error {background:#fff0f0;color:#a51e36}
    .app-muted {color:#77758a}
    .app-row {display:flex;gap:12px;flex-wrap:wrap;align-items:center}
    .app-row > * {min-width:0}
    .app-tag {
      display:inline-block;padding:5px 9px;border-radius:20px;
      background:#eee7ff;color:#653bb5;font-size:12px;font-weight:800;
    }
    .auth-layout {
      display:grid;grid-template-columns:1.2fr .8fr;gap:clamp(25px,5vw,70px);
      align-items:center;width:min(1400px,100%);margin:auto;
    }
    .auth-promo {color:white}
    .auth-logo {font-size:clamp(36px,5vw,64px);font-weight:950;line-height:1.05}
    .auth-tag {font-size:18px;line-height:1.65}
    .auth-feature-board {
      margin-top:28px;padding:17px;border-radius:22px;
      background:#ffffff20;border:1px solid #ffffff55;
    }
    .auth-feature-grid {
      display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;
    }
    .auth-feature {
      padding:15px 7px;border-radius:12px;background:white;color:#263052;
      font-size:12px;font-weight:800;text-align:center;
    }
    .auth-feature span {display:block;font-size:25px;color:#bd328e;margin-bottom:8px}
    .auth-card {
      padding:clamp(24px,3vw,38px);background:#fffafd;color:#202033;
      border-radius:25px;box-shadow:0 25px 70px #45113940;min-width:0;
    }
    .auth-brand-pill {
      display:inline-block;padding:9px 12px;border-radius:8px;
      background:#f1e8ff;color:#7837b8;font-size:12px;font-weight:900;
    }
    .auth-card h2 {font-size:30px;margin:23px 0 8px}
    .auth-card .muted {color:#77758a;line-height:1.6;font-size:14px}
    .auth-form label {
      display:block;margin-top:16px;font-size:14px;font-weight:750;
    }
    .auth-form input {
      display:block;width:100%;min-height:50px;margin-top:8px;
      padding:13px;border:1px solid #e1deea;border-radius:12px;
      background:white;color:#202033;font:inherit;
    }
    .auth-form input:focus {outline:3px solid #ead7ff;border-color:#ae4bc9}
    .auth-submit {
      width:100%;min-height:53px;margin-top:22px;border:0;
      border-radius:12px;color:white;font-weight:850;
      background:linear-gradient(100deg,#a52fc1,#df2467,#f3542a);
      cursor:pointer;
    }
    .auth-secondary {
      width:100%;min-height:49px;margin-top:15px;border:1px solid #e5e0eb;
      border-radius:12px;background:transparent;color:#25243a;cursor:pointer;
    }
    .auth-link {
      border:0;background:transparent;color:#823db5;
      font-weight:800;cursor:pointer;padding:0;
    }
    .auth-divider {
      display:flex;align-items:center;gap:12px;margin-top:23px;
      color:#9992a2;font-size:13px;
    }
    .auth-divider:before,.auth-divider:after {
      content:"";height:1px;background:#e6e1e9;flex:1;
    }
    .auth-contact {text-align:center;margin-top:20px;font-size:12px;line-height:2}
    .auth-contact a {color:#7837b8;text-decoration:none;overflow-wrap:anywhere}
    .auth-legal {text-align:center;font-size:11px;color:#888;margin-top:22px}
    .auth-password-row {display:flex;justify-content:space-between;align-items:center;gap:8px}
    .auth-password-wrap {position:relative}
    .auth-password-wrap input {padding-right:65px}
    .auth-password-wrap button {position:absolute;right:12px;top:23px}
    @media(max-width:850px) {
      .auth-layout {grid-template-columns:1fr;gap:22px;max-width:560px}
      .auth-promo {text-align:center}
      .auth-logo {font-size:35px}
      .auth-tag {font-size:14px}
      .auth-feature-board {display:none}
      .auth-card {padding:24px 20px}
      .app-content {padding:16px}
    }
    @media(max-width:420px) {
      .auth-feature-grid {grid-template-columns:repeat(2,minmax(0,1fr))}
      .auth-card h2 {font-size:26px}
      .app-card {padding:16px}
    }
  `;
  document.head.appendChild(style);
}

function setupNav() {
  if (nav) return;

  const header = $('header');

  nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  if (header) {
    header.insertAdjacentElement('afterend', nav);
  } else {
    document.body.prepend(nav);
  }
}

async function api(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  let body = options.body;

  if (body && !(body instanceof FormData) && typeof body !== 'string') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
    credentials: 'same-origin'
  });

  const type = response.headers.get('content-type') || '';
  const data = type.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      data?.error || data?.message || `Request failed (${response.status})`
    );
  }

  return data;
}

function notice(message, error = false) {
  let element = $('#app-notice');

  if (!element) {
    element = document.createElement('div');
    element.id = 'app-notice';
    element.className = 'app-notice';
    app.prepend(element);
  }

  element.textContent = message;
  element.classList.toggle('error', error);
  element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

const btn = (label, action, cls = 'app-button') =>
  `<button type="button" class="${cls}" data-a="${esc(action)}">${esc(label)}</button>`;

function shell() {
  setupNav();

  nav.innerHTML = me
    ? `
      <strong>${esc(me.name || me.email || 'Account')}</strong>
      ${btn('Dashboard', 'home')}
      ${btn('Add Money', 'wallet')}
      ${btn('My Requests', 'requests')}
      ${btn('Support Chat', 'chat')}
      ${me.role === 'admin' ? btn('Admin Panel', 'admin:dashboard') : ''}
      ${btn('Logout', 'logout')}
    `
    : btn('Login / Register', 'auth');
}

function auth(mode = 'login') {
  document.body.style.background =
    'linear-gradient(120deg,#a82dbb,#d21d63,#f45127)';

  shell();

  nav.style.display = 'none';

  app.className = '';
  app.innerHTML = `
    <section class="auth-layout">
      <div class="auth-promo">
        <div class="auth-logo">RJN PRINT<br>PORTAL</div>
        <p class="auth-tag">
          Your trusted digital service partner.<br>
          All daily work at one portal.
        </p>

        <div class="auth-feature-board">
          <div class="auth-feature-grid">
            <div class="auth-feature"><span>▤</span>Print Services</div>
            <div class="auth-feature"><span>▣</span>PAN Services</div>
            <div class="auth-feature"><span>⇧</span>Document Upload</div>
            <div class="auth-feature"><span>✓</span>Track Requests</div>
            <div class="auth-feature"><span>✎</span>Corrections</div>
            <div class="auth-feature"><span>⌕</span>Find Services</div>
            <div class="auth-feature"><span>▧</span>PDF & Photo</div>
            <div class="auth-feature"><span>◉</span>Customer Support</div>
          </div>
        </div>
        <p>✓ Secure account &nbsp; ✓ Easy access &nbsp; ✓ Customer support</p>
      </div>

      <section class="auth-card">
        <div class="auth-brand-pill">RJN DIGITAL STUDIO</div>
        <div id="authform"></div>

        <div class="auth-contact">
          <a href="tel:9365414365">☎ 9365414365</a><br>
          <a href="mailto:rjn.digitalstudio@gmail.com">
            ✉ rjn.digitalstudio@gmail.com
          </a>
        </div>

        <p class="auth-legal">
          © 2026 RJN PRINT PORTAL · Keep your password private.
        </p>
      </section>
    </section>
  `;

  const formArea = $('#authform');

  if (mode === 'register') {
    formArea.innerHTML = `
      <h2>Create your account</h2>
      <p class="muted">Register to access RJN PRINT PORTAL services.</p>

      <form id="register" class="auth-form">
        <label>Full Name
          <input name="name" autocomplete="name" maxlength="100" required>
        </label>

        <label>Mobile Number
          <input name="phone" type="tel" autocomplete="tel"
            maxlength="20" required>
        </label>

        <label>Email Address
          <input name="email" type="email" autocomplete="email" required>
        </label>

        <label>Password
          <div class="auth-password-wrap">
            <input id="register-password" name="password" type="password"
              minlength="8" autocomplete="new-password" required>
            <button type="button" class="auth-link" data-a="toggle:register-password">
              Show
            </button>
          </div>
        </label>

        <button class="auth-submit" type="submit">Create Account</button>
      </form>

      <div class="auth-divider">Already registered?</div>
      <button class="auth-secondary" type="button" data-a="tablogin">
        Sign In
      </button>
    `;
    return;
  }

  if (mode === 'forgot') {
    formArea.innerHTML = `
      <h2>Forgot Password?</h2>
      <p class="muted">
        Password recovery must be enabled on the server before you can reset
        your password.
      </p>

      <form id="forgotform" class="auth-form">
        <label>Registered Email
          <input name="email" type="email" autocomplete="email" required>
        </label>

        <button class="auth-submit" type="submit">Continue</button>
      </form>

      <button class="auth-secondary" type="button" data-a="tablogin">
        Back to Sign In
      </button>
    `;
    return;
  }

  formArea.innerHTML = `
    <h2>Welcome back 👋</h2>
    <p class="muted">
      Sign in to continue to <strong>RJN PRINT PORTAL</strong>.
    </p>

    <form id="login" class="auth-form">
      <label>Email or Mobile Number
        <input name="identifier" autocomplete="username"
          placeholder="Enter your email or mobile number" required>
      </label>

      <div class="auth-password-row">
        <label>Password</label>
        <button class="auth-link" type="button" data-a="forgot">
          Forgot password?
        </button>
      </div>

      <div class="auth-password-wrap">
        <input id="login-password" name="password" type="password"
          autocomplete="current-password" placeholder="Enter your password"
          required>
        <button class="auth-link" type="button" data-a="toggle:login-password">
          Show
        </button>
      </div>

      <button class="auth-submit" type="submit">Sign In →</button>
    </form>

    <div class="auth-divider">New here?</div>
    <button class="auth-secondary" type="button" data-a="tabregister">
      Create a free account
    </button>
  `;
}

function showContent() {
  document.body.style.background = '#f7f5fb';
  nav.style.display = 'flex';
  app.className = 'app-content';
}

async function start() {
  installStyles();
  setupNav();

  try {
    const data = await api('/api/me');
    me = data.user;
    settings = data.settings || {};
    shell();

    if (me) {
      await home();
    } else {
      auth('login');
    }
  } catch {
    me = null;
    shell();
    auth('login');
  }
}

async function home() {
  if (!me) return auth('login');

  shell();
  showContent();

  if (me.role === 'admin') {
    return admin('dashboard');
  }

  try {
    const result = await api('/api/services');
    services = Array.isArray(result) ? result : result.services || [];

    let stats = {
      wallet: me.wallet || 0,
      total: 0,
      pending: 0,
      completed: 0
    };

    try {
      stats = { ...stats, ...await api('/api/customer/stats') };
    } catch {}

    app.innerHTML = `
      <section class="app-hero">
        <h1>Hello, ${esc(me.name || 'Customer')}!</h1>
        <p>Welcome to RJN PRINT PORTAL</p>
      </section>

      <div class="app-grid">
        <section class="app-card">
          <p>WALLET BALANCE</p>
          <h2>${cash(stats.wallet)}</h2>
          ${btn('Add Money', 'wallet')}
        </section>

        <section class="app-card">
          <p>TOTAL REQUESTS</p><h2>${Number(stats.total || 0)}</h2>
        </section>

        <section class="app-card">
          <p>PENDING</p><h2>${Number(stats.pending || 0)}</h2>
        </section>

        <section class="app-card">
          <p>COMPLETED</p><h2>${Number(stats.completed || 0)}</h2>
        </section>
      </div>

      <h2>Available Services</h2>
      <div class="app-grid">
        ${services.map(service => `
          <section class="app-card">
            <h3>${esc(service.icon || '📄')} ${esc(service.name)}</h3>
            <p>${esc(service.description || 'Service request')}</p>
            <h3>${cash(service.price)}</h3>
            ${btn('Apply Now', 'service:' + service.id)}
          </section>
        `).join('') || '<p>No services are available right now.</p>'}
      </div>
    `;
  } catch (error) {
    app.innerHTML = `
      <section class="app-card">
        <h2>Unable to load services</h2>
        <p>${esc(error.message)}</p>
        ${btn('Retry', 'home')}
      </section>
    `;
  }
}

function serviceFields(service) {
  const name = String(service.name || '').toLowerCase();

  if (name.includes('pan id')) {
    return [
      ['name', 'Full Name', 'text', true],
      ['shopName', 'Shop Name', 'text', true],
      ['shopAddress', 'Shop Address', 'text', true],
      ['pinCode', 'PIN Code', 'text', true],
      ['state', 'State', 'text', true],
      ['mobile', 'Mobile Number', 'tel', true],
      ['email', 'Email ID', 'email', true],
      ['aadhaarNumber', 'Aadhaar Number', 'text', true],
      ['panNumber', 'PAN Number (Optional)', 'text', false]
    ];
  }

  if (name.includes('mobile recharge id')) {
    return [
      ['name', 'Full Name', 'text', true],
      ['address', 'Address', 'text', true],
      ['mobile', 'Mobile Number', 'tel', true],
      ['email', 'Email ID', 'email', true]
    ];
  }

  return (service.fields || []).map(field => Array.isArray(field)
    ? [field[0], field[1], field[2] || 'text', field[3]]
    : [
        field.name || field.key || field.label,
        field.label || field.name || field.key,
        field.type || 'text',
        field.required
      ]);
}

function serviceForm(service) {
  if (!service) return notice('Service not found.', true);

  chosen = service;
  showContent();

  app.innerHTML = `
    <section class="app-card">
      ${btn('← Back', 'home')}
      <h2>${esc(service.name)}</h2>
      <p>${esc(service.description || '')}</p>
      <p>Charge: <strong>${cash(service.price)}</strong></p>

      <form id="serviceform">
        <div class="app-grid">
          ${serviceFields(service).map(([key, label, type, required]) => {
            const allowed = ['text', 'tel', 'email', 'number', 'date'];
            const inputType = allowed.includes(type) ? type : 'text';

            return `
              <label>${esc(label)}
                <input name="${esc(key)}" type="${inputType}"
                  ${required === false ? '' : 'required'}>
              </label>
            `;
          }).join('')}
        </div>

        <label>Supporting Documents
          <input name="files" type="file" multiple
            accept=".jpg,.jpeg,.png,.pdf">
        </label>

        <label>Additional Instructions
          <textarea name="notes" maxlength="1000"></textarea>
        </label>

        <p class="app-muted">
          Submit only accurate information and documents you are authorised
          to provide.
        </p>

        <button class="app-button" type="submit">Submit Request</button>
      </form>
    </section>
  `;
}

async function wallet() {
  showContent();

  app.innerHTML = `
    <section class="app-card">
      ${btn('← Back', 'home')}
      <h2>Add Money</h2>
      <p>UPI ID: <strong>${esc(settings.upiId || 'Contact admin')}</strong></p>
      <p class="app-muted">
        Wallet funds are added only after manual admin verification.
      </p>

      <form id="walletform">
        <label>Amount (₹)
          <input name="amount" type="number" min="1" step="1" required>
        </label>

        <label>UTR / Transaction ID
          <input name="utr" maxlength="100" required>
        </label>

        <label>Payment Screenshot
          <input name="proof" type="file" accept="image/*" required>
        </label>

        <button class="app-button" type="submit">Submit for Approval</button>
      </form>
    </section>
  `;
}

async function requests() {
  showContent();

  try {
    let rows = await api('/api/customer/requests');
    rows = Array.isArray(rows) ? rows : rows.requests || [];

    app.innerHTML = `
      <section class="app-card">
        ${btn('← Back', 'home')}
        <h2>My Requests</h2>

        ${rows.map(request => `
          <article class="app-card">
            <h3>${esc(request.serviceName || 'Service Request')}</h3>
            <p>Order: ${esc(request.id || '')}</p>
            <p>Charge: ${cash(request.fee ?? request.price)}</p>
            <p>Status: <span class="app-tag">${esc(request.status || 'Pending')}</span></p>
            ${request.resultAvailable
              ? btn('Download Result', 'result:' + request.id)
              : ''}
          </article>
        `).join('') || '<p>No requests yet.</p>'}
      </section>
    `;
  } catch (error) {
    app.innerHTML = `
      <section class="app-card">
        <p>${esc(error.message)}</p>${btn('Back', 'home')}
      </section>
    `;
  }
}

async function chat() {
  showContent();

  try {
    let messages = await api('/api/chat');
    messages = Array.isArray(messages) ? messages : messages.messages || [];

    app.innerHTML = `
      <section class="app-card">
        ${btn('← Back', 'home')}
        <h2>Support Chat</h2>

        <div>
          ${messages.map(message => `
            <article class="app-card">
              <b>${esc(message.from || 'Support')}</b>
              <p>${esc(message.text || '')}</p>
              <small class="app-muted">${esc(message.createdAt || '')}</small>
            </article>
          `).join('') || '<p>No messages yet.</p>'}
        </div>

        <form id="chatform">
          <label>Message
            <textarea name="message" maxlength="2000" required></textarea>
          </label>
          <button class="app-button" type="submit">Send Message</button>
        </form>
      </section>
    `;
  } catch (error) {
    app.innerHTML = `
      <section class="app-card">
        <p>${esc(error.message)}</p>${btn('Back', 'home')}
      </section>
    `;
  }
}

async function admin(tab = 'dashboard') {
  if (!me || me.role !== 'admin') return auth('login');

  shell();
  showContent();

  app.innerHTML = `
    <section class="app-hero">
      <h1>RJN PRINT PORTAL — Admin</h1>
      <div class="app-row">
        ${btn('Overview', 'admin:dashboard')}
        ${btn('Customers', 'admin:customers')}
        ${btn('Wallet Requests', 'admin:wallet')}
        ${btn('Service Requests', 'admin:requests')}
        ${btn('Services', 'admin:services')}
        ${btn('Support Chat', 'admin:chat')}
      </div>
    </section>
    <section id="adm" class="app-card">Loading...</section>
  `;

  const element = $('#adm');

  try {
    let html = '';

    if (tab === 'dashboard') {
      const data = await api('/api/admin/dashboard');

      html = `
        <h2>Overview</h2>
        <div class="app-grid">
          ${Object.entries(data).map(([key, value]) => `
            <article class="app-card">
              <p>${esc(key.replace(/([A-Z])/g, ' $1'))}</p>
              <h2>${esc(value)}</h2>
            </article>
          `).join('')}
        </div>
      `;
    }

    if (tab === 'customers') {
      const customers = await api('/api/admin/customers');

      html = `
        <h2>Customers</h2>
        ${customers.map(customer => `
          <article class="app-card">
            <b>${esc(customer.name)}</b>
            <p>${esc(customer.phone)} · ${esc(customer.email)}</p>
            <p>Wallet: ${cash(customer.wallet)}</p>
          </article>
        `).join('') || '<p>No customers found.</p>'}
      `;
    }

    if (tab === 'wallet') {
      const requests = await api('/api/admin/wallet');

      html = `
        <h2>Wallet Requests</h2>
        ${requests.map(request => `
          <article class="app-card">
            <h3>${esc(request.customer || 'Customer')}</h3>
            <p>Amount: ${cash(request.amount)}</p>
            <p>UTR: ${esc(request.utr)}</p>
            <p>Status: ${esc(request.status)}</p>
            ${request.status === 'Pending' ? `
              ${btn('Approve', 'approve:' + request.id)}
              ${btn('Reject', 'reject:' + request.id)}
            ` : ''}
          </article>
        `).join('') || '<p>No wallet requests found.</p>'}
      `;
    }

    if (tab === 'requests') {
      const requests = await api('/api/admin/requests');

      html = `
        <h2>Service Requests</h2>
        ${requests.map(request => `
          <article class="app-card">
            <h3>${esc(request.serviceName || 'Service')}</h3>
            <p>Customer: ${esc(request.customer || '')}</p>
            <p>Charge: ${cash(request.fee)}</p>
            <p>Status: ${esc(request.status)}</p>
            <details>
              <summary>Application details</summary>
              <pre>${esc(JSON.stringify(request.data || {}, null, 2))}</pre>
            </details>

            <form class="processform" data-id="${esc(request.id)}">
              <label>Processing Status
                <select name="status">
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </label>
              <label>Result File (required for Completed)
                <input type="file" name="result">
              </label>
              <button class="app-button" type="submit">Update Request</button>
            </form>
          </article>
        `).join('') || '<p>No service requests found.</p>'}
      `;
    }

    if (tab === 'services') {
      const allServices = await api('/api/admin/services');

      html = `
        <h2>Manage Services</h2>

        <form id="addservice">
          <label>Service Name
            <input name="name" required>
          </label>
          <label>Price (₹)
            <input name="price" type="number" min="0" required>
          </label>
          <label>Description
            <input name="description">
          </label>
          <button class="app-button" type="submit">Add Service</button>
        </form>

        <h3>Existing Services</h3>
        ${allServices.map(service => `
          <article class="app-card">
            <b>${esc(service.name)}</b>
            <p>${cash(service.price)}</p>
            <p>Status: ${service.enabled ? 'Enabled' : 'Disabled'}</p>
            ${btn('Disable Service', 'disable-service:' + service.id)}
          </article>
        `).join('')}
      `;
    }

    if (tab === 'chat') {
      const customers = await api('/api/admin/chat/users');

      html = `
        <h2>Support Chats</h2>
        ${customers.map(customer => `
          <article class="app-card">
            <b>${esc(customer.name)}</b>
            <p>${esc(customer.email)}</p>
            <p>Unread: ${Number(customer.unread || 0)}</p>
            ${btn('Open Chat', 'admin-chat:' + customer.id)}
          </article>
        `).join('') || '<p>No support conversations found.</p>'}
      `;
    }

    element.innerHTML = html || '<p>No records found.</p>';
  } catch (error) {
    element.innerHTML = `
      <div class="app-notice error">${esc(error.message)}</div>
    `;
  }
}

async function adminChat(userId) {
  showContent();

  try {
    const messages = await api('/api/admin/chat/' + encodeURIComponent(userId));

    app.innerHTML = `
      <section class="app-card">
        ${btn('← Back to Chats', 'admin:chat')}
        <h2>Customer Support Chat</h2>

        ${messages.map(message => `
          <article class="app-card">
            <b>${esc(message.from)}</b>
            <p>${esc(message.text || '')}</p>
            <small>${esc(message.createdAt || '')}</small>
          </article>
        `).join('')}

        <form id="adminchatform" data-user="${esc(userId)}">
          <label>Reply
            <textarea name="message" maxlength="2000" required></textarea>
          </label>
          <button class="app-button" type="submit">Send Reply</button>
        </form>
      </section>
    `;
  } catch (error) {
    app.innerHTML = `
      <section class="app-card">
        <p>${esc(error.message)}</p>${btn('Back', 'admin:chat')}
      </section>
    `;
  }
}

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-a]');
  if (!button) return;

  const action = button.dataset.a;

  try {
    if (action === 'auth') return auth('login');
    if (action === 'tablogin') return auth('login');
    if (action === 'tabregister') return auth('register');
    if (action === 'forgot') return auth('forgot');
    if (action === 'home') return home();
    if (action === 'wallet') return wallet();
    if (action === 'requests') return requests();
    if (action === 'chat') return chat();

    if (action.startsWith('toggle:')) {
      const input = $('#' + CSS.escape(action.slice(7)));
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        button.textContent = input.type === 'password' ? 'Show' : 'Hide';
      }
      return;
    }

    if (action === 'logout') {
      await api('/api/logout', { method: 'POST', body: {} });
      me = null;
      settings = {};
      shell();
      return auth('login');
    }

    if (action.startsWith('service:')) {
      services = await api('/api/services');
      return serviceForm(
        services.find(service => uid(service.id) === action.slice(8))
      );
    }

    if (action.startsWith('admin:')) {
      return admin(action.split(':')[1]);
    }

    if (action.startsWith('approve:') || action.startsWith('reject:')) {
      const [decision, requestId] = action.split(':');

      if (!confirm('Confirm this wallet decision?')) return;

      await api(
        '/api/admin/wallet/' + encodeURIComponent(requestId) + '/' +
        (decision === 'approve' ? 'approve' : 'reject'),
        { method: 'POST', body: {} }
      );

      return admin('wallet');
    }

    if (action.startsWith('process:') || action.startsWith('rejectreq:')) {
      const rejected = action.startsWith('rejectreq:');
      const requestId = action.slice(rejected ? 10 : 8);

      await api('/api/admin/request/' + encodeURIComponent(requestId) + '/process', {
        method: 'POST',
        body: { status: rejected ? 'Rejected' : 'Processing' }
      });

      return admin('requests');
    }

    if (action.startsWith('disable-service:')) {
      const serviceId = action.slice('disable-service:'.length);

      if (!confirm('Disable this service?')) return;

      await api('/api/admin/services/' + encodeURIComponent(serviceId), {
        method: 'DELETE'
      });

      return admin('services');
    }

    if (action.startsWith('admin-chat:')) {
      return adminChat(action.slice('admin-chat:'.length));
    }

    if (action.startsWith('result:')) {
      const requestId = action.slice('result:'.length);
      window.open('/api/result/' + encodeURIComponent(requestId), '_blank');
    }
  } catch (error) {
    notice(error.message, true);
  }
});

document.addEventListener('submit', async event => {
  const form = event.target;
  if (!form.matches('form')) return;

  event.preventDefault();

  const submitButton = form.querySelector('[type="submit"],button:not([type])');
  if (submitButton) submitButton.disabled = true;

  try {
    if (form.id === 'login') {
      const result = await api('/api/login', {
        method: 'POST',
        body: Object.fromEntries(new FormData(form))
      });

      me = result.user || result;
      settings = result.settings || {};
      shell();
      return home();
    }

    if (form.id === 'register') {
      const result = await api('/api/register', {
        method: 'POST',
        body: Object.fromEntries(new FormData(form))
      });

      me = result.user || result;
      settings = result.settings || {};
      shell();
      return home();
    }

    if (form.id === 'forgotform') {
      notice(
        'Password recovery is not yet connected to the server. ' +
        'The next step is to update server.js with a secure recovery process.',
        true
      );
      return;
    }

    if (form.id === 'serviceform') {
      if (!chosen) throw new Error('Please select a service again.');

      const formData = new FormData(form);
      const data = {};

      for (const [key, value] of formData.entries()) {
        if (key !== 'files' && typeof value === 'string') {
          data[key] = value;
        }
      }

      const request = new FormData();
      request.append('data', JSON.stringify(data));

      for (const file of form.querySelector('[name="files"]').files) {
        request.append('files', file);
      }

      await api('/api/service/' + encodeURIComponent(chosen.id) + '/request', {
        method: 'POST',
        body: request
      });

      chosen = null;
      await home();
      return notice('Your service request has been submitted.');
    }

    if (form.id === 'walletform') {
      await api('/api/wallet/request', {
        method: 'POST',
        body: new FormData(form)
      });

      await wallet();
      return notice('Submitted for manual verification.');
    }

    if (form.id === 'chatform') {
      await api('/api/chat', {
        method: 'POST',
        body: Object.fromEntries(new FormData(form))
      });

      return chat();
    }

    if (form.id === 'adminchatform') {
      const userId = form.dataset.user;

      await api('/api/admin/chat/' + encodeURIComponent(userId), {
        method: 'POST',
        body: Object.fromEntries(new FormData(form))
      });

      return adminChat(userId);
    }

    if (form.id === 'addservice') {
      await api('/api/admin/services', {
        method: 'POST',
        body: Object.fromEntries(new FormData(form))
      });

      return admin('services');
    }

    if (form.classList.contains('processform')) {
      const requestId = form.dataset.id;
      const status = new FormData(form).get('status');
      const fileInput = form.querySelector('[name="result"]');

      if (status === 'Completed' && !fileInput.files.length) {
        throw new Error('Choose a result file before marking it Completed.');
      }

      const data = new FormData();
      data.append('status', status);

      if (fileInput.files.length) {
        data.append('result', fileInput.files[0]);
      }

      await api('/api/admin/request/' + encodeURIComponent(requestId) + '/process', {
        method: 'POST',
        body: data
      });

      return admin('requests');
    }
  } catch (error) {
    notice(error.message, true);
  } finally {
    if (submitButton && submitButton.isConnected) {
      submitButton.disabled = false;
    }
  }
});

start();
