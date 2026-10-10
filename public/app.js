
const $ = (s, r = document) => r.querySelector(s);
const app = $('#app'), nav = $('#nav');

let me = null, settings = {}, services = [], chosen = null;

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;',
  '"': '&quot;', "'": '&#39;'
}[c]));

const cash = n => '₹' + Number(n || 0).toLocaleString('en-IN');

async function api(url, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  let body = opts.body;

  if (body && !(body instanceof FormData) && typeof body !== 'string') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const r = await fetch(url, {
    ...opts, headers, body, credentials: 'same-origin'
  });

  const d = (r.headers.get('content-type') || '').includes('json')
    ? await r.json() : await r.text();

  if (!r.ok) throw Error(d?.error || d?.message || 'Request failed');
  return d;
}

function msg(t, bad = false) {
  let n = $('#notice');
  if (!n) {
    n = document.createElement('p');
    n.id = 'notice';
    n.className = 'notice';
    app.prepend(n);
  }
  n.textContent = t;
  n.style.background = bad ? '#552631' : '#12243c';
}

const btn = (t, a) =>
  `<button type="button" data-a="${esc(a)}">${esc(t)}</button>`;

function shell() {
  nav.innerHTML = me
    ? `${esc(me.name || me.email)} ${btn('Dashboard', 'home')}
       ${btn('Add Money', 'wallet')}
       ${btn('My Requests', 'requests')}
       ${btn('Support Chat', 'chat')}
       ${me.role === 'admin' ? btn('Admin Panel', 'admin:dashboard') : ''}
       ${btn('Logout', 'logout')}`
    : btn('Login / Register', 'auth');
}

function auth(mode = 'login') {
  app.innerHTML = `
    <section class="hero">
      <h1>RJN PRINT PORTAL</h1>
      <p>RJN DIGITAL STUDIO · Customer & Admin Service Portal</p>
    </section>
    <section class="card">
      <div class="nav">
        ${btn('Login', 'tablogin')}
        ${btn('Create Account', 'tabregister')}
      </div>
      <div id="authform"></div>
    </section>`;

  const f = $('#authform');

  f.innerHTML = mode === 'register' ? `
    <h2>Create Account</h2>
    <form id="register">
      <label>Full Name<input name="name" required maxlength="100"></label>
      <label>Mobile Number<input name="phone" type="tel" required></label>
      <label>Email<input name="email" type="email" required></label>
      <label>Password<input name="password" type="password" minlength="8" required></label>
      <button>Create Account</button>
    </form>` : `
    <h2>Sign In</h2>
    <form id="login">
      <label>Email or Mobile Number<input name="identifier" required></label>
      <label>Password<input name="password" type="password" required></label>
      <button>Login</button>
    </form>`;
}

async function start() {
  try {
    const d = await api('/api/me');
    me = d.user;
    settings = d.settings || {};
    shell();
    await home();
  } catch {
    me = null;
    shell();
    auth();
  }
}

async function home() {
  if (!me) return auth();
  shell();

  if (me.role === 'admin') return admin('dashboard');

  try {
    const result = await api('/api/services');
    services = Array.isArray(result) ? result : result.services || [];

    let st = { wallet: me.wallet || 0, total: 0, pending: 0, completed: 0 };
    try { st = { ...st, ...await api('/api/customer/stats') }; } catch {}

    app.innerHTML = `
      <section class="hero">
        <h1>Hello, ${esc(me.name || 'Customer')}!</h1>
        <p>Welcome to RJN PRINT PORTAL</p>
      </section>
      <div class="grid">
        <section class="card">
          <p>WALLET BALANCE</p><h2>${cash(st.wallet)}</h2>
          ${btn('Add Money', 'wallet')}
        </section>
        <section class="card"><p>TOTAL REQUESTS</p><h2>${st.total}</h2></section>
        <section class="card"><p>PENDING</p><h2>${st.pending}</h2></section>
        <section class="card"><p>COMPLETED</p><h2>${st.completed}</h2></section>
      </div>
      <h2>Available Services</h2>
      <div class="grid">
        ${services.map(s => `
          <section class="card service">
            <h3>${esc(s.icon || '📄')} ${esc(s.name)}</h3>
            <p>${esc(s.description || 'Service request')}</p>
            <strong>${cash(s.price)}</strong><p>
            ${btn('Apply Now', 'service:' + s.id)}</p>
          </section>`).join('')}
      </div>`;
  } catch (e) {
    app.innerHTML = `<section class="card"><h2>Unable to load services</h2>
      <p>${esc(e.message)}</p>${btn('Retry', 'home')}</section>`;
  }
}

function serviceFields(s) {
  const name = String(s.name || '').toLowerCase();

  if (name.includes('pan id')) return [
    ['name', 'Full Name', 'text'],
    ['shopName', 'Shop Name', 'text'],
    ['shopAddress', 'Shop Address', 'text'],
    ['pinCode', 'PIN Code', 'text'],
    ['state', 'State', 'text'],
    ['mobile', 'Mobile Number', 'tel'],
    ['email', 'Email ID', 'email'],
    ['aadhaarNumber', 'Aadhaar Number', 'text'],
    ['panNumber', 'PAN Number', 'text']
  ];

  if (name.includes('mobile recharge id')) return [
    ['name', 'Full Name', 'text'],
    ['address', 'Address', 'text'],
    ['mobile', 'Mobile Number', 'tel'],
    ['email', 'Email ID', 'email']
  ];

  return (s.fields || []).map(f => Array.isArray(f)
    ? [f[0], f[1], f[2] || 'text', f[3]]
    : [f.name || f.key || f.label, f.label || f.name || f.key, f.type || 'text', f.required]);
}

function serviceForm(s) {
  if (!s) return msg('Service not found.', true);
  chosen = s;

  app.innerHTML = `
    <section class="card">
      ${btn('← Back', 'home')}
      <h2>${esc(s.name)}</h2>
      <p>${esc(s.description || '')}</p>
      <p>Charge: <strong>${cash(s.price)}</strong></p>
      <form id="serviceform">
        <div class="grid">
          ${serviceFields(s).map(([key, label, type, required]) => {
            const t = ['tel', 'email', 'number', 'date'].includes(type) ? type : 'text';
            return `<label>${esc(label)}
              <input name="${esc(key)}" type="${t}" ${required === false ? '' : 'required'}>
            </label>`;
          }).join('')}
        </div>
        <label>Additional instructions
          <textarea name="notes" maxlength="1000"></textarea>
        </label>
        <p>Submit only accurate information you are authorized to provide.</p>
        <button>Submit Request</button>
      </form>
    </section>`;
}

async function wallet() {
  app.innerHTML = `
    <section class="card">
      ${btn('← Back', 'home')}
      <h2>Add Money</h2>
      <p>UPI ID: <strong>${esc(settings.upiId || 'rjnpancenter@naviaxis')}</strong></p>
      <p>Wallet funds are added only after manual admin verification.</p>
      <form id="walletform">
        <label>Amount (₹)<input name="amount" type="number" min="1" required></label>
        <label>UTR / Transaction ID<input name="utr" required maxlength="100"></label>
        <label>Payment Screenshot<input name="proof" type="file" accept="image/*" required></label>
        <button>Submit for Approval</button>
      </form>
    </section>`;
}

async function requests() {
  try {
    let rows = await api('/api/customer/requests');
    rows = Array.isArray(rows) ? rows : rows.requests || [];
    app.innerHTML = `
      <section class="card">${btn('← Back', 'home')}
        <h2>My Requests</h2>
        ${rows.map(r => `<article class="card">
          <h3>${esc(r.serviceName || r.service || 'Service Request')}</h3>
          <p>Order: ${esc(r.id || '')}</p>
          <p>Charge: ${cash(r.fee ?? r.price)}</p>
          <p>Status: ${esc(r.status || 'Pending')}</p>
        </article>`).join('') || '<p>No requests yet.</p>'}
      </section>`;
  } catch (e) { msg(e.message, true); }
}

async function chat() {
  try {
    let rows = await api('/api/chat');
    rows = Array.isArray(rows) ? rows : rows.messages || [];
    app.innerHTML = `
      <section class="card">${btn('← Back', 'home')}
        <h2>Support Chat</h2>
        ${rows.map(m => `<p><b>${esc(m.from || m.senderName || 'Support')}:</b>
          ${esc(m.text || m.message || '')}</p>`).join('')}
        <form id="chatform">
          <label>Message<textarea name="message" required maxlength="2000"></textarea></label>
          <button>Send</button>
        </form>
      </section>`;
  } catch (e) { msg(e.message, true); }
}

async function admin(tab = 'dashboard') {
  shell();
  app.innerHTML = `
    <section class="hero"><h1>RJN PRINT PORTAL — Admin</h1>
      <div class="nav">
        ${btn('Overview', 'admin:dashboard')}
        ${btn('Customers', 'admin:customers')}
        ${btn('Wallet Requests', 'admin:wallet')}
        ${btn('Service Requests', 'admin:requests')}
        ${btn('Services', 'admin:services')}
        ${btn('Support Chat', 'admin:chat')}
      </div>
    </section><section id="adm" class="card">Loading...</section>`;

  const el = $('#adm');
  try {
    let h = '';

    if (tab === 'dashboard') {
      const d = await api('/api/admin/dashboard');
      h = `<h2>Overview</h2><pre>${esc(JSON.stringify(d, null, 2))}</pre>`;
    }

    if (tab === 'customers') {
      const a = await api('/api/admin/customers');
      h = `<h2>Customers</h2>${a.map(u =>
        `<p>${esc(u.name)} · ${esc(u.phone)} · ${esc(u.email)} · Wallet ${cash(u.wallet)}</p>`
      ).join('')}`;
    }

    if (tab === 'wallet') {
      const a = await api('/api/admin/wallet');
      h = `<h2>Wallet Requests</h2>${a.map(w => `
        <article class="card">
          <p>${esc(w.customer || w.name || '')} · ${cash(w.amount)}</p>
          <p>UTR: ${esc(w.utr)} · ${esc(w.status)}</p>
          ${w.status === 'Pending' ? `${btn('Approve', 'approve:' + w.id)}
            ${btn('Reject', 'reject:' + w.id)}` : ''}
        </article>`).join('')}`;
    }

    if (tab === 'requests') {
      const a = await api('/api/admin/requests');
      h = `<h2>Service Requests</h2>${a.map(r => `
        <article class="card">
          <b>${esc(r.serviceName || r.service || '')}</b>
          <p>${esc(r.customer || '')} · ${cash(r.fee)} · ${esc(r.status)}</p>
          <pre>${esc(JSON.stringify(r.data || {}, null, 2))}</pre>
          ${btn('Mark Processing', 'process:' + r.id)}
          ${btn('Reject', 'rejectreq:' + r.id)}
        </article>`).join('')}`;
    }

    if (tab === 'services') {
      const a = await api('/api/admin/services');
      h = `<h2>Manage Services</h2>
        <form id="addservice">
          <label>Name<input name="name" required></label>
          <label>Price<input name="price" type="number" min="0" required></label>
          <label>Description<input name="description"></label>
          <button>Add Service</button>
        </form>
        ${a.map(s => `<p>${esc(s.name)} · ${cash(s.price)}</p>`).join('')}`;
    }

    if (tab === 'chat') {
      const a = await api('/api/admin/chat/users');
      h = `<h2>Support Chats</h2>${a.map(u =>
        `<p>${esc(u.name)} · ${esc(u.email)}</p>`
      ).join('')}`;
    }

    el.innerHTML = h || '<p>No records found.</p>';
  } catch (e) {
    el.innerHTML = `<p class="notice">${esc(e.message)}</p>`;
  }
}

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-a]');
  if (!b) return;
  const a = b.dataset.a;

  try {
    if (a === 'auth') return auth();
    if (a === 'tablogin') return auth('login');
    if (a === 'tabregister') return auth('register');
    if (a === 'home') return home();
    if (a === 'wallet') return wallet();
    if (a === 'requests') return requests();
    if (a === 'chat') return chat();
    if (a === 'admin') return admin();

    if (a === 'logout') {
      await api('/api/logout', { method: 'POST', body: {} });
      me = null; shell(); return auth();
    }

    if (a.startsWith('service:')) {
      const id = a.slice(8);
      services = await api('/api/services');
      return serviceForm(services.find(s => String(s.id) === id));
    }

    if (a.startsWith('admin:')) return admin(a.split(':')[1]);

    if (a.startsWith('approve:') || a.startsWith('reject:')) {
      const [decision, id] = a.split(':');
      if (!confirm('Confirm this wallet decision?')) return;
      await api('/api/admin/wallet/' + id + '/' +
        (decision === 'approve' ? 'approve' : 'reject'),
        { method: 'POST', body: {} });
      return admin('wallet');
    }

    if (a.startsWith('process:') || a.startsWith('rejectreq:')) {
      const reject = a.startsWith('rejectreq:');
      const id = a.slice(reject ? 10 : 8);
      await api('/api/admin/request/' + id + '/process', {
        method: 'POST',
        body: { status: reject ? 'Rejected' : 'Processing' }
      });
      return admin('requests');
    }
  } catch (err) { msg(err.message, true); }
});

document.addEventListener('submit', async e => {
  const f = e.target;
  if (!f.matches('form')) return;
  e.preventDefault();

  try {
    if (f.id === 'login') {
      const d = Object.fromEntries(new FormData(f));
      const r = await api('/api/login', { method: 'POST', body: d });
      me = r.user || r; settings = r.settings || {};
      return home();
    }

    if (f.id === 'register') {
      const r = await api('/api/register', {
        method: 'POST', body: Object.fromEntries(new FormData(f))
      });
      me = r.user || r; settings = r.settings || {};
      return home();
    }

    if (f.id === 'serviceform') {
      const d = new FormData(f), data = {};
      for (const [k, v] of d.entries()) {
        if (typeof v === 'string') data[k] = v;
      }
      await api('/api/service/' + chosen.id + '/request', {
        method: 'POST', body: { data }
      });
      chosen = null; await home(); msg('Request submitted.');
      return;
    }

    if (f.id === 'walletform') {
      await api('/api/wallet/request', {
        method: 'POST', body: new FormData(f)
      });
      await wallet(); msg('Submitted for manual verification.');
      return;
    }

    if (f.id === 'chatform') {
      await api('/api/chat', {
        method: 'POST', body: Object.fromEntries(new FormData(f))
      });
      return chat();
    }

    if (f.id === 'addservice') {
      await api('/api/admin/services', {
        method: 'POST', body: Object.fromEntries(new FormData(f))
      });
      return admin('services');
    }
  } catch (err) { msg(err.message, true); }
});

start();
