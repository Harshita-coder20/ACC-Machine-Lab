/* Assembler: parses assembly text (labels, DATA) and runs it step by step */
const EX={'Sum 1..5 (loop)':'DATA 0 5\nDATA 2 1\nloop: LD 1\nADD 0\nST 1\nLD 0\nSUB 2\nST 0\nJZ end\nJMP loop\nend: LD 1\nOUT\nHLT','Add two numbers':'DATA 2 5\nLDI 3\nADD 2\nST 4\nOUT\nHLT','Logic demo':'DATA 0 12\nDATA 1 10\nLD 0\nAND 1\nOUT\nLD 0\nOR 1\nOUT\nLD 0\nXOR 1\nOUT\nNOT\nOUT\nHLT','Multiply by repeated add (6×4)':'DATA 0 6\nDATA 1 4\nDATA 3 1\nloop: LD 2\nADD 0\nST 2\nLD 1\nSUB 3\nST 1\nJZ end\nJMP loop\nend: LD 2\nOUT\nHLT'};
exsel.innerHTML=Object.keys(EX).map(k=>`<option>${k}</option>`).join('');exsel.onchange=()=>src.value=EX[exsel.value];src.value=EX[exsel.value];
function assemble(){st=fresh();logr=[];prog=[];const lab={},raw=[];
try{src.value.split('\n').forEach(l=>{l=l.split(';')[0].trim();if(!l)return;let m=l.match(/^(\w+):\s*(.*)$/);if(m){lab[m[1]]=raw.length;l=m[2]}if(!l)return;const p=l.split(/\s+/),o=p[0].toUpperCase();
if(o=='DATA'){st.mem[+p[1]]=w(+p[2]);return}if(!T[o])throw'Unknown instruction: '+p[0];raw.push([o,p[1]])});
prog=raw.map(([o,a])=>{const t=T[o];if(t[2]=='n')return[o,null];let x=a in lab?lab[a]:Number(a);if(a===undefined||isNaN(x))throw`${o} needs an operand`;if(t[2]=='m'&&!(x>=0&&x<MS))throw`Address out of range in ${o} ${a}`;return[o,x]});
amsg.className='mono';amsg.textContent=`Assembled ${prog.length} instructions. Ready.`}catch(e){amsg.className='mono err';amsg.textContent=e;prog=[]}render()}
function one(){if(!prog.length||st.halt||st.e||st.pc>=prog.length)return false;const[o,x]=prog[st.pc++];ex(o,x);return !st.halt&&!st.e}
function fin(){amsg.className='mono';amsg.textContent=st.e?'Stopped: division by zero.':st.halt?'Processor halted successfully.':st.pc>=prog.length?'End of program.':'Running…'}
asm.onclick=assemble;step.onclick=()=>{if(!prog.length)assemble();one();fin();render()};
run.onclick=()=>{assemble();let n=0;while(n++<5000&&one());if(n>5000){amsg.className='mono err';amsg.textContent='Stopped after 5000 steps (possible infinite loop).'}else fin();render()};
