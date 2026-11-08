const PRICES={"Original":10,"Mix":12,"Special":15,"Extra Special":18};
const $=id=>document.getElementById(id);
let client=null, selected=null, sales=[], deferredInstall=null;
const money=n=>'RM'+Number(n||0).toFixed(2);
function toast(s){$('toast').textContent=s;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',2600)}
function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function config(){return {url:localStorage.getItem('supa_url'),key:localStorage.getItem('supa_key')}}
function setSelected(name){selected=name;document.querySelectorAll('.menu').forEach(b=>b.classList.toggle('active',b.dataset.menu===name));$('selectedMenu').textContent=name?`${name} · ${money(PRICES[name])} per set`:'Select a menu above';updateTotal()}
function updateTotal(){const q=Math.max(1,Number($('quantity').value)||1);$('orderTotal').textContent=money(selected?PRICES[selected]*q:0)}
async function connect(){const c=config();if(!c.url||!c.key){$('setupPanel').classList.remove('hidden');$('authPanel').classList.add('hidden');$('app').classList.add('hidden');return}
 if(!window.supabase){toast('Could not load database library. Check internet connection.');return}
 client=window.supabase.createClient(c.url,c.key);
 $('setupPanel').classList.add('hidden');$('authPanel').classList.remove('hidden');
 const {data:{session}}=await client.auth.getSession();
 if(session){$('authStatus').textContent='Signed in as '+session.user.email;$('signOut').classList.remove('hidden');$('app').classList.remove('hidden');await loadSales()}else{$('app').classList.add('hidden');$('authStatus').textContent='Sign in with an authorised account.'}
}
async function loadSales(){const start=localDate()+'T00:00:00';const end=localDate()+'T23:59:59.999';const {data,error}=await client.from('sales').select('*').gte('created_at',start).lte('created_at',end).order('created_at',{ascending:false}).limit(500);if(error){toast(error.message);return}sales=data||[];render()}
function render(){const total=sales.reduce((a,x)=>a+Number(x.total),0),units=sales.reduce((a,x)=>a+Number(x.quantity),0),cash=sales.filter(x=>x.payment_type==='cash').reduce((a,x)=>a+Number(x.total),0),qr=total-cash;
 $('todaySales').textContent=money(total);$('todayUnits').textContent=units;$('todayCash').textContent=money(cash);$('todayQr').textContent=money(qr);
 const rows=Object.keys(PRICES).map(name=>{const xs=sales.filter(x=>x.menu===name);return `<tr><td>${name}</td><td>${xs.reduce((a,x)=>a+Number(x.quantity),0)}</td><td>${money(xs.reduce((a,x)=>a+Number(x.total),0))}</td></tr>`}).join('');
 $('breakdown').innerHTML=`<table><thead><tr><th>Menu</th><th>Qty</th><th>Sales</th></tr></thead><tbody>${rows}</tbody></table>`;
 $('transactions').innerHTML=sales.length?`<table><thead><tr><th>Time</th><th>Menu</th><th>Qty</th><th>Payment</th><th>Total</th></tr></thead><tbody>${sales.slice(0,60).map(x=>`<tr><td>${new Date(x.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td><td>${x.menu}</td><td>${x.quantity}</td><td><span class="pill">${x.payment_type.toUpperCase()}</span></td><td>${money(x.total)}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">No transactions today yet.</div>';
}
document.querySelectorAll('.menu').forEach(b=>b.addEventListener('click',()=>setSelected(b.dataset.menu)));
$('quantity').addEventListener('input',updateTotal);
$('saveConfig').addEventListener('click',()=>{const url=$('supabaseUrl').value.trim(),key=$('supabaseKey').value.trim();if(!url.startsWith('https://')||!key){toast('Enter a valid project URL and public key.');return}localStorage.setItem('supa_url',url);localStorage.setItem('supa_key',key);connect()});
$('clearConfig').addEventListener('click',()=>{localStorage.removeItem('supa_url');localStorage.removeItem('supa_key');location.reload()});
$('signIn').addEventListener('click',async()=>{const {error}=await client.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){$('authStatus').textContent=error.message;return}connect()});
$('signOut').addEventListener('click',async()=>{await client.auth.signOut();connect()});
$('saveSale').addEventListener('click',async()=>{if(!selected){toast('Choose a menu first.');return}const q=Number($('quantity').value);if(!Number.isInteger(q)||q<1){toast('Quantity must be a whole number above zero.');return}const total=PRICES[selected]*q;const {error}=await client.from('sales').insert({menu:selected,quantity:q,unit_price:PRICES[selected],total,payment_type:$('payment').value,note:$('note').value.trim()});if(error){toast(error.message);return}$('quantity').value=1;$('note').value='';setSelected(null);$('saleStatus').textContent='Transaction saved.';await loadSales()});
$('refresh').addEventListener('click',loadSales);
$('exportCsv').addEventListener('click',()=>{const rows=[['Created at','Menu','Quantity','Unit price','Total','Payment','Note'],...sales.map(x=>[x.created_at,x.menu,x.quantity,x.unit_price,x.total,x.payment_type,x.note||''])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='es-pisang-ijo-today.csv';a.click();URL.revokeObjectURL(a.href)});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installBtn').classList.remove('hidden')});
$('installBtn').addEventListener('click',async()=>{if(deferredInstall){deferredInstall.prompt();deferredInstall=null}});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
connect();