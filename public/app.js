'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const app = $('#app');
let nav = $('#nav');
let me = null;
let settings = {};
let services = [];
let chosen = null;

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const cash = value => '₹' + Number(value || 0).toLocaleString('en-IN');
const uid = value => String(value ?? '');

function installStyles() {
  const style = document.createElement('style');
  style.textContent = `
    body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f7f5fb;color:#202033}
    button,input,textarea,select{font:inherit}
    button{transition:transform .18s ease,filter .18s ease}
    button:hover{filter:brightness(1.06);transform:translateY(-1px)}
    button:disabled{opacity:.6;cursor:wait}
    #nav{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:12px 5%;background:#111d49;color:white}
    #nav button,.app-button{cursor:pointer;border:0;border-radius:10px;padding:11px 15px;font-weight:800;background:#315ce8;color:white}
    .app-content{width:min(1200px,100%);margin:auto;padding:22px 5% 50px}
    .app-hero{padding:28px;border-radius:20px;color:white;background:linear-gradient(110deg,#142f9c,#7138e8,#e63e75);margin-bottom:20px}
    .app-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:18px 0 26px}
    .app-card{padding:22px;background:#fff;border:1px solid #e7e2ef;border-radius:17px;box-shadow:0 8px 25px #31204c0c;color:#242139;min-width:0}
    .app-card label{display:block;margin:14px 0;font-size:14px;font-weight:750}
    .app-card input,.app-card textarea,.app-card select{box-sizing:border-box;display:block;width:100%;margin-top:7px;padding:12px;border:1px solid #ded8e9;border-radius:10px;background:white;color:#242139;max-width:100%}
    .app-card textarea{min-height:90px;resize:vertical}
    .app-card button{margin:4px 5px 4px 0}
    .app-notice{padding:13px 15px;border-radius:10px;margin:12px 0;background:#e8f7ec;color:#176534}
    .app-notice.error{background:#fff0f0;color:#a51e36}
    .app-muted,.muted{color:#77758a}
    .app-row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
    .app-tag{display:inline-block;padding:5px 9px;border-radius:20px;background:#eee7ff;color:#653bb5;font-size:12px;font-weight:800}
    .auth-page{min-height:100vh;box-sizing:border-box;padding:22px clamp(14px,3vw,48px);background:linear-gradient(125deg,#062a8e,#4020c9 42%,#b52fd0 72%,#ff5574);position:relative;overflow:hidden}
    .auth-topbar{padding:12px 16px;margin:0 auto 22px;max-width:1450px;border-radius:12px;background:#ffcf32;color:#18234a;font-size:13px;font-weight:850;text-align:center}
    .auth-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(340px,.8fr);gap:clamp(24px,5vw,72px);align-items:center;width:min(1450px,100%);min-height:calc(100vh - 105px);margin:auto}
    .auth-promo{color:white}
    .auth-logo-image{width:clamp(76px,9vw,126px);height:clamp(76px,9vw,126px);object-fit:contain;display:block;margin:0 auto 14px}
    .auth-logo{font-size:clamp(36px,5.2vw,70px);font-weight:1000;letter-spacing:-1.5px;line-height:1.02}
    .auth-logo .print{color:#ffca28}.auth-logo .portal{color:#26d9ff}
    .auth-tagline{font-size:clamp(15px,1.7vw,22px);line-height:1.55;margin:18px 0}
    .auth-service-pills{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
    .auth-service-pills span{padding:11px 13px;border-radius:12px;border:1px solid #ffffff40;background:#ffffff16;font-size:13px;font-weight:850}
    .auth-feature-board{margin-top:18px;padding:14px;border-radius:20px;background:#ffffff15;border:1px solid #ffffff40}
    .auth-feature-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
    .auth-feature{padding:13px 7px;border-radius:12px;background:#091e8c55;border:1px solid #ffffff35;color:white;font-size:12px;font-weight:800;text-align:center}
    .auth-feature span{display:block;font-size:25px;margin-bottom:7px}
    .auth-stats{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
    .auth-stats span{padding:11px 13px;border-radius:12px;background:#ffffff20;border:1px solid #ffffff30;font-size:12px;font-weight:750}
    .auth-card{box-sizing:border-box;width:100%;padding:clamp(22px,3vw,40px);background:#fff;color:#202033;border-radius:28px;box-shadow:0 28px 80px #120b4655;min-width:0}
    .auth-brand-pill{display:flex;align-items:center;gap:12px;min-height:48px;color:#172d6d;font-size:13px;font-weight:950}
    .auth-brand-logo{max-width:90px;max-height:58px;object-fit:contain}
    .auth-brand-symbol{display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#06a6ff,#6530e9,#ff9b22);color:white;font-size:25px}
    .auth-card h2{font-size:clamp(26px,3vw,36px);margin:24px 0 7px;color:#101e50}
    .auth-card .muted{line-height:1.6;font-size:14px;margin-top:0}
    .auth-form label{display:block;margin-top:16px;font-size:14px;font-weight:800;color:#252c4a}
    .auth-form input{box-sizing:border-box;display:block;width:100%;min-height:52px;margin-top:8px;padding:13px 15px;border:1px solid #dce0eb;border-radius:13px;background:#fbfcff;color:#202033}
    .auth-form input:focus{outline:3px solid #e6d7ff;border-color:#8755ef}
    .auth-submit{width:100%;min-height:55px;margin-top:23px;border:0;border-radius:13px;color:white;font-weight:950;font-size:16px;background:linear-gradient(100deg,#f02e83,#b41fe2,#5628ef);box-shadow:0 12px 24px #a51ec333;cursor:pointer}
    .auth-secondary{width:100%;min-height:50px;margin-top:14px;border:1px solid #dfe2ed;border-radius:13px;background:white;color:#24243b;font-weight:850;cursor:pointer}
    .auth-link{border:0;background:transparent;color:#6a28d9;font-weight:850;cursor:pointer;padding:0}
    .auth-divider{display:flex;align-items:center;gap:12px;margin-top:22px;color:#9992a2;font-size:13px}
    .auth-divider:before,.auth-divider:after{content:"";height:1px;background:#e6e1e9;flex:1}
    .auth-contact{text-align:center;margin-top:18px;font-size:12px;line-height:2.1;overflow-wrap:anywhere}
    .auth-contact a{color:#5c35c5;text-decoration:none;font-weight:750}
    .auth-legal{text-align:center;font-size:11px;color:#888;margin-top:18px}
    .auth-password-row{display:flex;justify-content:space-between;align-items:center;gap:8px}
    .auth-password-wrap{position:relative}
    .auth-password-wrap input{padding-right:68px}
    .auth-password-wrap button{position:absolute;right:12px;top:24px}
    .brand-preview{display:flex;align-items:center;justify-content:center;min-height:120px;padding:18px;border:1px dashed #b9afd0;border-radius:14px;background:#f9f6ff;margin:14px 0}
    .brand-preview img{max-width:100%;max-height:100px;object-fit:contain}
    @media(max-width:900px){.auth-layout{grid-template-columns:1fr;gap:20px;max-width:590px}.auth-promo{text-align:center}.auth-logo{font-size:38px}.auth-tagline{font-size:15px}.auth-feature-board{display:none}.auth-service-pills,.auth-stats{justify-content:center}.auth-card{padding:24px 20px}.auth-topbar{font-size:12px}}
    @media(max-width:450px){.auth-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.app-content{padding:14px}.app-card{padding:16px}.auth-page{padding:12px}.auth-card h2{font-size:26px}}
  `;
  document.head.appendChild(style);
}

function setupNav(){
  if(nav)return;
  const header=$('header');
  nav=document.createElement('nav');nav.id='nav';nav.setAttribute('aria-label','Main navigation');
  if(header)header.insertAdjacentElement('afterend',nav);else document.body.prepend(nav);
}

async function api(url,options={}){
  const headers={...(options.headers||{})};let body=options.body;
  if(body&&!(body instanceof FormData)&&typeof body!=='string'){headers['Content-Type']='application/json';body=JSON.stringify(body);}
  const response=await fetch(url,{...options,headers,body,credentials:'same-origin'});
  const type=response.headers.get('content-type')||'';
  const data=type.includes('application/json')?await response.json():await response.text();
  if(!response.ok)throw new Error(data?.error||data?.message||`Request failed (${response.status})`);
  return data;
}

function notice(message,error=false){
  let element=$('#app-notice');
  if(!element){element=document.createElement('div');element.id='app-notice';element.className='app-notice';app.prepend(element);}
  element.textContent=message;element.classList.toggle('error',error);element.scrollIntoView({behavior:'smooth',block:'nearest'});
}
const btn=(label,action,cls='app-button')=>`<button type="button" class="${esc(cls)}" data-a="${esc(action)}">${esc(label)}</button>`;

function shell(){
  setupNav();
  nav.innerHTML=me?`<strong>${esc(me.name||me.email||'Account')}</strong>${btn('Dashboard','home')}${btn('Add Money','wallet')}${btn('My Requests','requests')}${btn('Support Chat','chat')}${me.role==='admin'?btn('Admin Panel','admin:dashboard'):''}${btn('Logout','logout')}`:btn('Login / Register','auth');
}

function auth(mode='login'){
  document.body.style.background='#081d72';shell();nav.style.display='none';app.className='';
  app.innerHTML=`
    <div class="auth-page">
      <div class="auth-topbar">📣 Welcome to RJN PRINT PORTAL — Simple, Secure, Convenient Digital Services for Everyone</div>
      <section class="auth-layout">
        <div class="auth-promo">
          ${settings.logoData?`<img class="auth-logo-image" src="${esc(settings.logoData)}" alt="Portal logo">`:''}
          <div class="auth-logo">RJN <span class="print">PRINT</span><br><span class="portal">PORTAL</span></div>
          <p class="auth-tagline">Your Digital Services, All in One Place<br><span style="font-size:.78em">PAN, Aadhaar, Voter, RC, DL, Online Forms, Print & PDF Tools</span></p>
          <div class="auth-service-pills"><span>⚡ Fast Processing</span><span>🛡️ Secure Access</span><span>🎧 24/7 Support</span></div>
          <div class="auth-feature-board"><div class="auth-feature-grid">
            <div class="auth-feature"><span>🪪</span>PAN Services</div><div class="auth-feature"><span>🆔</span>Aadhaar Services</div>
            <div class="auth-feature"><span>📄</span>Voter Services</div><div class="auth-feature"><span>🚘</span>RC & DL Services</div>
            <div class="auth-feature"><span>📝</span>Online Forms</div><div class="auth-feature"><span>📕</span>Print & PDF Tools</div>
            <div class="auth-feature"><span>🖨️</span>Photo & Print</div><div class="auth-feature"><span>💳</span>Recharge & Utilities</div>
          </div></div>
          <div class="auth-stats"><span>👥 Digital Services</span><span>📄 Easy Applications</span><span>🎧 Customer Support</span></div>
        </div>
        <section class="auth-card">
          <div class="auth-brand-pill">${settings.logoData?`<img class="auth-brand-logo" src="${esc(settings.logoData)}" alt="Logo">`:'<span class="auth-brand-symbol">▣</span>'}<span>RJN PRINT PORTAL<br><small style="font-weight:650;color:#77758a">Your Digital Services Partner</small></span></div>
          <div id="authform"></div>
          <div class="auth-contact"><a href="tel:9365414365">☎ 9365414365</a><br><a href="mailto:rjn.digitalstudio@gmail.com">✉ rjn.digitalstudio@gmail.com</a></div>
          <p class="auth-legal">© 2026 RJN PRINT PORTAL · Keep your password private.</p>
        </section>
      </section>
    </div>`;
  const formArea=$('#authform');
  if(mode==='register'){
    formArea.innerHTML=`<h2>Create Your Account ✨</h2><p class="muted">Join RJN PRINT PORTAL to access digital services.</p>
      <form id="register" class="auth-form">
      <label>Full Name<input name="name" autocomplete="name" maxlength="100" required></label>
      <label>Mobile Number<input name="phone" type="tel" autocomplete="tel" maxlength="20" required></label>
      <label>Email Address<input name="email" type="email" autocomplete="email" required></label>
      <label>Password<div class="auth-password-wrap"><input id="register-password" name="password" type="password" minlength="8" autocomplete="new-password" required><button type="button" class="auth-link" data-a="toggle:register-password">Show</button></div></label>
      <button class="auth-submit" type="submit">CREATE ACCOUNT →</button></form>
      <div class="auth-divider">Already registered?</div><button class="auth-secondary" type="button" data-a="tablogin">SIGN IN</button>`;
    return;
  }
  if(mode==='forgot'){
    formArea.innerHTML=`<h2>Forgot Password?</h2><p class="muted">Enter your registered email address to continue.</p>
      <form id="forgotform" class="auth-form"><label>Registered Email<input name="email" type="email" autocomplete="email" required></label><button class="auth-submit" type="submit">CONTINUE →</button></form>
      <button class="auth-secondary" type="button" data-a="tablogin">BACK TO SIGN IN</button>`;
    return;
  }
  formArea.innerHTML=`<h2>Welcome Back! 👋</h2><p class="muted">Sign in to continue to <strong>RJN PRINT PORTAL</strong>.</p>
    <form id="login" class="auth-form"><label>Mobile Number or Email ID<input name="identifier" autocomplete="username" placeholder="Enter your mobile number or email ID" required></label>
    <div class="auth-password-row"><label>Password</label><button class="auth-link" type="button" data-a="forgot">Forgot Password?</button></div>
    <div class="auth-password-wrap"><input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required><button class="auth-link" type="button" data-a="toggle:login-password">Show</button></div>
    <button class="auth-submit" type="submit">SIGN IN　→</button></form>
    <div class="auth-divider">OR</div><button class="auth-secondary" type="button" data-a="tabregister">✚ CREATE YOUR FREE ACCOUNT</button>`;
}

function showContent(){document.body.style.background='#f7f5fb';nav.style.display='flex';app.className='app-content';}

async function start(){
  installStyles();setupNav();
  try{const data=await api('/api/me');me=data.user;settings=data.settings||{};shell();if(me)await home();else auth('login');}
  catch{me=null;shell();auth('login');}
}

async function home(){
  if(!me)return auth('login');shell();showContent();
  if(me.role==='admin')return admin('dashboard');
  try{
    const result=await api('/api/services');services=Array.isArray(result)?result:result.services||[];
    let stats={wallet:me.wallet||0,total:0,pending:0,completed:0};try{stats={...stats,...await api('/api/customer/stats')};}catch{}
    app.innerHTML=`<section class="app-hero"><h1>Hello, ${esc(me.name||'Customer')}!</h1><p>Welcome to RJN PRINT PORTAL</p></section>
      <div class="app-grid"><section class="app-card"><p>WALLET BALANCE</p><h2>${cash(stats.wallet)}</h2>${btn('Add Money','wallet')}</section>
      <section class="app-card"><p>TOTAL REQUESTS</p><h2>${Number(stats.total||0)}</h2></section><section class="app-card"><p>PENDING</p><h2>${Number(stats.pending||0)}</h2></section>
      <section class="app-card"><p>COMPLETED</p><h2>${Number(stats.completed||0)}</h2></section></div><h2>Available Services</h2><div class="app-grid">
      ${services.map(service=>`<section class="app-card"><h3>${esc(service.icon||'📄')} ${esc(service.name)}</h3><p>${esc(service.description||'Service request')}</p><h3>${cash(service.price)}</h3>${btn('Apply Now','service:'+service.id)}</section>`).join('')||'<p>No services are available right now.</p>'}</div>`;
  }catch(error){app.innerHTML=`<section class="app-card"><h2>Unable to load services</h2><p>${esc(error.message)}</p>${btn('Retry','home')}</section>`;}
}

function serviceFields(service){
  const name=String(service.name||'').toLowerCase();
  if(name.includes('pan id'))return [['name','Full Name','text',true],['shopName','Shop Name','text',true],['shopAddress','Shop Address','text',true],['pinCode','PIN Code','text',true],['state','State','text',true],['mobile','Mobile Number','tel',true],['email','Email ID','email',true],['aadhaarNumber','Aadhaar Number','text',true],['panNumber','PAN Number (Optional)','text',false]];
  if(name.includes('mobile recharge id'))return [['name','Full Name','text',true],['address','Address','text',true],['mobile','Mobile Number','tel',true],['email','Email ID','email',true]];
  return (service.fields||[]).map(field=>Array.isArray(field)?[field[0],field[1],field[2]||'text',field[3]]:[field.name||field.key||field.label,field.label||field.name||field.key,field.type||'text',field.required]);
}

function serviceForm(service){
  if(!service)return notice('Service not found.',true);chosen=service;showContent();
  app.innerHTML=`<section class="app-card">${btn('← Back','home')}<h2>${esc(service.name)}</h2><p>${esc(service.description||'')}</p><p>Charge: <strong>${cash(service.price)}</strong></p>
    <form id="serviceform"><div class="app-grid">${serviceFields(service).map(([key,label,type,required])=>{const allowed=['text','tel','email','number','date'];return `<label>${esc(label)}<input name="${esc(key)}" type="${allowed.includes(type)?type:'text'}" ${required===false?'':'required'}></label>`;}).join('')}</div>
    <label>Supporting Documents<input name="files" type="file" multiple accept=".jpg,.jpeg,.png,.pdf"></label><label>Additional Instructions<textarea name="notes" maxlength="1000"></textarea></label>
    <p class="app-muted">Submit only accurate information and documents you are authorised to provide.</p><button class="app-button" type="submit">Submit Request</button></form></section>`;
}

async function wallet(){
  showContent();app.innerHTML=`<section class="app-card">${btn('← Back','home')}<h2>Add Money</h2><p>UPI ID: <strong>${esc(settings.upiId||'Contact admin')}</strong></p>
    <p class="app-muted">Wallet funds are added only after manual admin verification.</p><form id="walletform"><label>Amount (₹)<input name="amount" type="number" min="1" step="1" required></label>
    <label>UTR / Transaction ID<input name="utr" maxlength="100" required></label><label>Payment Screenshot<input name="proof" type="file" accept="image/*" required></label>
    <button class="app-button" type="submit">Submit for Approval</button></form></section>`;
}

async function requests(){
  showContent();
  try{let rows=await api('/api/customer/requests');rows=Array.isArray(rows)?rows:rows.requests||[];
    app.innerHTML=`<section class="app-card">${btn('← Back','home')}<h2>My Requests</h2>${rows.map(request=>`<article class="app-card"><h3>${esc(request.serviceName||'Service Request')}</h3>
    <p>Order: ${esc(request.id||'')}</p><p>Charge: ${cash(request.fee??request.price)}</p><p>Status: <span class="app-tag">${esc(request.status||'Pending')}</span></p>
    ${request.resultAvailable?btn('Download Result','result:'+request.id):''}</article>`).join('')||'<p>No requests yet.</p>'}</section>`;
  }catch(error){app.innerHTML=`<section class="app-card"><p>${esc(error.message)}</p>${btn('Back','home')}</section>`;}
}

async function chat(){
  showContent();
  try{let messages=await api('/api/chat');messages=Array.isArray(messages)?messages:messages.messages||[];
    app.innerHTML=`<section class="app-card">${btn('← Back','home')}<h2>Support Chat</h2><div>${messages.map(message=>`<article class="app-card"><b>${esc(message.from||'Support')}</b><p>${esc(message.text||'')}</p><small class="app-muted">${esc(message.createdAt||'')}</small></article>`).join('')||'<p>No messages yet.</p>'}</div>
    <form id="chatform"><label>Message<textarea name="message" maxlength="2000" required></textarea></label><button class="app-button" type="submit">Send Message</button></form></section>`;
  }catch(error){app.innerHTML=`<section class="app-card"><p>${esc(error.message)}</p>${btn('Back','home')}</section>`;}
}

async function admin(tab='dashboard'){
  if(!me||me.role!=='admin')return auth('login');shell();showContent();
  app.innerHTML=`<section class="app-hero"><h1>RJN PRINT PORTAL — Admin</h1><div class="app-row">
    ${btn('Overview','admin:dashboard')}${btn('Customers','admin:customers')}${btn('Wallet Requests','admin:wallet')}${btn('Service Requests','admin:requests')}${btn('Services','admin:services')}${btn('Branding & Logo','admin:branding')}${btn('Support Chat','admin:chat')}
    </div></section><section id="adm" class="app-card">Loading...</section>`;
  const element=$('#adm');
  try{
    let html='';
    if(tab==='dashboard'){
      const data=await api('/api/admin/dashboard');html=`<h2>Overview</h2><div class="app-grid">${Object.entries(data).map(([key,value])=>`<article class="app-card"><p>${esc(key.replace(/([A-Z])/g,' $1'))}</p><h2>${esc(value)}</h2></article>`).join('')}</div>`;
    }
    if(tab==='customers'){
      const customers=await api('/api/admin/customers');html=`<h2>Customers</h2>${customers.map(customer=>`<article class="app-card"><b>${esc(customer.name)}</b><p>${esc(customer.phone)} · ${esc(customer.email)}</p><p>Wallet: ${cash(customer.wallet)}</p></article>`).join('')||'<p>No customers found.</p>'}`;
    }
    if(tab==='wallet'){
      const rows=await api('/api/admin/wallet');html=`<h2>Wallet Requests</h2>${rows.map(request=>`<article class="app-card"><h3>${esc(request.customer||'Customer')}</h3><p>Amount: ${cash(request.amount)}</p><p>UTR: ${esc(request.utr)}</p><p>Status: ${esc(request.status)}</p>${request.status==='Pending'?btn('Approve','approve:'+request.id)+btn('Reject','reject:'+request.id):''}</article>`).join('')||'<p>No wallet requests found.</p>'}`;
    }
    if(tab==='requests'){
      const rows=await api('/api/admin/requests');html=`<h2>Service Requests</h2>${rows.map(request=>`<article class="app-card"><h3>${esc(request.serviceName||'Service')}</h3><p>Customer: ${esc(request.customer||'')}</p><p>Charge: ${cash(request.fee)}</p><p>Status: ${esc(request.status)}</p>
        <details><summary>Application details</summary><pre>${esc(JSON.stringify(request.data||{},null,2))}</pre></details>
        <form class="processform" data-id="${esc(request.id)}"><label>Processing Status<select name="status"><option value="Processing">Processing</option><option value="Completed">Completed</option><option value="Rejected">Rejected</option></select></label>
        <label>Result File (required for Completed)<input type="file" name="result"></label><button class="app-button" type="submit">Update Request</button></form></article>`).join('')||'<p>No service requests found.</p>'}`;
    }
    if(tab==='services'){
      const rows=await api('/api/admin/services');html=`<h2>Manage Services</h2><form id="addservice"><label>Service Name<input name="name" required></label><label>Price (₹)<input name="price" type="number" min="0" required></label><label>Description<input name="description"></label><button class="app-button" type="submit">Add Service</button></form><h3>Existing Services</h3>${rows.map(service=>`<article class="app-card"><b>${esc(service.name)}</b><p>${cash(service.price)}</p><p>Status: ${service.enabled?'Enabled':'Disabled'}</p>${btn('Disable Service','disable-service:'+service.id)}</article>`).join('')}`;
    }
    if(tab==='branding'){
      html=`<h2>Branding & Logo Settings</h2><p class="app-muted">Upload a PNG, JPG, WEBP, or SVG logo (maximum 2 MB). Permanent saving needs backend support.</p>
      <div class="brand-preview">${settings.logoData?`<img src="${esc(settings.logoData)}" alt="Current portal logo">`:'<strong>RJN PRINT PORTAL — No custom logo uploaded</strong>'}</div>
      <form id="brandingform"><label>Upload New Logo<input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" required></label>
      <label>UPI ID<input name="upiId" value="${esc(settings.upiId||'')}" maxlength="120"></label><button class="app-button" type="submit">Save Branding</button></form>
      <p class="app-muted">The current server must be updated to save the logo permanently.</p>`;
    }
    if(tab==='chat'){
      const customers=await api('/api/admin/chat/users');html=`<h2>Support Chats</h2>${customers.map(customer=>`<article class="app-card"><b>${esc(customer.name)}</b><p>${esc(customer.email)}</p><p>Unread: ${Number(customer.unread||0)}</p>${btn('Open Chat','admin-chat:'+customer.id)}</article>`).join('')||'<p>No support conversations found.</p>'}`;
    }
    element.innerHTML=html||'<p>No records found.</p>';
  }catch(error){element.innerHTML=`<div class="app-notice error">${esc(error.message)}</div>`;}
}

async function adminChat(userId){
  showContent();
  try{const messages=await api('/api/admin/chat/'+encodeURIComponent(userId));
    app.innerHTML=`<section class="app-card">${btn('← Back to Chats','admin:chat')}<h2>Customer Support Chat</h2>
    ${messages.map(message=>`<article class="app-card"><b>${esc(message.from)}</b><p>${esc(message.text||'')}</p><small>${esc(message.createdAt||'')}</small></article>`).join('')}
    <form id="adminchatform" data-user="${esc(userId)}"><label>Reply<textarea name="message" maxlength="2000" required></textarea></label><button class="app-button" type="submit">Send Reply</button></form></section>`;
  }catch(error){app.innerHTML=`<section class="app-card"><p>${esc(error.message)}</p>${btn('Back','admin:chat')}</section>`;}
}

document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-a]');if(!button)return;const action=button.dataset.a;
  try{
    if(action==='auth'||action==='tablogin')return auth('login');
    if(action==='tabregister')return auth('register');
    if(action==='forgot')return auth('forgot');
    if(action==='home')return home();
    if(action==='wallet')return wallet();
    if(action==='requests')return requests();
    if(action==='chat')return chat();
    if(action.startsWith('toggle:')){const input=$('#'+CSS.escape(action.slice(7)));if(input){input.type=input.type==='password'?'text':'password';button.textContent=input.type==='password'?'Show':'Hide';}return;}
    if(action==='logout'){await api('/api/logout',{method:'POST',body:{}});me=null;settings={};shell();return auth('login');}
    if(action.startsWith('service:')){services=await api('/api/services');return serviceForm(services.find(service=>uid(service.id)===action.slice(8)));}
    if(action.startsWith('admin:'))return admin(action.split(':')[1]);
    if(action.startsWith('approve:')||action.startsWith('reject:')){
      const [decision,requestId]=action.split(':');if(!confirm('Confirm this wallet decision?'))return;
      await api('/api/admin/wallet/'+encodeURIComponent(requestId)+'/'+(decision==='approve'?'approve':'reject'),{method:'POST',body:{}});return admin('wallet');
    }
    if(action.startsWith('disable-service:')){
      const serviceId=action.slice('disable-service:'.length);if(!confirm('Disable this service?'))return;
      await api('/api/admin/services/'+encodeURIComponent(serviceId),{method:'DELETE'});return admin('services');
    }
    if(action.startsWith('admin-chat:'))return adminChat(action.slice('admin-chat:'.length));
    if(action.startsWith('result:'))window.open('/api/result/'+encodeURIComponent(action.slice('result:'.length)),'_blank');
  }catch(error){notice(error.message,true);}
});

document.addEventListener('submit',async event=>{
  const form=event.target;if(!form.matches('form'))return;event.preventDefault();
  const submitButton=form.querySelector('[type="submit"],button:not([type])');if(submitButton)submitButton.disabled=true;
  try{
    if(form.id==='login'){
      const result=await api('/api/login',{method:'POST',body:Object.fromEntries(new FormData(form))});me=result.user||result;settings=result.settings||{};shell();return home();
    }
    if(form.id==='register'){
      const result=await api('/api/register',{method:'POST',body:Object.fromEntries(new FormData(form))});me=result.user||result;settings=result.settings||{};shell();return home();
    }
    if(form.id==='forgotform'){notice('Password recovery is not connected to the current server. Please contact portal support.',true);return;}
    if(form.id==='serviceform'){
      if(!chosen)throw new Error('Please select a service again.');
      const formData=new FormData(form),data={};for(const [key,value] of formData.entries())if(key!=='files'&&typeof value==='string')data[key]=value;
      const request=new FormData();request.append('data',JSON.stringify(data));for(const file of form.querySelector('[name="files"]').files)request.append('files',file);
      await api('/api/service/'+encodeURIComponent(chosen.id)+'/request',{method:'POST',body:request});chosen=null;await home();return notice('Your service request has been submitted.');
    }
    if(form.id==='walletform'){await api('/api/wallet/request',{method:'POST',body:new FormData(form)});await wallet();return notice('Submitted for manual verification.');}
    if(form.id==='chatform'){await api('/api/chat',{method:'POST',body:Object.fromEntries(new FormData(form))});return chat();}
    if(form.id==='adminchatform'){const userId=form.dataset.user;await api('/api/admin/chat/'+encodeURIComponent(userId),{method:'POST',body:Object.fromEntries(new FormData(form))});return adminChat(userId);}
    if(form.id==='addservice'){await api('/api/admin/services',{method:'POST',body:Object.fromEntries(new FormData(form))});return admin('services');}
    if(form.id==='brandingform'){
      const file=form.querySelector('[name="logo"]').files[0];if(!file)throw new Error('Choose a logo image first.');
      if(file.size>2*1024*1024)throw new Error('Logo must be 2 MB or smaller.');
      if(!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(file.type))throw new Error('Choose a PNG, JPG, WEBP, or SVG logo.');
      const reader=new FileReader();
      const logoData=await new Promise((resolve,reject)=>{reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(new Error('Unable to read logo file.'));reader.readAsDataURL(file);});
      const upiId=new FormData(form).get('upiId')||'';
      await api('/api/admin/settings',{method:'POST',body:{upiId,logoData}});
      settings={...settings,upiId,logoData};notice('Settings submitted. Permanent logo saving requires the matching server.js update.');return admin('branding');
    }
    if(form.classList.contains('processform')){
      const requestId=form.dataset.id,status=new FormData(form).get('status'),fileInput=form.querySelector('[name="result"]');
      if(status==='Completed'&&!fileInput.files.length)throw new Error('Choose a result file before marking it Completed.');
      const data=new FormData();data.append('status',status);if(fileInput.files.length)data.append('result',fileInput.files[0]);
      await api('/api/admin/request/'+encodeURIComponent(requestId)+'/process',{method:'POST',body:data});return admin('requests');
    }
  }catch(error){notice(error.message,true);}
  finally{if(submitButton&&submitButton.isConnected)submitButton.disabled=false;}
});

start();
