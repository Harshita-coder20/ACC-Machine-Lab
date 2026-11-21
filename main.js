/* Page routing and start-up */
function route(){const h=(location.hash||'#home').slice(1),id=['home','learn','interp','asm','fmt','isa','about'].includes(h)?h:'home';
document.querySelectorAll('.page').forEach(p=>p.classList.toggle('on',p.id=='p-'+id));document.querySelectorAll('.links a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')=='#'+id));scrollTo(0,0)}
addEventListener('hashchange',route);route();pick('ADD');render();fcompile();
