/* Interpreter: instruction table, one-accumulator engine, visual step display, memory editor */
const ISA=[['LD','DM','m','ACC = mem[X]','Project'],['ST','DM','m','mem[X] = ACC','Project'],['ADD','ALU','m','ACC = ACC + mem[X]','Project'],['SUB','ALU','m','ACC = ACC − mem[X]','Project'],['MUL','ALU','m','ACC = ACC × mem[X]','Project'],['DIV','ALU','m','ACC = ACC ÷ mem[X]; error if 0','Project'],['AND','LU','m','ACC = ACC & mem[X]','Project'],['OR','LU','m','ACC = ACC | mem[X]','Project'],['NOT','LU','n','ACC = ~ACC (8‑bit: 255 − ACC)','Project'],
['LDI','DM','i','ACC = X (immediate value)','Processor'],['MOD','ALU','m','ACC = ACC mod mem[X]; error if 0','Added'],['INC','ALU','n','ACC = ACC + 1','Added'],['DEC','ALU','n','ACC = ACC − 1','Added'],['NEG','ALU','n','ACC = −ACC','Added'],['XOR','LU','m','ACC = ACC ^ mem[X]','Added'],['SHL','LU','n','ACC = ACC << 1','Added'],['SHR','LU','n','ACC = ACC >> 1','Added'],
['JMP','CF','j','PC = X','Added'],['JZ','CF','j','if ZERO then PC = X','Added'],['JN','CF','j','if NEGATIVE then PC = X','Added'],['OUT','IO','n','print ACC','Added'],['HLT','CF','n','stop the processor','Processor']];
const T={};ISA.forEach(o=>T[o[0]]=o);T.LDA=T.LD;T.STA=T.ST;
isa.innerHTML=ISA.map(o=>`<tr><td class="c mono">${o[0]}${o[2]=='n'?'':' X'}</td><td>${o[1]}</td><td>${o[3]}</td><td>${o[4]}</td></tr>`).join('');
const BIN={ADD:(a,b)=>a+b,SUB:(a,b)=>a-b,MUL:(a,b)=>Math.imul(a,b),DIV:(a,b)=>Math.trunc(a/b),MOD:(a,b)=>a%b,AND:(a,b)=>a&b,OR:(a,b)=>a|b,XOR:(a,b)=>a^b};
const SYM={ADD:'+',SUB:'−',MUL:'×',DIV:'÷',MOD:'mod',AND:'&',OR:'|',XOR:'^'};
let m8=true,sel='ADD',hist=[],prog=[],logr=[],MS=16;
const fresh=()=>({acc:0,pc:0,mar:0,mdr:0,ir:'—',mem:Array(MS).fill(0),z:1,n:0,e:0,steps:0,halt:0,out:[]});
let st=fresh();
const w=v=>m8?((v%256)+256)%256:v|0;
const bin=v=>{let s='';for(let i=(m8?8:16)-1;i>=0;i--){s+=(v>>i)&1;if(i%4==0&&i)s+=' '}return s};
const chg=(a,b)=>{let s='';for(let i=(m8?8:16)-1;i>=0;i--){s+=((a>>i)&1)!=((b>>i)&1)?'<span class="ch">^</span>':'.';if(i%4==0&&i)s+=' '}return s};
function ex(op,x){const a=st.acc,t=T[op];let eq='';st.e=0;const rd=()=>{st.mar=x;return st.mdr=st.mem[x]};
if(op=='LDI'){st.acc=w(x);eq=`ACC ← ${x}`}
else if(t[0]=='LD'){st.acc=rd();eq=`ACC ← mem[${x}] = ${st.acc}`}
else if(t[0]=='ST'){st.mar=x;st.mdr=a;st.mem[x]=a;eq=`mem[${x}] ← ${a}`}
else if(BIN[op]){const b=rd();if((op=='DIV'||op=='MOD')&&b==0){st.e=1;eq=`${a} ${SYM[op]} 0 = ERROR`}else{st.acc=w(BIN[op](a,b));eq=`${a} ${SYM[op]} ${b} = ${st.acc}`}}
else if(op=='NOT'){st.acc=m8?255-a:~a;eq=`~${a} = ${st.acc}`}
else if(op=='NEG'){st.acc=w(-a);eq=`−${a} = ${st.acc}`}else if(op=='INC'){st.acc=w(a+1);eq=`${a} + 1 = ${st.acc}`}
else if(op=='DEC'){st.acc=w(a-1);eq=`${a} − 1 = ${st.acc}`}else if(op=='SHL'){st.acc=w(a<<1);eq=`${a} << 1 = ${st.acc}`}
else if(op=='SHR'){st.acc=m8?a>>>1:a>>1;eq=`${a} >> 1 = ${st.acc}`}
else if(op=='OUT'){st.out.push(a);eq=`output ${a}`}else if(op=='HLT'){st.halt=1;eq='halted'}
else if(op=='JMP'){st.pc=x;eq=`PC ← ${x}`}else if(op=='JZ'){eq=st.z?(st.pc=x,`ZERO set, PC ← ${x}`):'ZERO clear, no jump'}else if(op=='JN'){eq=st.n?(st.pc=x,`NEG set, PC ← ${x}`):'NEG clear, no jump'}
st.z=+(st.acc==0);st.n=+(m8?st.acc>=128:st.acc<0);st.steps++;st.ir=op+(t[2]=='n'?'':' '+x);
logr.push(`<tr><td>${st.steps}</td><td class="c">${st.ir}</td><td>${st.acc}</td><td>${st.pc}</td><td>${st.mar}</td><td>${st.mdr}</td><td>${eq}</td></tr>`);
return{a,eq,op,x}}
function show(r){const t=T[r.op],mv=t[1]=='DM',s=st.acc;let flow=t[2]=='m'&&!mv?`mem[${r.x}] ⟶ [ ${r.op} ] ⟶ ACC`:mv?(r.op=='ST'?`ACC ⟶ mem[${r.x}]`:r.op=='LDI'?`${r.x} ⟶ ACC`:`mem[${r.x}] ⟶ ACC`):`ACC ⟶ [ ${r.op} ] ⟶ ACC`;
const mx=m8?255:100,f=Math.min(100,Math.abs(s)/mx*100);
res.className='';res.innerHTML=`<div class="flow mono">${flow}</div><p class="mono">${r.eq}</p>${st.e?'<p class="err">Cannot divide by zero. ACC unchanged.</p>':''}<div class="mono bits">before ${bin(r.a)}<br>after&nbsp;&nbsp; ${bin(s)}${mv?'':'<br>change '+chg(r.a,s)}</div><div class="bar" style="margin-top:8px"><i style="width:${f}%"></i></div>`}
function render(){const L=(n,o,c='')=>`<span class="lit ${c} ${o?'on':''}">${n}</span>`;
const h=`<div class="box"><small>ACC</small><b>${st.acc}</b></div><div class="box"><small>BIN</small><b class="mono" style="font-size:15px">${bin(st.acc)}</b></div><div class="box"><small>PC</small><b>${st.pc}</b></div><div class="box"><small>IR</small><b style="font-size:15px">${st.ir}</b></div><div class="box"><small>MAR</small><b>${st.mar}</b></div><div class="box"><small>MDR</small><b>${st.mdr}</b></div><div class="box"><small>FLAGS</small>${L('Z',st.z)}${L('N',st.n)}${L('E',st.e,'er')}</div>`;
document.querySelectorAll('.regs').forEach(e=>e.innerHTML=h);
mem.innerHTML=st.mem.map((v,i)=>`<div class="${i==st.mar&&st.steps?'hit':''}"><small>[${i}]</small><input type="number" value="${v}" data-i="${i}"></div>`).join('');
document.querySelectorAll('.log').forEach(e=>e.innerHTML=logr.slice(-60).join(''));
outp.textContent=st.out.length?st.out.join(', '):'–'}
mem.onchange=e=>{const i=+e.target.dataset.i;st.mem[i]=w(+e.target.value||0);render()};
const G={ALU:'ALU',LU:'LU',DM:'DM'};document.querySelectorAll('.ops').forEach(d=>{d.innerHTML=ISA.filter(o=>o[1]==d.dataset.g&&o[0]).map(o=>`<button class="op" data-o="${o[0]}">${o[0]}</button>`).join('')});
function pick(o){sel=o;const t=T[o];document.querySelectorAll('.op').forEach(b=>b.classList.toggle('on',b.dataset.o==o));
opnd.disabled=t[2]=='n';olab.textContent=t[2]=='i'?'Value':t[2]=='n'?'No operand':'Address X (0‑15)';desc.textContent=`${o}${t[2]=='n'?'':' X'}: ${t[3]}. In plain words: ${PL[o]||''}`}
document.querySelector('#p-interp').onclick=e=>{if(e.target.dataset.o)pick(e.target.dataset.o)};
exe.onclick=()=>{const t=T[sel],x=t[2]=='n'?null:Math.floor(+opnd.value);
if(t[2]=='m'&&!(x>=0&&x<MS)){res.innerHTML='<span class="err">Invalid address (0‑15).</span>';return}
if(t[2]=='i'&&!(m8?x>=0&&x<256:true)){res.innerHTML='<span class="err">Value must be 0‑255 in 8‑bit mode.</span>';return}
hist.push(JSON.stringify([st,logr]));const r=ex(sel,x);show(r);render()};
undo.onclick=()=>{if(hist.length){[st,logr]=JSON.parse(hist.pop());render();res.textContent='Undone.'}};
reset.onclick=()=>{st=fresh();logr=[];hist=[];res.textContent='Machine reset.';render()};
mode.onchange=()=>{m8=mode.value=='8';reset.onclick()};
