/* Formats: compiles an expression into 1-, 2- and 3-address code and runs it */
const $=i=>document.getElementById(i),OPN={'+':'ADD','-':'SUB','*':'MUL','/':'DIV'},FS={ADD:'+',SUB:'−',MUL:'×',DIV:'÷'},
FOP={ADD:(a,b)=>a+b,SUB:(a,b)=>a-b,MUL:(a,b)=>a*b,DIV:(a,b)=>{if(!b)throw'Division by zero';return Math.trunc(a/b)}},
isR=x=>/^R\d+$/.test(x),isM=x=>/^([A-Z]|T\d+)$/.test(x),leaf=n=>typeof n=='string',isN=x=>/^\d+$/.test(x);
let FF=1,FP={},FM={},FR={},FA=0,FPC=0,FT='',FN=[],FX=0,FAST=0,FV={A:5,B:3,C:8,D:2,E:4,F:1};
function fparse(s){const m=s.replace(/\s+/g,'').toUpperCase().match(/^([A-Z])=(.+)$/);if(!m)throw'Write it like X = A + B';let i=0;const e=m[2];
const prim=()=>{if(e[i]=='('){i++;const n=add();if(e[i++]!=')')throw'Missing )';return n}const r=/^(\d+|[A-Z])/.exec(e.slice(i));if(!r)throw'Unexpected '+(e[i]||'end');i+=r[0].length;return r[0]};
const mul=()=>{let n=prim();while('*/'.includes(e[i]||'#')){const o=e[i++];n=[o,n,prim()]}return n};
const add=()=>{let n=mul();while('+-'.includes(e[i]||'#')){const o=e[i++];n=[o,n,mul()]}return n};
const n=add();if(i<e.length)throw'Unexpected '+e[i];return[m[1],n]}
const ev=n=>leaf(n)?(isN(n)?+n:FV[n]):FOP[OPN[n[0]]](ev(n[1]),ev(n[2])),lv=(n,s)=>leaf(n)?(/^[A-Z]$/.test(n)&&s.add(n)):(lv(n[1],s),lv(n[2],s));
function g1(n,o,tm){if(leaf(n)){o.push(['LD',n]);return}if(leaf(n[2])){g1(n[1],o,tm);o.push([OPN[n[0]],n[2]])}else{g1(n[2],o,tm);const t='T'+(++tm.n);o.push(['ST',t]);g1(n[1],o,tm);o.push([OPN[n[0]],t])}}
function g2(n,o,k){if(leaf(n)){o.push(['MOV','R'+k,n]);return}g2(n[1],o,k);const r=n[2];if(leaf(r))o.push([OPN[n[0]],'R'+k,r]);else{g2(r,o,k+1);o.push([OPN[n[0]],'R'+k,'R'+(k+1)])}}
function g3(n,o,c,d){if(leaf(n))return n;const a=g3(n[1],o,c),b=g3(n[2],o,c),r=d||'R'+(c.n++);o.push([OPN[n[0]],r,a,b]);return r}
function fcompile(){try{const[t,n]=fparse($('fx').value);FT=t;FAST=n;const s=new Set();lv(n,s);FN=[...s];FN.forEach((v,i)=>{if(FV[v]===undefined)FV[v]=i+2});FX=ev(n);
const a=[],b=[],c=[];g1(n,a,{n:0});a.push(['ST',t]);g2(n,b,0);b.push(['MOV',t,'R0']);if(leaf(n))c.push(['MOV',t,n]);else g3(n,c,{n:0},t);FP={1:a,2:b,3:c};
$('fvars').innerHTML=FN.map(v=>`<label class="card" style="padding:8px">${v} = <input type="number" data-v="${v}" value="${FV[v]}"></label>`).join('');
$('ftabs').innerHTML=['1‑address (ACC)','2‑address','3‑address'].map((x,i)=>`<button class="op" data-f="${i+1}">${x}</button>`).join('');
$('fcmp').innerHTML=[1,2,3].map(f=>{const P=FP[f],mm=P.reduce((q,x)=>q+x.slice(1).filter(isM).length,0),rg=new Set();P.forEach(x=>x.forEach(y=>isR(y)&&rg.add(y)));return`<div class="card"><span class="tag">${f}‑address</span><h3>${P.length} instructions</h3><span class="mu">${mm} memory references · ${f==1?'ACC only':rg.size+' registers'}</span></div>`}).join('');
freset()}catch(e){$('fmsg').textContent='Error: '+e}}
function freset(){FM={...FV};FR={};FA=0;FPC=0;$('fmsg').textContent='';frender()}
const val=x=>isN(x)?+x:isR(x)?(FR[x]||0):(FM[x]||0);
function fexec(I){const[o,a,b,c]=I;const set=(d,v)=>isR(d)?FR[d]=v:FM[d]=v,F=(x,y,z)=>`${a} = ${x} ${FS[o]} ${y} = ${z}`;
if(FF==1){if(o=='LD'){FA=val(a);return`ACC ← ${a} = ${FA}`}if(o=='ST'){FM[a]=FA;return`${a} ← ${FA}`}const x=val(a),r=FOP[o](FA,x),q=`ACC = ${FA} ${FS[o]} ${x} = ${r}`;FA=r;return q}
if(o=='MOV'){const v=val(b);set(a,v);return`${a} ← ${v}`}const x=val(FF==2?a:b),y=val(FF==2?b:c),r=FOP[o](x,y);set(a,r);return F(x,y,r)}
function doStep(){const P=FP[FF]||[];if(FPC>=P.length)return false;try{const q=fexec(P[FPC]);FPC++;$('fmsg').textContent=q;if(FPC==P.length)$('fmsg').textContent+=`  |  ${FT} = ${FM[FT]} (expected ${FX}) ${FM[FT]===FX?'✓':'✗'}`}catch(e){$('fmsg').textContent='Error: '+e;FPC=P.length}frender();return FPC<P.length}
function frender(){const P=FP[FF]||[];
$('fcode').innerHTML=P.map((x,i)=>`<div style="padding:3px 8px;border-radius:6px;${i==FPC?'background:var(--code);color:var(--y)':i<FPC?'opacity:.5':''}">${i==FPC?'▶':'&nbsp;'} ${i+1}. ${x[0]} ${x.slice(1).join(', ')}</div>`).join('')||'<span class="mu">Compile an expression.</span>';
const B=(l,v)=>`<div class="box"><small>${l}</small><b>${v}</b></div>`;let h=FF==1?B('ACC',FA):'';
if(FF>1){const rs=new Set(['R0','R1','R2','R3']);P.forEach(x=>x.forEach(y=>isR(y)&&rs.add(y)));h+=[...rs].sort().map(r=>B(r,FR[r]||0)).join('')}
const ms=[...new Set([...FN,FT,...(FF==1?P.filter(x=>/^T\d/.test(x[1]||'')).map(x=>x[1]):[])])];
$('fstate').innerHTML=`<div class="grp">${FF==1?'Accumulator':'Registers'}</div><div class="regs">${h}</div><div class="grp">Memory</div><div class="regs">${ms.map(k=>B('mem['+k+']',FM[k]||0)).join('')}</div>`;
document.querySelectorAll('#ftabs .op').forEach(b=>b.classList.toggle('on',+b.dataset.f==FF))}
$('fgo').onclick=fcompile;$('fx').onkeydown=e=>e.key=='Enter'&&fcompile();
$('ftabs').onclick=e=>{if(e.target.dataset.f){FF=+e.target.dataset.f;freset()}};
$('fstep').onclick=doStep;$('frun').onclick=()=>{let n=0;while(n++<200&&doStep());};$('freset').onclick=freset;
$('fvars').onchange=e=>{const v=e.target.dataset.v;if(v){FV[v]=Math.trunc(+e.target.value)||0;fcompile()}};
$('ftry').onclick=()=>{try{const p=$('fin').value.trim().toUpperCase().split(/[\s,]+/).filter(Boolean),o=p[0],n=p.length-1,ok=FF==1?(o=='LD'||o=='ST'||FOP[o])&&n==1:o=='MOV'?n==2:FOP[o]&&n==FF;if(!ok)throw`${o||'?'} needs ${FF==1?1:FF} operand(s) in this format`;$('fmsg').textContent=fexec(p);frender()}catch(e){$('fmsg').textContent='Error: '+e}};
