/* BIOGLOW practice lab. Mission scores are entered from observed model states. */
const $ = id => document.getElementById(id);
const W = 1200, H = 650;
const canvas = $('field'), ctx = canvas.getContext('2d');
const RULES = 'https://www.firstinspires.org/resources/library/fll/season-materials';
const missions = [
  {name:'Drone Survey', x:145,y:170, rules:[['drone','Дрон больше не касается мата',20],['map','Карта LiDAR полностью перевёрнута, маркер частично в зоне',10,'drone']]},
  {name:'Exploding Seeds',x:350,y:125,rules:[['seeds','Семена отделены от стебля',10,'count',5]]},
  {name:'Flip the Rock',x:550,y:145,rules:[['flag','Исследовательский флаг опущен',20],['rock','Камень возвращён на исходное место',10,'flag']]},
  {name:'Lucky Leaves',x:775,y:110,rules:[['leaf1','Первый лист полностью отделён от гнезда',10],['leaf2','Второй лист отделён, кузнечик не покидал местообитание',20,'leaf1'],['escaped','Кузнечик полностью покидал местообитание',0],['outside','Кузнечик полностью вне местообитания в конце',0]]},
  {name:'Reaching Roots',x:1045,y:145,rules:[['root','Корень растения',0,'select',['Не выдвинут','Частично — 10','Полностью — 20']]]},
  {name:'Leafcutter Frenzy',x:230,y:310,rules:[['fragments','Фрагменты в гнезде; муравей касается гнезда',10,'count',6]]},
  {name:'Humongous Fungus',x:440,y:300,rules:[['mycelium','Мицелий полностью выдвинут',20],['connections','Связь с полностью выдвинутым корнем соперника',10,'count',2]]},
  {name:'Tangled',x:655,y:280,rules:[['vine','Лоза касается мата',30]]},
  {name:'Research Platform',x:830,y:295,rules:[['platform','Платформа поднята',10],['camera','Фотоловушка развёрнута',10],['seed','Семя больше не касается дерева',10]]},
  {name:'Fragile Microhabitats',x:1010,y:320,rules:[['spider','Среда паука в исходном положении',10],['snail','Среда улитки в исходном положении',10]]},
  {name:'Window to the Past',x:185,y:475,rules:[['cover','Крышка корня опущена и касается мата',20]]},
  {name:'Forest Elder',x:410,y:505,rules:[['cane','Трость полностью поднята и касается дерева',20],['tie','Подвязка вокруг столба',10]]},
  {name:'Keystone Species',x:630,y:490,rules:[['species','Вид команды на платформе, молодые деревья подняты',30]]},
  {name:'Seeds of Renewal',x:855,y:495,rules:[['contained','Семена внутри станции',5,'count',6],['touching','Из них касаются мата',5,'count',6]]},
  {name:'Biocentric Architecture',x:1070,y:490,rules:[['canopy','Гнездовой навес поднят',10],['skylight','Садовый люк полностью внутри',10],['hatch','Компостный люк полностью открыт и касается мата',10],['dock','Причал модели для экологического бонуса',0,'select',['Не выбран','Шахта','Город','Ферма']]]}
];
const initialRobot = {width:180,length:200,wheel:56,track:140,velocity:180,attachment:'fork'};
const key = 's7-bioglow-lab-v1';
const saved = (()=>{try{return JSON.parse(localStorage.getItem(key)) || {}}catch{return {}}})();
const state = {
  robot:{...initialRobot,...saved.robot}, programs:saved.programs || {Маршрут:'speed(180)\nmove(400)\nturn(90)\nmove(300)'},
  active:saved.active || 'Маршрут', results:saved.results || {}, inspection:!!saved.inspection,
  tokens:Number.isInteger(saved.tokens)?saved.tokens:6, mode:'practice', side:'left',
  x:85,y:H/2, angle:0, speed:1, elapsed:0, running:false, paused:false,
  trail:[], showTrail:true, queue:[], current:null, console:[], selected:0, dragging:false
};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const persist=()=>{try{localStorage.setItem(key,JSON.stringify({robot:state.robot,programs:state.programs,active:state.active,results:state.results,inspection:state.inspection,tokens:state.tokens}))}catch{}};
const log=s=>{state.console.push(s);state.console=state.console.slice(-12);$('console').textContent=state.console.join('\n')};
function home(){state.x=state.side==='left'?85:W-85;state.y=H/2;state.angle=state.side==='left'?0:Math.PI;state.trail=[]}
function scoreMission(i){
  const r=state.results[i] || {}, v=id=>r[id] || 0;
  if(i===3 && v('outside')) return 0;
  let score=0;
  for(const rule of missions[i].rules){
    const [id,,points,type,extra]=rule;
    if(type==='count' && !(i===13 && id==='touching')) score+=clamp(Number(v(id)),0,extra)*points;
    else if(type==='select') score+=i===4?Number(v(id))*10:0;
    else if(!type) score+=v(id)?points:0;
    else if(typeof type==='string' && v(id) && v(type)) score+=points;
  }
  if(i===3 && v('escaped')) score-=v('leaf2')?20:0;
  if(i===6 && !v('mycelium')) score-=clamp(Number(v('connections')),0,2)*10;
  if(i===13) score+=Math.min(Number(v('contained')),Number(v('touching')))*5;
  if(i===14){
    const dock=Number(v('dock'));
    const id=['', 'canopy','skylight','hatch'][dock];
    if(v(id)) score+=10;
  }
  return Math.max(0,score);
}
const precision=[0,10,15,25,35,50,50];
function updateScore(){
  const total=missions.reduce((n,_,i)=>n+scoreMission(i),0)+(state.inspection?20:0)+precision[state.tokens];
  $('score').innerHTML=total+' <small>очков</small>';
  $('timer').textContent=String(Math.floor((150-state.elapsed)/60)).padStart(1,'0')+':'+String(Math.floor((150-state.elapsed)%60)).padStart(2,'0');
  return total;
}
function missionControls(i){
  const m=missions[i], r=state.results[i] || {}, box=$('mission-controls');
  box.replaceChildren();
  for(const [id,label,points,type,extra] of m.rules){
    const row=document.createElement('label'), span=document.createElement('span');
    span.textContent=label+(points?' · '+points+' очк.':'');
    let input;
    if(type==='count'){
      input=document.createElement('input'); input.type='number';input.min=0;input.max=extra;input.step=1;input.value=r[id]||0;input.style.width='70px';
    }else if(type==='select'){
      input=document.createElement('select');
      extra.forEach((s,n)=>{const opt=document.createElement('option');opt.value=n;opt.textContent=s;input.append(opt)});
      input.value=r[id]||0;
    }else{
      input=document.createElement('input');input.type='checkbox';input.checked=!!r[id];
    }
    input.dataset.rule=id;
    row.append(input,span);box.append(row);
  }
  if(i===3){const p=document.createElement('p');p.className='micro';p.textContent='Обновление FIRST от 2 сентября: выход кузнечика из местообитания лишает бонуса; если он вне его в конце матча — 0 за миссию.';box.append(p)}
  if(i===6){const p=document.createElement('p');p.className='micro';p.textContent='Бонус связи с корнем соперника отмечайте только после подтверждения состояния противоположного поля.';box.append(p)}
}
function openMission(i){
  state.selected=i;$('mission-number').textContent='M'+String(i+1).padStart(2,'0');
  $('mission-title').textContent=missions[i].name;
  $('mission-desc').textContent='Отметьте фактически выполненные условия. Позиция робота на схеме не начисляет очки.';
  missionControls(i);$('mission-dialog').showModal();
}
function renderMissions(){
  const box=$('missions');box.replaceChildren();
  missions.forEach((m,i)=>{
    const wrap=document.createElement('div');wrap.className='mission';
    const btn=document.createElement('button');btn.className='mission-head';btn.type='button';
    const b=document.createElement('b');b.textContent='M'+String(i+1).padStart(2,'0');
    const s=document.createElement('span');s.textContent=m.name;
    const small=document.createElement('small');small.textContent=scoreMission(i)+' очк.';
    btn.append(b,s,small);btn.onclick=()=>openMission(i);wrap.append(btn);box.append(wrap);
  });updateScore();
}
$('mission-done').onclick=()=>{
  const r={};$('mission-controls').querySelectorAll('[data-rule]').forEach(input=>{
    r[input.dataset.rule]=input.type==='checkbox'?input.checked:Number(input.value);
  });
  state.results[state.selected]=r;persist();renderMissions();$('mission-dialog').close();
};
function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#183b35';ctx.fillRect(0,0,W,H);
  for(let x=0;x<W;x+=50){ctx.strokeStyle=x%100===0?'#375b55':'#284940';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
  for(let y=0;y<H;y+=50){ctx.strokeStyle=y%100===0?'#375b55':'#284940';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
  ctx.fillStyle='#1b5970';ctx.fillRect(12,185,155,280);ctx.fillRect(W-167,185,155,280);
  ctx.strokeStyle='#71cfe4';ctx.lineWidth=3;ctx.strokeRect(12,185,155,280);ctx.strokeRect(W-167,185,155,280);
  ctx.fillStyle='#c6eff7';ctx.font='bold 18px system-ui';ctx.fillText('ЛЕВАЯ БАЗА',20,210);ctx.fillText('ПРАВАЯ БАЗА',W-155,210);
  missions.forEach((m,i)=>{
    ctx.beginPath();ctx.arc(m.x,m.y,25,0,Math.PI*2);ctx.fillStyle=scoreMission(i)?'#238e8d':'#254a59';ctx.fill();
    ctx.strokeStyle=scoreMission(i)?'#76e7db':'#7ea7ae';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 16px system-ui';ctx.fillText(String(i+1).padStart(2,'0'),m.x,m.y+6);
  });ctx.textAlign='left';
  if(state.showTrail && state.trail.length>1){
    ctx.beginPath();state.trail.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.strokeStyle='#ffd872';ctx.lineWidth=3;ctx.stroke();
  }
  ctx.save();ctx.translate(state.x,state.y);ctx.rotate(state.angle);
  const rw=state.robot.length*.45,rh=state.robot.width*.45;
  ctx.fillStyle='#57d4e0';ctx.fillRect(-rw/2,-rh/2,rw,rh);
  ctx.fillStyle='#102b3d';ctx.fillRect(rw/2-8,-rh/2+8,8,rh-16);
  ctx.fillStyle='#fbd47a';ctx.beginPath();ctx.moveTo(rw/2+12,0);ctx.lineTo(rw/2-6,-10);ctx.lineTo(rw/2-6,10);ctx.fill();ctx.restore();
  $('hud').textContent='x '+Math.round(state.x*2360/W)+' мм · y '+Math.round(state.y*1140/H)+' мм · '+Math.round(state.angle*180/Math.PI)+'°';
}
function move(distance){
  const px=distance*W/2360;
  state.x=clamp(state.x+Math.cos(state.angle)*px,17,W-17);
  state.y=clamp(state.y+Math.sin(state.angle)*px,17,H-17);
  if(state.showTrail) state.trail.push([state.x,state.y]);
  if(state.trail.length>700)state.trail.shift();
}
function parse(text){
  const commands=[];
  text.split(/\r?\n/).forEach((raw,index)=>{
    const line=raw.trim();if(!line || line.startsWith('#'))return;
    const match=/^(speed|move|turn|wait|arm|print)\s*\((.*)\)\s*(?:#.*)?$/.exec(line);
    if(!match)throw Error('Строка '+(index+1)+': неизвестная команда');
    const op=match[1],arg=match[2].trim();
    if(op==='print'){commands.push({op,value:arg.replace(/^["']|["']$/g,'')});return}
    const value=Number(arg);
    if(!Number.isFinite(value))throw Error('Строка '+(index+1)+': нужно число');
    if(op==='speed' && (value<20 || value>500))throw Error('Скорость: 20–500 мм/с');
    if(op==='wait' && (value<0 || value>30))throw Error('Пауза: 0–30 с');
    if(op==='move' && Math.abs(value)>3000)throw Error('Движение: до 3000 мм');
    if(op==='turn' && Math.abs(value)>720)throw Error('Поворот: до 720°');
    commands.push({op,value});
  });
  if(commands.length>200)throw Error('Не больше 200 команд');
  return commands;
}
function run(){
  if(state.mode==='match' && state.elapsed>=150){log('Матч окончен. Начните новый матч.');return}
  try{
    state.queue=parse($('editor').value);state.current=null;
    state.robot.velocity=clamp(Number(state.robot.velocity),20,500);
    state.running=true;state.paused=false;log('Запуск: '+state.queue.length+' команд');persist();
  }catch(e){log(e.message)}
}
function step(dt){
  if(!state.running || state.paused)return;
  let budget=dt*state.speed,guard=0;
  while(budget>0 && guard++<20){
    if(!state.current){
      const cmd=state.queue.shift();
      if(!cmd){state.running=false;log('Маршрут завершён');break}
      if(cmd.op==='speed'){state.robot.velocity=cmd.value;continue}
      if(cmd.op==='print'){log(cmd.value);continue}
      if(cmd.op==='arm'){log('Насадка: '+cmd.value+'° (условно)');continue}
      state.current={...cmd,remaining:cmd.op==='move'?Math.abs(cmd.value)/state.robot.velocity:cmd.op==='turn'?Math.abs(cmd.value)*Math.PI/180*state.robot.track/2/state.robot.velocity:cmd.value};
    }
    const c=state.current,t=Math.min(budget,c.remaining),ratio=c.remaining? t/c.remaining:1;
    if(c.op==='move')move(Math.sign(c.value)*state.robot.velocity*t);
    if(c.op==='turn')state.angle+=Math.sign(c.value)*state.robot.velocity*2/state.robot.track*t;
    c.remaining-=t;budget-=t;
    if(c.remaining<=1e-5)state.current=null;
    if(t===0)break;
  }
}
let last=performance.now();
function frame(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(state.mode==='match' && !state.paused && state.elapsed>0 && state.elapsed<150){
    state.elapsed=Math.min(150,state.elapsed+dt);
    if(state.elapsed===150){state.running=false;log('Матч окончен')}
  }
  step(dt);draw();updateScore();requestAnimationFrame(frame);
}
function renderPrograms(){
  const select=$('programs');select.replaceChildren();
  Object.keys(state.programs).forEach(name=>{const opt=document.createElement('option');opt.textContent=name;select.append(opt)});
  if(!state.programs[state.active])state.active=Object.keys(state.programs)[0];
  select.value=state.active;$('editor').value=state.programs[state.active]||'';
}
$('editor').oninput=()=>{state.programs[state.active]=$('editor').value;persist()};
$('editor').onkeydown=e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run()}};
$('programs').onchange=e=>{state.active=e.target.value;renderPrograms();persist()};
$('new').onclick=()=>{const name=prompt('Название программы');if(!name)return;state.programs[name]='';state.active=name;renderPrograms();persist()};
$('rename').onclick=()=>{const name=prompt('Новое название',state.active);if(!name||name===state.active)return;state.programs[name]=state.programs[state.active];delete state.programs[state.active];state.active=name;renderPrograms();persist()};
$('delete').onclick=()=>{if(Object.keys(state.programs).length===1)return;delete state.programs[state.active];state.active=Object.keys(state.programs)[0];renderPrograms();persist()};
$('examples').onchange=e=>{if(!e.target.value)return;$('editor').value=e.target.value==='square'?'speed(180)\nmove(400)\nturn(90)\nmove(300)\nturn(90)\nmove(400)\nturn(90)\nmove(300)':'speed(180)\nmove(260)\nturn(-35)\nmove(150)';$('editor').oninput();e.target.value=''};
$('export').onclick=()=>download('s7-programs.json',JSON.stringify({programs:state.programs,robot:state.robot},null,2));
$('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!data.programs||typeof data.programs!=='object')throw Error();for(const [name,text] of Object.entries(data.programs)){if(typeof name==='string'&&typeof text==='string'&&name.length<80)state.programs[name]=text}renderPrograms();persist();log('Программы импортированы')}catch{log('Ошибка: нужен JSON экспорта программ')}e.target.value=''};
function download(name,content){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type:'application/json'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('run').onclick=run;$('stop').onclick=()=>{state.running=false;state.queue=[];state.current=null;log('Остановлено')};
$('interrupt').onclick=()=>{state.running=false;state.queue=[];state.current=null;if(state.mode==='match'&&state.x>167&&state.x<W-167)state.tokens=Math.max(0,state.tokens-1);$('tokens').value=state.tokens;persist();log('Прерывание: проверьте правило о жетонах')};
$('mode').onchange=e=>{state.mode=e.target.value;state.elapsed=0;state.running=false;updateScore()};
$('start').onclick=()=>{state.mode='match';$('mode').value='match';state.elapsed=.001;state.paused=false;log('Матч начат: 2:30')};
$('reset').onclick=()=>{state.elapsed=0;state.running=false;state.paused=false;state.tokens=6;state.results={};state.inspection=false;$('inspection').checked=false;$('tokens').value=6;home();renderMissions();persist();log('Новый матч')};
$('home').onclick=home;$('side').onchange=e=>{state.side=e.target.value;home()};
$('speed').onchange=e=>state.speed=Number(e.target.value);
$('pause').onclick=()=>{state.paused=!state.paused;$('pause').textContent=state.paused?'Продолжить':'Пауза'};
$('trail').onclick=()=>{state.showTrail=!state.showTrail;$('trail').textContent='След: '+(state.showTrail?'вкл.':'выкл.')};
$('inspection').checked=state.inspection;$('inspection').onchange=e=>{state.inspection=e.target.checked;persist();updateScore()};
$('tokens').value=state.tokens;$('tokens').onchange=e=>{state.tokens=Number(e.target.value);persist();updateScore()};
$('clear-score').onclick=()=>{state.results={};state.inspection=false;state.tokens=6;$('inspection').checked=false;$('tokens').value=6;renderMissions();persist()};
$('result').onclick=()=>download('bioglow-result.json',JSON.stringify({score:updateScore(),inspection:state.inspection,tokens:state.tokens,missions:missions.map((m,i)=>({id:'M'+String(i+1).padStart(2,'0'),name:m.name,score:scoreMission(i),state:state.results[i]||{}})),robot:state.robot},null,2));
$('config').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target);for(const k of ['width','length','wheel','track','velocity'])state.robot[k]=Number(data.get(k));state.robot.attachment=data.get('attachment');$('config-status').textContent='Конфигурация сохранена';preview();persist()};
function preview(){$('robot-preview').innerHTML='<div>'+Math.round(state.robot.width)+' × '+Math.round(state.robot.length)+' мм</div>'}
for(const [k,v] of Object.entries(state.robot)){const field=$('config').elements.namedItem(k);if(field)field.value=v}
for(const btn of document.querySelectorAll('[data-tab]'))btn.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===btn.dataset.tab))};
const keys=new Set();
window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;const k=e.key.toLowerCase();if('wasd'.includes(k)||e.key.startsWith('Arrow')){keys.add(k);e.preventDefault()}if(k==='e')nearest()});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
function nearest(){let best=-1,dist=65;missions.forEach((m,i)=>{const d=Math.hypot(m.x-state.x,m.y-state.y);if(d<dist){dist=d;best=i}});if(best>=0)openMission(best);else log('Подъедьте ближе к номеру миссии') }
$('interact').onclick=nearest;
let manualLast=performance.now();
function manual(now){const dt=Math.min((now-manualLast)/1000,.05);manualLast=now;if(!state.running&&!state.paused){const f=keys.has('w')||keys.has('arrowup'),b=keys.has('s')||keys.has('arrowdown'),l=keys.has('a')||keys.has('arrowleft'),r=keys.has('d')||keys.has('arrowright');if(l||r)state.angle+=((r?1:0)-(l?1:0))*2*state.robot.velocity/state.robot.track*dt;if(f||b)move(((f?1:0)-(b?1:0))*state.robot.velocity*dt)}requestAnimationFrame(manual)}
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=()=>keys.add(b.dataset.key);b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key)});
canvas.onpointerdown=e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;let hit=missions.findIndex(m=>Math.hypot(x-m.x,y-m.y)<30);if(hit>=0){openMission(hit);return}if(Math.hypot(x-state.x,y-state.y)<45){state.dragging=true;canvas.setPointerCapture(e.pointerId)}};
canvas.onpointermove=e=>{if(!state.dragging)return;const r=canvas.getBoundingClientRect();state.x=clamp((e.clientX-r.left)*W/r.width,15,W-15);state.y=clamp((e.clientY-r.top)*H/r.height,15,H-15)};
canvas.onpointerup=()=>state.dragging=false;
home();preview();renderPrograms();renderMissions();log('Готово. Выберите пример или напишите маршрут.');requestAnimationFrame(frame);requestAnimationFrame(manual);
