(()=>{
const $=i=>document.getElementById(i),cv=$('cv'),cx=cv.getContext('2d');cx.scale(2,2);
const T=80,G=6,OX=10,OY=10,C=5,R=4,H=358,ty=r=>OY+r*(T+G);
const LS={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const P={gacor:.99,normal:.9,rungkad:.3},BETS=[2,4,8,12,20,40,100],MB=[1,2,3,5],MF=[2,4,6,10];
const PAY=[[1,3,6],[.8,2.5,5],[.5,1.5,3],[.3,1,2],[.2,.6,1.5]];
const SY=[{t:'中',c:'#d11a1a'},{t:'發',c:'#0f9d3a'},{d:'bam'},{d:'dot'},{t:'萬',c:'#1b2a6b'},{d:'wild'},{t:'胡',c:'#8a1c1c',sc:1}];
let bal=LS.get('mw2_bal',100000),bi=3,busy=false,mi=0,fs=null,g=[],parts=[];
const bet=()=>BETS[bi],cfg=()=>Object.assign({mode:'normal',forceFS:false},LS.get('mw2_cfg',{}));
const fmt=n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const sl=ms=>new Promise(r=>setTimeout(r,ms));
const anim=(ms,fn)=>new Promise(r=>{const t0=performance.now();(function f(n){const p=Math.min(1,(n-t0)/ms);fn(p);p<1?requestAnimationFrame(f):r()})(t0)});
const ui=()=>{$('bal').textContent=fmt(bal);$('bet').textContent=fmt(bet())};
const setMult=i=>{mi=i;[...$('mbar').children].forEach((li,k)=>{li.textContent='x'+(fs?MF:MB)[k];li.classList.toggle('on',k===i)});$('mbar').classList.toggle('fs',!!fs)};
const log=o=>{const l=LS.get('mw2_log',[]);l.unshift(Object.assign({t:Date.now(),bal},o));LS.set('mw2_log',l.slice(0,300))};
const live=o=>LS.set('mw2_live',Object.assign({active:!!fs,left:fs?fs.left:0,total:fs?fs.total:0,sc:0},o));
async function flash(m){$('ov').textContent=m;$('ov').classList.add('show');await sl(1800);$('ov').classList.remove('show')}
// grid
const rt=(c,nosc)=>{const s=(!nosc&&Math.random()<.03)?6:Math.floor(Math.random()*5);return{s,gold:s<5&&c>0&&c<4&&Math.random()<.08,wild:false,y:0,a:1,sc:1}};
function ev(gr){let win=0;const marks=new Set();
 for(let s=0;s<5;s++){let ways=1,len=0,real=0,m=[];
  for(let c=0;c<C;c++){const h=gr[c].filter(t=>t&&(t.s===s||t.s===5));if(!h.length)break;ways*=h.length;len++;m.push(...h);if(h.some(t=>t.s===s))real=1}
  if(len>=3&&real){win+=PAY[s][Math.min(len,5)-3]*ways;m.forEach(t=>marks.add(t))}}
 return{win,marks}}
function mkGrid(mode,forced){const want=Math.random()<P[mode];let k=0,gr;
 do{gr=Array.from({length:C},(_,c)=>Array.from({length:R},()=>rt(c)))}while((ev(gr).win>0)!==want&&++k<80);
 if(forced){const cells=gr.flatMap((col,c)=>col.map((_,r)=>[c,r])).sort(()=>Math.random()-.5).slice(0,3+(Math.random()<.3));
  cells.forEach(([c,r])=>Object.assign(gr[c][r],{s:6,gold:false}))}
 gr.forEach((col,c)=>col.forEach((t,r)=>t.y=ty(r)-480-c*50-r*10));return gr}
const settle=()=>{const a=[];g.forEach(col=>col.forEach((t,r)=>a.push([t,t.y,ty(r)])));return anim(480,p=>{const e=1-Math.pow(1-p,3);a.forEach(([t,y0,y1])=>t.y=y0+(y1-y0)*e)})};
async function shatter(m){
 m.forEach(t=>{const c=g.findIndex(col=>col.includes(t));for(let i=0;i<8;i++)parts.push({x:OX+c*(T+G)+T/2,y:t.y+T/2,vx:(Math.random()-.5)*7,vy:-Math.random()*6-1,l:1})});
 await anim(420,p=>m.forEach(t=>{t.a=1-p;t.sc=1+p*.35}));
 g.forEach(col=>col.forEach((t,r)=>{if(!m.has(t))return;if(t.gold)Object.assign(t,{s:5,gold:false,wild:true,a:1,sc:1});else col[r]=null}))}
const collapse=()=>{g=g.map(col=>{const k=col.filter(Boolean);return[...Array(R-k.length).fill(null),...k]})};
function fill(mode){const e=[];g.forEach((col,c)=>col.forEach((t,r)=>{if(!t)e.push([c,r])}));const want=Math.random()<P[mode];let k=0;
 do{e.forEach(([c,r])=>{const t=rt(c,true);t.y=ty(r)-420-c*30;g[c][r]=t})}while(!want&&ev(g).win>0&&++k<30)}
// one spin (base or free)
async function round(free){
 const c=cfg();let forced=false;
 if(!free){bal-=bet();LS.set('mw2_bal',bal);if(c.forceFS){forced=true;LS.set('mw2_cfg',Object.assign({},c,{forceFS:false}))}}
 else{fs.left--;fs.n++}
 $('win').textContent='';setMult(0);ui();
 g=mkGrid(c.mode,forced&&!free);await settle();
 const sc=g.flat().filter(t=>t.s===6).length;let tot=0;
 for(;;){const e=ev(g);if(!e.win)break;
  tot+=e.win*bet()*(free?MF:MB)[mi];$('win').textContent='MENANG '+fmt(tot);
  await shatter(e.marks);collapse();fill(c.mode);setMult(Math.min(mi+1,3));await settle()}
 bal+=tot;LS.set('mw2_bal',bal);ui();
 let msg='';
 if(free){fs.total+=tot;if(sc>=3){fs.left+=5;msg='+5 FREE SPINS'}
  log({type:'FS',bet:0,win:tot,sc,n:fs.n,left:fs.left,fsTotal:fs.total})}
 else{const trig=sc>=3;if(trig){fs={left:10,total:0,n:0};msg='10 FREE SPINS'}
  log({type:'SPIN',bet:bet(),win:tot,sc,trig})}
 live({sc});
 if(msg){await flash(msg);setMult(0)}}
async function play(){
 if(busy)return;if(bal<bet()){$('win').textContent='Saldo tidak cukup';return}
 busy=true;document.body.classList.add('busy');
 try{await round(false);
  while(fs&&fs.left>0){await sl(700);await round(true)}
  if(fs){await flash('TOTAL MENANG '+fmt(fs.total));log({type:'FS-END',bet:0,win:fs.total,sc:0,fsTotal:fs.total});fs=null;live({});setMult(0)}
 }finally{busy=false;document.body.classList.remove('busy')}}
// draw
const rr=()=>cx.roundRect(-T/2,-T/2,T,T,12);
function tile(x,t){const s=SY[t.s];cx.save();cx.translate(x+T/2,t.y+T/2);cx.scale(t.sc,t.sc);cx.globalAlpha=t.a;
 cx.beginPath();rr();cx.shadowColor='rgba(0,0,0,.55)';cx.shadowBlur=8;cx.shadowOffsetY=4;
 const gd=cx.createLinearGradient(0,-T/2,0,T/2);gd.addColorStop(0,t.wild?'#fff3b0':'#fff');gd.addColorStop(1,t.wild?'#e0a41a':'#d9d9d9');
 cx.fillStyle=gd;cx.fill();cx.shadowColor='transparent';cx.lineWidth=t.gold?5:3;cx.strokeStyle=t.gold?'#ffc01f':'#9a9a9a';cx.stroke();
 if(t.gold){cx.lineWidth=1.5;cx.strokeStyle='#fff6c8';cx.beginPath();cx.roundRect(-T/2+5,-T/2+5,T-10,T-10,8);cx.stroke()}
 if(s.t){cx.font='bold '+(s.sc?54:58)+'px KaiTi,STKaiti,"Noto Serif SC","Songti SC",serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle=s.c;cx.fillText(s.t,0,3);if(s.sc){cx.strokeStyle='#d4a017';cx.lineWidth=1.5;cx.strokeText(s.t,0,3)}}
 else if(s.d==='bam'){[-17,0,17].forEach((o,i)=>{cx.fillStyle=i===1?'#1f6fd1':'#14994a';cx.fillRect(o-6,-28,12,56);cx.fillStyle='#fff9';cx.fillRect(o-6,-10,12,2);cx.fillRect(o-6,10,12,2)})}
 else if(s.d==='dot'){[['#c81e1e',-15,-14],['#1f6fd1',15,-14],['#14994a',0,15]].forEach(([c,a,b])=>{cx.beginPath();cx.arc(a,b,13,0,7);cx.fillStyle=c;cx.fill();cx.lineWidth=3;cx.strokeStyle='#fff';cx.stroke();cx.beginPath();cx.arc(a,b,5,0,7);cx.fillStyle='#fff';cx.fill()})}
 else{cx.beginPath();cx.moveTo(-30,-14);cx.lineTo(30,-14);cx.lineTo(22,10);cx.lineTo(-22,10);cx.closePath();const b=cx.createLinearGradient(0,-14,0,10);b.addColorStop(0,'#fff0a0');b.addColorStop(1,'#d18a00');cx.fillStyle=b;cx.fill();cx.strokeStyle='#8a5a00';cx.lineWidth=2;cx.stroke();
  cx.beginPath();cx.ellipse(0,-14,30,7,0,0,7);cx.fillStyle='#ffe66b';cx.fill();cx.stroke();
  cx.font='900 17px Georgia,serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle='#7a1010';cx.fillText('WILD',0,26)}
 cx.restore()}
function draw(){cx.clearRect(0,0,440,H);
 for(let c=0;c<C;c++){cx.fillStyle='rgba(60,0,0,.35)';cx.fillRect(OX+c*(T+G)-3,0,T+6,H)}
 g.forEach((col,c)=>col.forEach(t=>t&&tile(OX+c*(T+G),t)));
 parts=parts.filter(p=>p.l>0);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.45;p.l-=.03;cx.globalAlpha=Math.max(p.l,0);cx.fillStyle='#fff';cx.fillRect(p.x,p.y,6,6)});cx.globalAlpha=1;
 requestAnimationFrame(draw)}
// init
g=Array.from({length:C},(_,c)=>Array.from({length:R},(_,r)=>{const t=rt(c,true);t.y=ty(r);return t}));
$('sp').onclick=play;$('mi').onclick=()=>{if(!busy&&bi>0){bi--;ui()}};$('pl').onclick=()=>{if(!busy&&bi<BETS.length-1){bi++;ui()}};
addEventListener('storage',e=>{if(e.key==='mw2_bal'){bal=LS.get('mw2_bal',bal);ui()}});
LS.set('mw2_bal',bal);live({});setMult(0);ui();draw();
})();
 
