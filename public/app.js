'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const app = $('#app');
let nav = $('#nav');
let me = null;
let settings = {};
let services = [];
let chosen = null;

const SERVICE_ICONS = {
  'pan': 'pan.svg',
  'aadhaar': 'aadhaar.svg',
  'voter': 'voter.svg',
  'rc': 'rc-dl.svg',
  'dl': 'rc-dl.svg',
  'online': 'online-forms.svg',
  'form': 'online-forms.svg',
  'pdf': 'pdf.svg',
  'print': 'printing.svg',
  'photo': 'printing.svg',
  'recharge': 'recharge.svg',
  'utility': 'utilities.svg',
  'more': 'more-services.svg'
};

const FEATURE_CARDS = [
  { name: 'PAN Services', icon: 'pan.svg', key: 'pan' },
  { name: 'Aadhaar Services', icon: 'aadhaar.svg', key: 'aadhaar' },
  { name: 'Voter Services', icon: 'voter.svg', key: 'voter' },
  { name: 'RC & DL Services', icon: 'rc-dl.svg', key: 'rc' },
  { name: 'Online Applications', icon: 'online-forms.svg', key: 'online' },
  { name: 'Print & PDF Tools', icon: 'pdf.svg', key: 'pdf' },
  { name: 'Photo & Print', icon: 'printing.svg', key: 'print' },
  { name: 'Mobile Recharge', icon: 'recharge.svg', key: 'recharge' },
  { name: 'Utility Services', icon: 'utilities.svg', key: 'utility' },
  { name: 'Many More Services', icon: 'more-services.svg', key: 'more' }
];

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));

const cash = value =>
  '₹' + Number(value || 0).toLocaleString('en-IN');

const serviceImage = filename =>
  '/images/services/' + encodeURIComponent(filename);

function getFeatureIcon(service) {
  const name = String(service.name || '').toLowerCase();

  for (const [keyword, filename] of Object.entries(SERVICE_ICONS)) {
    if (name.includes(keyword)) return filename;
  }

  return 'more-services.svg';
}

function installStyles() {
  if ($('#rjn-app-styles')) return;

  const style = document.createElement('style');
  style.id = 'rjn-app-styles';

  style.textContent = `
    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Inter, Arial, system-ui, sans-serif;
      background: #f7f5fb;
      color: #202033;
    }

    button, input, textarea, select { font: inherit; }

    button {
      cursor: pointer;
      transition: transform .18s ease, filter .18s ease;
    }

    button:hover {
      filter: brightness(1.06);
      transform: translateY(-1px);
    }

    button:active { transform: scale(.98); }
    button:disabled { opacity: .6; cursor: wait; }

    #nav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 12px 5%;
      background: #111d49;
      color: white;
    }

    #nav button, .app-button {
      border: 0;
      border-radius: 10px;
      padding: 11px 15px;
      font-weight: 800;
      background: #315ce8;
      color: white;
    }

    .app-content {
      width: min(1200px, 100%);
      margin: auto;
      padding: 22px 5% 50px;
    }

    .app-hero {
      padding: 28px;
      border-radius: 20px;
      color: white;
      background: linear-gradient(110deg, #142f9c, #7138e8, #e63e75);
      margin-bottom: 20px;
    }

    .app-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin: 18px 0 26px;
    }

    .app-card {
      padding: 22px;
      background: white;
      border: 1px solid #e7e2ef;
      border-radius: 17px;
      box-shadow: 0 8px 25px #31204c0c;
      color: #242139;
      min-width: 0;
    }

    .app-card label {
      display: block;
      margin: 14px 0;
      font-size: 14px;
      font-weight: 750;
    }

    .app-card input,
    .app-card textarea,
    .app-card select {
      display: block;
      width: 100%;
      max-width: 100%;
      margin-top: 7px;
      padding: 12px;
      border: 1px solid #ded8e9;
      border-radius: 10px;
      background: white;
      color: #242139;
    }

    .app-card textarea { min-height: 90px; resize: vertical; }
    .app-card button { margin: 4px 5px 4px 0; }

    .app-notice {
      padding: 13px 15px;
      border-radius: 10px;
      margin: 12px 0;
      background: #e8f7ec;
      color: #176534;
    }

    .app-notice.error { background: #fff0f0; color: #a51e36; }
    .app-muted, .muted { color: #77758a; }

    .app-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }

    .app-tag {
      display: inline-block;
      padding: 5px 9px;
      border-radius: 20px;
      background: #eee7ff;
      color: #653bb5;
      font-size: 12px;
      font-weight: 800;
    }

    /* Login page */
    .auth-page {
      min-height: 100vh;
      padding: 20px clamp(12px, 3vw, 45px);
      background: linear-gradient(-45deg, #062a8e, #4020c9, #b52fd0, #ff5574);
      background-size: 350% 350%;
      animation: authGradient 14s ease infinite;
      overflow: hidden;
    }

    @keyframes authGradient {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .auth-topbar {
      padding: 12px 16px;
      margin: 0 auto 22px;
      max-width: 1450px;
      border-radius: 12px;
      background: #ffcf32;
      color: #18234a;
      font-size: 13px;
      font-weight: 850;
      text-align: center;
    }

    .auth-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(330px, .8fr);
      gap: clamp(24px, 5vw, 72px);
      align-items: center;
      width: min(1450px, 100%);
      min-height: calc(100vh - 105px);
      margin: auto;
    }

    .auth-promo {
      color: white;
      animation: authEnter .7s ease both;
    }

    @keyframes authEnter {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .auth-logo-image {
      width: 100px;
      height: 100px;
      object-fit: contain;
      display: block;
      margin: 0 auto 14px;
    }

    .auth-logo {
      font-size: clamp(36px, 5.2vw, 70px);
      font-weight: 1000;
      letter-spacing: -1.5px;
      line-height: 1.02;
    }

    .auth-logo .print { color: #ffca28; }
    .auth-logo .portal { color: #26d9ff; }

    .auth-tagline {
      font-size: clamp(15px, 1.7vw, 22px);
      line-height: 1.55;
      margin: 18px 0;
    }

    .auth-service-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 24px;
    }

    .auth-service-pills span {
      padding: 11px 13px;
      border-radius: 12px;
      border: 1px solid #ffffff40;
      background: #ffffff16;
      font-size: 13px;
      font-weight: 850;
    }

    /* Real illustrated SVG service cards */
    .auth-feature-board {
      margin-top: 18px;
      padding: 14px;
      border-radius: 20px;
      background: #071d8c44;
      border: 1px solid #ffffff40;
      box-shadow: 0 15px 40px #080d6533;
    }

    .auth-feature-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 10px;
    }

    .auth-feature {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 0;
      min-height: 112px;
      padding: 12px 6px;
      border-radius: 15px;
      background: linear-gradient(145deg, #1638b6aa, #111c75aa);
      border: 1px solid #8bdfff65;
      color: white;
      font-size: 12px;
      font-weight: 800;
      text-align: center;
      box-shadow: inset 0 0 15px #42c6ff12, 0 0 12px #1889ff10;
      cursor: pointer;
    }

    .auth-feature:hover {
      background: linear-gradient(145deg, #2253e5, #4222a8);
      border-color: #63eaff;
      box-shadow: 0 0 20px #2cc8ff55;
    }

    .auth-feature img {
      display: block;
      width: 54px;
      height: 54px;
      object-fit: contain;
      margin: 0 auto 8px;
      filter: drop-shadow(0 0 7px #46caff66);
    }

    .auth-feature span {
      display: block;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }

    .auth-stats {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    .auth-stats span {
      padding: 11px 13px;
      border-radius: 12px;
      background: #ffffff20;
      border: 1px solid #ffffff30;
      font-size: 12px;
      font-weight: 750;
    }

    .auth-card {
      width: 100%;
      padding: clamp(22px, 3vw, 40px);
      background: #fff;
      color: #202033;
      border-radius: 28px;
      box-shadow: 0 28px 80px #120b4655;
      min-width: 0;
      animation: authEnter .8s ease both;
    }

    .auth-brand-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 48px;
      color: #172d6d;
      font-size: 13px;
      font-weight: 950;
    }

    .auth-brand-logo {
      max-width: 90px;
      max-height: 58px;
      object-fit: contain;
    }

    .auth-brand-symbol {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #06a6ff, #6530e9, #ff9b22);
      color: white;
      font-size: 25px;
    }

    .auth-card h2 {
      font-size: clamp(26px, 3vw, 36px);
      margin: 24px 0 7px;
      color: #101e50;
    }

    .auth-card .muted {
      line-height: 1.6;
      font-size: 14px;
      margin-top: 0;
    }

    .auth-form label {
      display: block;
      margin-top: 16px;
      font-size: 14px;
      font-weight: 800;
      color: #252c4a;
    }

    .auth-form input {
      display: block;
      width: 100%;
      min-height: 52px;
      margin-top: 8px;
      padding: 13px 15px;
      border: 1px solid #dce0eb;
      border-radius: 13px;
      background: #fbfcff;
      color: #202033;
    }

    .auth-form input:focus {
      outline: 3px solid #e6d7ff;
      border-color: #8755ef;
    }

    .auth-submit {
      width: 100%;
      min-height: 55px;
      margin-top: 23px;
      border: 0;
      border-radius: 13px;
      color: white;
      font-weight: 950;
      font-size: 16px;
      background: linear-gradient(100deg, #f02e83, #b41fe2, #5628ef);
      box-shadow: 0 12px 24px #a51ec333;
    }

    .auth-secondary {
      width: 100%;
      min-height: 50px;
      margin-top: 14px;
      border: 1px solid #dfe2ed;
      border-radius: 13px;
      background: white;
      color: #24243b;
      font-weight: 850;
    }

    .auth-link {
      border: 0;
      background: transparent;
      color: #6a28d9;
      font-weight: 850;
      padding: 0;
    }

    .auth-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 22px;
      color: #9992a2;
      font-size: 13px;
    }

    .auth-divider:before,
    .auth-divider:after {
      content: "";
      height: 1px;
      background: #e6e1e9;
      flex: 1;
    }

    .auth-contact {
      text-align: center;
      margin-top: 18px;
      font-size: 12px;
      line-height: 2.1;
      overflow-wrap: anywhere;
    }

    .auth-contact a {
      color: #5c35c5;
      text-decoration: none;
      font-weight: 750;
    }

    .auth-legal {
      text-align: center;
      font-size: 11px;
      color: #888;
      margin-top: 18px;
    }

    .auth-password-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
    }

    .auth-password-row label { margin: 0; }

    .auth-password-wrap { position: relative; }
    .auth-password-wrap input { padding-right: 68px; }

    .auth-password-wrap button {
      position: absolute;
      right: 12px;
      top: 24px;
    }

    .brand-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 120px;
      padding: 18px;
      border: 1px dashed #b9afd0;
      border-radius: 14px;
      background: #f9f6ff;
      margin: 14px 0;
    }

    .brand-preview img {
      max-width: 100%;
      max-height: 100px;
      object-fit: contain;
    }

    .service-list-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }

    .service-list-card {
      padding: 20px;
      background: white;
      border: 1px solid #e7e2ef;
      border-radius: 18px;
      box-shadow: 0 8px 25px #31204c0c;
    }

    .service-list-card img {
      display: block;
      width: 70px;
      height: 70px;
      object-fit: contain;
      margin-bottom: 12px;
    }

    @media (max-width: 1000px) {
      .auth-layout {
        grid-template-columns: 1fr;
        gap: 24px;
        max-width: 650px;
      }

      .auth-promo { text-align: center; }
      .auth-logo { font-size: 42px; }
      .auth-feature-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
      .auth-stats, .auth-service-pills { justify-content: center; }
    }

    @media (max-width: 600px) {
      .auth-feature-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .auth-feature { min-height: 100px; font-size: 11px; }
      .auth-feature img { width: 48px; height: 48px; }
      .auth-card { padding: 24px 20px; }
      .auth-topbar { font-size: 11px; }
      .app-content { padding: 14px; }
      .app-card { padding: 16px; }
    }

    @media (prefers-reduced-motion: reduce) {
      .auth-page, .auth-card, .auth-promo { animation: none; }
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

  if (header) header.insertAdjacentElement('afterend', nav);
  else document.body.prepend(nav);
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
  `<button type="button" class="${esc(cls)}" data-a="${esc(action)}">${esc(label)}</button>`;

function shell() {
  setupNav();

  nav.innerHTML = me
    ? `<strong>${esc(me.name || me.email || 'Account')}</strong>
       ${btn('Dashboard', 'home')}
       ${btn('Add Money', 'wallet')}
       ${btn('My Requests', 'requests')}
       ${btn('Support Chat', 'chat')}
       ${me.role === 'admin' ? btn('Admin Panel', 'admin:dashboard') : ''}
       ${btn('Logout', 'logout')}`
    : btn('Login / Register', 'auth');
}

function featureCards() {
  return FEATURE_CARDS.map(item => `
    <button class="auth-feature" type="button"
      data-feature="${esc(item.key)}"
      aria-label="${esc(item.name)}">
      <img src="${serviceImage(item.icon)}"
        alt="${esc(item.name)}"
        loading="eager"
        onerror="this.style.opacity='.25'">
      <span>${esc(item.name)}</span>
    </button>
  `).join('');
}

function auth(mode = 'login') {
  document.body.style.background = '#081d72';
  shell();
  nav.style.display = 'none';
  app.className = '';

  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-topbar">
        📣 Welcome to RJN PRINT PORTAL — Simple, Secure, Convenient Digital Services for Everyone
      </div>

      <section class="auth-layout">
        <div class="auth-promo">
          ${settings.logoData
            ? `<img class="auth-logo-image" src="${esc(settings.logoData)}" alt="Portal logo">`
            : ''}

          <div class="auth-logo">
            RJN <span class="print">PRINT</span><br>
            <span class="portal">PORTAL</span>
          </div>

          <p class="auth-tagline">
            Your Digital Services, All in One Place<br>
            <span style="font-size:.78em">
              PAN, Aadhaar, Voter, RC, DL, Online Forms, Print & PDF Tools
              and more — Fast, Secure & Reliable.
            </span>
          </p>

          <div class="auth-service-pills">
            <span>⚡ Fast Processing</span>
            <span>🛡️ Secure Access</span>
            <span>🎧 Support</span>
          </div>

          <div class="auth-feature-board">
            <div class="auth-feature-grid">
              ${featureCards()}
            </div>
          </div>

          <div class="auth-stats">
            <span>👥 Digital Services</span>
            <span>📄 Easy Applications</span>
            <span>🎧 Customer Support</span>
          </div>
        </div>

        <section class="auth-card">
          <div class="auth-brand-pill">
            ${settings.logoData
              ? `<img class="auth-brand-logo" src="${esc(settings.logoData)}" alt="Portal logo">`
              : '<span class="auth-brand-symbol">▣</span>'}
            <span>
              RJN PRINT PORTAL<br>
              <small style="font-weight:650;color:#77758a">
                Your Digital Services Partner
              </small>
            </span>
          </div>

          <div id="authform"></div>

          <div class="auth-contact">
            <a href="https://wa.me/919365414365" target="_blank" rel="noopener">
              WhatsApp Support
            </a><br>
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
    </div>
  `;

  const formArea = $('#authform');

  if (mode === 'register') {
    formArea.innerHTML = `
      <h2>Create Your Account ✨</h2>
      <p class="muted">Join RJN PRINT PORTAL to access digital services.</p>

      <form id="register" class="auth-form">
        <label>Full Name
          <input name="name" autocomplete="name" maxlength="100" required>
        </label>

        <label>Mobile Number
          <input name="phone" type="tel" autocomplete="tel" maxlength="20" required>
        </label>

        <label>Email Address
          <input name="email" type="email" autocomplete="email" required>
        </label>

        <label>Password
          <div class="auth-password-wrap">
            <input id="register-password" name="password" type="password"
              minlength="8" autocomplete="new-password" required>
            <button type="button" class="auth-link"
              data-a="toggle:register-password">Show</button>
          </div>
        </label>

        <button class="auth-submit" type="submit">CREATE ACCOUNT →</button>
      </form>

      <div class="auth-divider">Already registered?</div>
      <button class="auth-secondary" type="button" data-a="tablogin">SIGN IN</button>
    `;
    return;
  }

  if (mode === 'forgot') {
    formArea.innerHTML = `
      <h2>Forgot Password?</h2>
      <p class="muted">
        Contact portal support to recover your account securely.
      </p>
      <div class="auth-contact">
        <a href="mailto:rjn.digitalstudio@gmail.com">
          ✉ rjn.digitalstudio@gmail.com
        </a><br>
        <a href="tel:9365414365">☎ 9365414365</a>
      </div>
      <button class="auth-secondary" type="button" data-a="tablogin">
        BACK TO SIGN IN
      </button>
    `;
    return;
  }

  formArea.innerHTML = `
    <h2>Welcome Back! 👋</h2>
    <p class="muted">
      Sign in to continue to <strong>RJN PRINT PORTAL</strong>.
    </p>

    <form id="login" class="auth-form">
      <label>Mobile Number or Email ID
        <input name="identifier" autocomplete="username"
          placeholder="Enter your mobile number or email ID" required>
      </label>

      <div class="auth-password-row">
        <label>Password</label>
        <button class="auth-link" type="button" data-a="forgot">
          Forgot Password?
        </button>
      </div>

      <div class="auth-password-wrap">
        <input id="login-password" name="password" type="password"
          autocomplete="current-password" placeholder="Enter your password" required>
        <button class="auth-link" type="button"
          data-a="toggle:login-password">Show</button>
      </div>

      <button class="auth-submit" type="submit">SIGN IN →</button>
    </form>

    <div class="auth-divider">OR</div>

    <button class="auth-secondary" type="button" data-a="tabregister">
      ✚ CREATE YOUR FREE ACCOUNT
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

    if (me) await home();
    else auth('login');
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

  if (me.role === 'admin') return admin('dashboard');

  try {
    const result = await api('/api/services');
    services = Array.isArray(result) ? result : (result.services || []);

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

      <div class="service-list-grid">
        ${services.map(service => `
          <section class="service-list-card">
            <img src="${serviceImage(getFeatureIcon(service))}"
              alt="${esc(service.name)}" loading="lazy">
            <h3>${esc(service.name)}</h3>
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

  if (name.includes('pan id')) return [
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

  if (name.includes('mobile recharge id')) return [
    ['name', 'Full Name', 'text', true],
    ['address', 'Address', 'text', true],
    ['mobile', 'Mobile Number', 'tel', true],
    ['email', 'Email ID', 'email', true]
  ];

  return (service.fields || []).map(field =>
    Array.isArray(field)
      ? [field[0], field[1], field[2] || 'text', field[3]]
      : [
          field.name || field.key || field.label,
          field.label || field.name || field.key,
          field.type || 'text',
          field.required
        ]
  );
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
            const safeType = allowed.includes(type) ? type : 'text';

            return `
              <label>${esc(label)}
                <input name="${esc(key)}" type="${safeType}"
                  ${required === false ? '' : 'required'}>
              </label>
            `;
          }).join('')}
        </div>

        <label>Supporting Documents
          <input name="files" type="file" multiple accept=".jpg,.jpeg,.png,.pdf">
        </label>

        <label>Additional Instructions
          <textarea name="notes" maxlength="1000"></textarea>
        </label>

        <p class="app-muted">
          Submit only accurate information and documents you are authorised to provide.
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
    rows = Array.isArray(rows) ? rows : (rows.requests || []);

    app.innerHTML = `
      <section class="app-card">
        ${btn('← Back', 'home')}
        <h2>My Requests</h2>

        ${rows.map(request => `
          <article class="app-card">
            <h3>${esc(request.serviceName || 'Service Request')}</h3>
            <p>Order: ${esc(request.id || '')}</p>
            <p>Charge: ${cash(request.fee ?? request.price)}</p>
            <p>Status:
              <span class="app-tag">${esc(request.status || 'Pending')}</span>
            </p>
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
        <p>${esc(error.message)}</p>
        ${btn('Back', 'home')}
      </section>
    `;
  }
}

async function chat() {
  showContent();

  try {
    let messages = await api('/api/chat');
    messages = Array.isArray(messages) ? messages : (messages.messages || []);

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
        <p>${esc(error.message)}</p>
        ${btn('Back', 'home')}
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
        ${btn('Branding & Logo', 'admin:branding')}
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
      const rows = await api('/api/admin/wallet');

      html = `
        <h2>Wallet Requests</h2>
        ${rows.map(request => `
          <article class="app-card">
            <h3>${esc(request.customer || 'Customer')}</h3>
            <p>Amount: ${cash(request.amount)}</p>
            <p>UTR: ${esc(request.utr)}</p>
            <p>Status: ${esc(request.status)}</p>
            ${request.status === 'Pending'
              ? btn('Approve', 'approve:' + request.id) +
                btn('Reject', 'reject:' + request.id)
              : ''}
          </article>
        `).join('') || '<p>No wallet requests found.</p>'}
      `;
    }

    if (tab === 'requests') {
      const rows = await api('/api/admin/requests');

      html = `
        <h2>Service Requests</h2>
        ${rows.map(request => `
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

              <label>Result File
                <input type="file" name="result">
              </label>

              <button class="app-button" type="submit">Update Request</button>
            </form>
          </article>
        `).join('') || '<p>No service requests found.</p>'}
      `;
    }

    if (tab === 'services') {
      const rows = await api('/api/admin/services');

      html = `
        <h2>Manage Services</h2>

        <form id="addservice">
          <label>Service Name<input name="name" required></label>
          <label>Price (₹)<input name="price" type="number" min="0" required></label>
          <label>Description<input name="description"></label>
          <button class="app-button" type="submit">Add Service</button>
        </form>

        <h3>Existing Services</h3>

        ${rows.map(service => `
          <article class="app-card">
            <img src="${serviceImage(getFeatureIcon(service))}"
              alt="" width="55" height="55">
            <b>${esc(service.name)}</b>
            <p>${cash(service.price)}</p>
            <p>Status: ${service.enabled ? 'Enabled' : 'Disabled'}</p>
            ${btn('Disable Service', 'disable-service:' + service.id)}
          </article>
        `).join('')}
      `;
    }

    if (tab === 'branding') {
      html = `
        <h2>Branding & Logo Settings</h2>
        <p class="app-muted">
          Upload a PNG, JPG, WEBP, or SVG logo (maximum 2 MB).
        </p>

        <div class="brand-preview">
          ${settings.logoData
            ? `<img src="${esc(settings.logoData)}" alt="Current portal logo">`
            : '<strong>RJN PRINT PORTAL — No custom logo uploaded</strong>'}
        </div>

        <form id="brandingform">
          <label>Upload New Logo
            <input name="logo" type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml" required>
          </label>

          <label>UPI ID
            <input name="upiId" value="${esc(settings.upiId || '')}" maxlength="120">
          </label>

          <button class="app-button" type="submit">Save Branding</button>
        </form>
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
    element.innerHTML = `<div class="app-notice error">${esc(error.message)}</div>`;
  }
}

async function adminChat(userId) {
  showContent();

  try {
    const messages = await api(
      '/api/admin/chat/' + encodeURIComponent(userId)
    );

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
        <p>${esc(error.message)}</p>
        ${btn('Back', 'admin:chat')}
      </section>
    `;
  }
}

/* Navigation and clickable actions */
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-a], [data-feature]');
  if (!button) return;

  try {
    if (button.hasAttribute('data-feature')) {
      const key = button.dataset.feature;

      if (!me) {
        auth('login');
        return;
      }

      if (me.role === 'admin') {
        await admin('services');
        return;
      }

      const result = await api('/api/services');
      services = Array.isArray(result) ? result : (result.services || []);

      const matching = services.filter(service => {
        const name = String(service.name || '').toLowerCase();

        if (key === 'pan') return name.includes('pan');
        if (key === 'aadhaar') return name.includes('aadhaar') || name.includes('aadhar');
        if (key === 'voter') return name.includes('voter');
        if (key === 'rc') return name.includes('rc') || name.includes('driving licence') || name.includes('driving license');
        if (key === 'online') return name.includes('form') || name.includes('application');
        if (key === 'pdf') return name.includes('pdf') || name.includes('compress');
        if (key === 'print') return name.includes('print') || name.includes('photo');
        if (key === 'recharge') return name.includes('recharge');
        if (key === 'utility') return name.includes('bill') || name.includes('utility') || name.includes('payment');
        return true;
      });

      if (matching.length) {
        showContent();
        app.innerHTML = `
          <section class="app-card">
            ${btn('← Back', 'home')}
            <h2>${esc(button.innerText.trim())}</h2>
            <div class="service-list-grid">
              ${matching.map(service => `
                <article class="service-list-card">
                  <img src="${serviceImage(getFeatureIcon(service))}" alt="">
                  <h3>${esc(service.name)}</h3>
                  <p>${esc(service.description || '')}</p>
                  <p><strong>${cash(service.price)}</strong></p>
                  ${btn('Apply Now', 'service:' + service.id)}
                </article>
              `).join('')}
            </div>
          </section>
        `;
      } else {
        notice('No matching service is configured yet. Please contact support.');
      }
      return;
    }

    const action = button.dataset.a;

    if (action === 'auth' || action === 'tablogin') return auth('login');
    if (action === 'tabregister') return auth('register');
    if (action === 'forgot') return auth('forgot');
    if (action === 'home') return home();
    if (action === 'wallet') return wallet();
    if (action === 'requests') return requests();
    if (action === 'chat') return chat();

    if (action.startsWith('toggle:')) {
      const id = action.slice(7);
      const input = document.getElementById(id);

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
      const result = await api('/api/services');
      services = Array.isArray(result) ? result : (result.services || []);

      return serviceForm(
        services.find(service => String(service.id) === action.slice(8))
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
      window.open(
        '/api/result/' + encodeURIComponent(action.slice('result:'.length)),
        '_blank'
      );
    }
  } catch (error) {
    notice(error.message, true);
  }
});

/* Form submissions */
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

      const profile = await api('/api/me');
      settings = profile.settings || settings;

      shell();
      return home();
    }

    if (form.id === 'register') {
      const result = await api('/api/register', {
        method: 'POST',
        body: Object.fromEntries(new FormData(form))
      });

      me = result.user || result;

      const profile = await api('/api/me');
      settings = profile.settings || settings;

      shell();
      return home();
    }

    if (form.id === 'serviceform') {
      if (!chosen) throw new Error('Please select a service again.');

      const formData = new FormData(form);
      const data = {};

      for (const [key, value] of formData.entries()) {
        if (key !== 'files' && typeof value === 'string') data[key] = value;
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

    if (form.id === 'brandingform') {
      const file = form.querySelector('[name="logo"]').files[0];

      if (!file) throw new Error('Choose a logo image first.');
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Logo must be 2 MB or smaller.');
      }

      if (![
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/svg+xml'
      ].includes(file.type)) {
        throw new Error('Choose a PNG, JPG, WEBP, or SVG logo.');
      }

      const reader = new FileReader();

      const logoData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Unable to read logo file.'));
        reader.readAsDataURL(file);
      });

      const upiId = new FormData(form).get('upiId') || '';

      await api('/api/admin/settings', {
        method: 'POST',
        body: { upiId, logoData }
      });

      settings = { ...settings, upiId, logoData };
      notice('Branding saved successfully.');

      return admin('branding');
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

      await api(
        '/api/admin/request/' + encodeURIComponent(requestId) + '/process',
        { method: 'POST', body: data }
      );

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
