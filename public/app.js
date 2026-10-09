const $ = (s, r=document) => r.querySelector(s);
const app = $('#app'), nav = $('#nav');
let me=null, settings={}, services=[], chosen=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cash=n=>'₹'+Number(n||0).toLocaleString('en-IN');
async function api(url,opts={}) {
  const headers={...(opts.headers||{})}; let body=opts.body;
  if(!(body instanceof FormData)) headers['Content-Type']='application/json';
  if(body && !(body instanceof FormData) && typeof body!=='string') body=JSON.stringify(body);
  const r=await fetch(url,{...opts,headers,body});
  const d=(r.headers.get('content-type')||'').includes('json')?await r.json():await r.text();
  if(!r.ok) throw Error(d?.error||d||'Request failed'); return d;
}
function msg(t,bad=false){let n=$('#notice');if(!n){n=document.createElement('p');n.id='notice';n.className='notice';app.prepend(n)}n.textContent=t;n.style.background=bad?'#552631':'#12243c'}
const btn=(t,a)=>`<button type="button" data-a="${esc(a)}">${esc(t)}</button>`;
function shell(){nav.innerHTML=me?`${esc(me.name)} ${btn('Logout','logout')}`:btn('Login / Register','auth')}
function auth(mode='login'){
 app.innerHTML=`<section class="hero"><h1>RJN PRINT PORTAL</h1><p>Customer & Admin Service Portal</p></section><section class="card"><div class="nav">${btn('Login','tablogin')} ${btn('Create Account','tabregister')}</div><div id="authform"></div></section>`;
 const f=$('#authform');
 f.innerHTML=mode==='register'?`<h2>Create Account</h2><form id="register"><label>Name<input name="name" required></label><label>Mobile<input name="phone" required></label><label>Email<input name="email" type="email" required></label><label>Password<input name="password" type="password" minlength="8" required></label><button>Create Account</button></form>`:`<h2>Login</h2><form id="login"><label>Email or Mobile<input name="identifier" required></label><label>Password<input name="password" type="password" required></label><button>Login</button></form>`;
}
async function start(){try{let d=await api('/api/me');me=d.user;settings=d.settings||{};services=await api('/api/services');shell();me?await home():auth()}catch(e){app.innerHTML=`<section class="card"><h2>RJN PRINT PORTAL</h2><p>${esc(e.message)}</p><button onclick="location.reload()">Reload</button></section>`}}
async function home(){
 shell(); if(me.role==='admin')return admin('dashboard');
 let st={wallet:me.wallet||0,total:0,pending:0,completed:0,upiId:settings.upiId};try{st=await api('/api/customer/stats')}catch{}
 services=await api('/api/services');
 app.innerHTML=`<section class="hero"><h1>Hello, ${esc(me.name)}!</h1><p>Welcome to RJN PRINT PORTAL</p><div class="nav">${btn('Services','home')} ${btn('Add Money','wallet')} ${btn('My Requests','requests')} ${btn('Support Chat','chat')}</div></section>
 <div class="grid"><section class="card"><p>WALLET BALANCE</p><h2>${cash(st.wallet)}</h2>${btn('Add Money','wallet')}</section><section class="card"><p>TOTAL REQUESTS</p><h2>${st.total}</h2></section><section class="card"><p>PENDING</p><h2>${st.pending}</h2></section><section class="card"><p>COMPLETED</p><h2>${st.completed}</h2></section></div>
 <h2>Available Services</h2><div class="grid">${services.map(s=>`<section class="card service"><div class="icon">${esc(s.icon||'📄')}</div><h3>${esc(s.name)}</h3><p>${esc(s.description||'Manual service request')}</p><b>${cash(s.price)}</b><p>${btn('Apply Now','service:'+s.id)}</p></section>`).join('')}</div>`;
}
function serviceForm(s){chosen=s;app.innerHTML=`<section class="card">${btn('← Back','home')}<h2>${esc(s.icon||'📄')} ${esc(s.name)}</h2><p>${esc(s.description||'')}</p><p><b>Charge: ${cash(s.price)}</b></p><p class="notice">${esc(s.instructions||'Only submit information you are authorized to provide.')}</p><form id="serviceform"><div class="grid">${(s.fields||[]).map(f=>{let field=f[2]==='textarea'?`<textarea name="${esc(f[0])}" ${f[3]?'required':''}></textarea>`:f[2]==='select'?`<select name="${esc(f[0])}" ${f[3]?'required':''}><option value="">Choose</option><option>Male</option><option>Female</option><option>Other</option></select>`:`<input name="${esc(f[0])}" type="${['date','tel','email','number'].includes(f[2])?f[2]:'text'}" ${f[3]?'required':''}>`;return `<label>${esc(f[1])}${field}</label>`}).join('')}</div><label>Supporting documents (if needed)<input type="file" name="files" multiple></label><button>Submit Request</button></form></section>`}
async function wallet(){let rows=[];try{rows=await api('/api/customer/wallet')}catch{}app.innerHTML=`<section class="card">${btn('← Back','home')}<h2>Add Money</h2><p>Pay to UPI ID: <b>${esc(settings.upiId||'rjnpancenter@naviaxis')}</b></p><p>Wallet is credited only after admin verifies your payment.</p><form id="walletform"><label>Amount ₹<input name="amount" type="number" min="1" required></label><label>UTR / Transaction ID<input name="utr" required></label><label>Payment screenshot<input name="proof" type="file" accept="image/*" required></label><button>Submit Request</button></form></section><section class="card"><h2>My Add-Money Requests</h2>${rows.map(w=>`<p>${cash(w.amount)} · ${esc(w.utr)} · ${esc(w.status)}</p>`).join('')||'No requests yet.'}</section>`}
async function requests(){let rows=await api('/api/customer/requests');app.innerHTML=`<section class="card">${btn('← Back','home')}<h2>My Requests</h2>${rows.map(r=>`<p>${esc(r.serviceName)} · ${cash(r.fee)} · ${esc(r.status)} ${r.resultAvailable?`<a href="/api/result/${encodeURIComponent(r.id)}">Download result</a>`:''}</p>`).join('')||'No requests yet.'}</section>`}
async function chat(){let rows=await api('/api/chat');app.innerHTML=`<section class="card">${btn('← Back','home')}<h2>Support Chat</h2>${rows.map(m=>`<p><b>${esc(m.from)}:</b> ${esc(m.text)}</p>`).join('')}<form id="chatform"><label>Message<textarea name="message"></textarea></label><label>Attachment<input name="attachment" type="file"></label><button>Send</button></form></section>`}
async function admin(tab='dashboard'){
 shell();app.innerHTML=`<section class="hero"><h1>RJN PRINT PORTAL — Admin</h1><div class="nav">${[['dashboard','Overview'],['customers','Customers'],['wallet','Add Money'],['requests','Service Requests'],['services','Services'],['chat','Support Chat']].map(x=>btn(x[1],'admin:'+x[0])).join(' ')}</div></section><section id="adm" class="card">Loading...</section>`;
 const el=$('#adm');try{let h='';
 if(tab==='dashboard'){let d=await api('/api/admin/dashboard');h=`<h2>Overview</h2><div class="grid">${[['Customers',d.customers],['Today registrations',d.todayRegistrations],['This month',d.monthRegistrations],['Pending wallet',d.pendingWallet],['Pending services',d.pendingRequests],['Services',d.services]].map(x=>`<section class="card"><p>${x[0]}</p><h2>${x[1]}</h2></section>`).join('')}</div>`}
 if(tab==='customers'){let a=await api('/api/admin/customers');h='<h2>Customers</h2><input id="search" placeholder="Search name, phone or email"><div id="custrows">'+a.map(u=>`<p>${esc(u.name)} · ${esc(u.phone)} · ${esc(u.email)} · Wallet ${cash(u.wallet)}</p>`).join('')+'</div>'}
 if(tab==='wallet'){let a=await api('/api/admin/wallet');h='<h2>Add Money Requests</h2>'+a.map(w=>`<p>${esc(w.customer)} · ${cash(w.amount)} · UTR ${esc(w.utr)} · ${esc(w.status)} ${w.status==='Pending'?btn('Approve','approve:'+w.id)+' '+btn('Reject','reject:'+w.id):''}</p>`).join('')}
 if(tab==='requests'){let a=await api('/api/admin/requests');h='<h2>Service Requests</h2>'+a.map(r=>`<section class="card"><b>${esc(r.serviceName)}</b> · ${esc(r.customer)} · ${cash(r.fee)} · ${esc(r.status)}<details><summary>Details</summary><pre>${esc(JSON.stringify(r.data,null,2))}</pre></details>${btn('Processing','process:'+r.id)} ${btn('Reject + refund','rejectreq:'+r.id)}</section>`).join('')}
 if(tab==='services'){let a=await api('/api/admin/services');h=`<h2>Manage Services</h2><form id="addservice"><label>Name<input name="name" required></label><label>Price<input name="price" type="number" required></label><label>Description<input name="description"></label><label>Icon<input name="icon" value="📄"></label><button>Add Service</button></form>`+a.map(s=>`<p>${esc(s.icon)} ${esc(s.name)} · ${cash(s.price)} · ${s.enabled?'Enabled':'Disabled'} ${btn(s.enabled?'Disable':'Enable','toggle:'+s.id+':'+s.enabled)}</p>`).join('')}
 if(tab==='chat'){let a=await api('/api/admin/chat/users');h='<h2>Support Chats</h2>'+a.map(u=>`<p>${esc(u.name)} · ${esc(u.email)} · Unread ${u.unread} ${btn('Open','adminchat:'+u.id)}</p>`).join('')}
 el.innerHTML=h||'<p>No records found.</p>';
 }catch(e){el.innerHTML=`<p class="notice">${esc(e.message)}</p>`}
}
async function adminchat(uid){let a=await api('/api/admin/chat/'+encodeURIComponent(uid));app.innerHTML=`<section class="card">${btn('← Back','admin:chat')}<h2>Support Chat</h2>${a.map(m=>`<p><b>${esc(m.from)}:</b> ${esc(m.text)}</p>`).join('')}<form id="adminchatform" data-uid="${esc(uid)}"><label>Reply<textarea name="message" required></textarea></label><button>Send Reply</button></form></section>`}
document.addEventListener('click',async e=>{let b=e.target.closest('[data-a]');if(!b)return;let a=b.dataset.a;try{
 if(a==='auth')auth();else if(a==='tablogin')auth('login');else if(a==='tabregister')auth('register');
 else if(a==='logout'){await api('/api/logout',{method:'POST',body:{}});me=null;shell();auth()}
 else if(a==='home')await home();else if(a==='wallet')await wallet();else if(a==='requests')await requests();else if(a==='chat')await chat();
 else if(a.startsWith('service:')){let id=a.slice(8),s=services.find(x=>x.id===id)|| (await api('/api/services')).find(x=>x.id===id);serviceForm(s)}
 else if(a.startsWith('admin:'))await admin(a.split(':')[1]);
 else if(a.startsWith('approve:')||a.startsWith('reject:')){let [action,id]=a.split(':');if(confirm('Confirm this wallet decision?')){await api('/api/admin/wallet/'+id+'/'+(action==='approve'?'approve':'reject'),{method:'POST',body:{}});await admin('wallet')}}
 else if(a.startsWith('process:')){await api('/api/admin/request/'+a.slice(8)+'/process',{method:'POST',body:{status:'Processing'}});await admin('requests')}
 else if(a.startsWith('rejectreq:')){if(confirm('Reject and refund this request?')){await api('/api/admin/request/'+a.slice(9)+'/process',{method:'POST',body:{status:'Rejected'}});await admin('requests')}}
 else if(a.startsWith('toggle:')){let [,id,on]=a.split(':'),s=(await api('/api/admin/services')).find(x=>x.id===id);await api('/api/admin/services/'+id,{method:'PUT',body:{...s,enabled:on!=='true'}});await admin('services')}
 else if(a.startsWith('adminchat:'))await adminchat(a.slice(9));
 }catch(err){msg(err.message,true)}});
document.addEventListener('submit',async e=>{let f=e.target;if(!f.matches('form'))return;e.preventDefault();try{
 if(f.id==='login'){let d=new FormData(f),r=await api('/api/login',{method:'POST',body:{identifier:d.get('identifier'),password:d.get('password')}});me=r.user;await home()}
 else if(f.id==='register'){let r=await api('/api/register',{method:'POST',body:Object.fromEntries(new FormData(f))});me=r.user;await home()}
 else if(f.id==='serviceform'){let d=new FormData(f),data={};for(let [k,v] of d.entries())if(k!=='files'&&typeof v==='string')data[k]=v;let fd=new FormData();fd.append('data',JSON.stringify(data));for(let file of f.querySelector('input[type=file]').files)fd.append('files',file);await api('/api/service/'+chosen.id+'/request',{method:'POST',body:fd});await home();msg('Request submitted.')}
 else if(f.id==='walletform'){await api('/api/wallet/request',{method:'POST',body:new FormData(f)});await wallet();msg('Request submitted for admin verification.')}
 else if(f.id==='chatform'){await api('/api/chat',{method:'POST',body:new FormData(f)});await chat();msg('Message sent.')}
 else if(f.id==='adminchatform'){await api('/api/admin/chat/'+encodeURIComponent(f.dataset.uid),{method:'POST',body:new FormData(f)});await adminchat(f.dataset.uid)}
 else if(f.id==='addservice'){await api('/api/admin/services',{method:'POST',body:Object.fromEntries(new FormData(f))});await admin('services');msg('Service added.')}
 }catch(err){msg(err.message,true)}});
document.addEventListener('input',e=>{if(e.target.id==='search'){let q=e.target.value.toLowerCase();$('#custrows')?.querySelectorAll('p').forEach(p=>p.hidden=!p.textContent.toLowerCase().includes(q))}});
start();
