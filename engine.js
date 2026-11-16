export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const PLAYS=['Inside zone','Four verticals','Crossing mesh'];
const roles=['QB','RB','WR','WR','WR','TE','OL','OL','OL','OL','OL'];
export function createGame(home,away,opts={}){
 const g={teams:[home,away],scores:[0,0],quarter:1,clock:opts.quarterLength||90,length:opts.quarterLength||90,pos:0,spot:25,down:1,target:35,phase:'ready',play:0,playClock:25,elapsed:0,phaseTime:0,players:[],ball:null,carrier:0,controlled:[0,17],message:'FIRST & TEN',event:0,stats:[{yards:0,td:0,tackles:0,passes:0,completions:0},{yards:0,td:0,tackles:0,passes:0,completions:0}],difficulty:opts.difficulty||'Varsity',ratings:opts.ratings||[75,75],boost:opts.boost||0,rtg:opts.rtg||null,seed:opts.seed||314159,ot:false,otTurns:0,playStart:25,penalty:false,stadium:opts.stadium||0};
 formation(g);return g;
}
function rand(g){g.seed=(Math.imul(1664525,g.seed)+1013904223)>>>0;return g.seed/4294967296;}
function announce(g,text){g.message=text;g.event++;}
export function formation(g){
 g.players=[];g.phase='ready';g.phaseTime=0;g.playClock=25;g.ball=null;g.penalty=false;g.playStart=g.spot;
 const ox=[0,-3,-21,20,-12,12,-6,-3,0,3,6],oy=[-5,-8,0,0,0,-1,0,0,0,0,0];
 const dx=[-7,0,7,-14,0,14,-21,21,-10,10,0],dy=[2,2,2,6,6,6,4,4,15,15,22];
 for(let i=0;i<22;i++){
  const offense=i<11,j=i%11;
  g.players.push({id:i,team:offense?g.pos:1-g.pos,role:offense?roles[j]:(j<3?'DL':j<6?'LB':'DB'),x:offense?ox[j]:dx[j],y:g.spot+(offense?oy[j]:dy[j]),homeX:offense?ox[j]:dx[j],vx:0,vy:0,stun:0});
 }
 g.carrier=g.play===0?1:0;
 g.controlled[g.pos]=g.rtg&&g.pos===0?({QB:0,RB:1,WR:2,LB:0}[g.rtg]??0):g.carrier;
 g.controlled[1-g.pos]=15;
}
export function selectPlay(g,n){if(g.phase==='ready')g.play=clamp(n|0,0,2);}
export function snap(g){
 if(g.phase!=='ready')return;
 if(rand(g)<.025){g.spot=Math.max(1,g.spot-5);formation(g);announce(g,'FALSE START · Offense · 5 yards');return;}
 g.phase='live';g.phaseTime=0;g.playStart=g.spot;g.carrier=g.play===0?1:0;
 if(!g.rtg||g.pos!==0)g.controlled[g.pos]=g.carrier;
 announce(g,PLAYS[g.play].toUpperCase());
}
function newPossession(g,spot){g.pos=1-g.pos;g.spot=clamp(spot,1,99);g.down=1;g.target=Math.min(100,g.spot+10);formation(g);}
function finish(g,text){g.phase='dead';g.phaseTime=0;announce(g,text);}
function endOTPossession(g){g.otTurns++;if(g.otTurns%2===0&&g.scores[0]!==g.scores[1]){g.phase='final';announce(g,'FINAL · OVERTIME');return true;}newPossession(g,75);return true;}
function score(g,points,text){g.scores[g.pos]+=points;if(points===7)g.stats[g.pos].td++;g.next='kickoff';finish(g,text);}
export function kick(g,type){
 if(g.phase!=='ready')return;
 if(type==='punt'){
  if(g.ot){g.next='turnover';finish(g,'POSSESSION ENDED');return;}
  g.returnSpot=clamp(100-g.spot-35-rand(g)*15,10,90);g.next='punt';finish(g,'PUNT · Possession changes');
 }else{
  const distance=117-g.spot,prob=clamp(1.45-distance*.019,.03,.98);
  if(rand(g)<prob)score(g,3,Math.round(distance)+' YARD FIELD GOAL · GOOD');
  else{g.next='miss';finish(g,'FIELD GOAL · NO GOOD');}
 }
}
export function throwPass(g,index){
 if(g.phase!=='live'||g.ball||g.carrier!==0||g.play===0)return;
 const target=g.players[[2,3,4][clamp(index|0,0,2)]],qb=g.players[0];
 g.stats[g.pos].passes++;
 g.ball={x:qb.x,y:qb.y,sx:qb.x,sy:qb.y,tx:clamp(target.x+target.vx*.65,-25,25),ty:clamp(target.y+target.vy*.65,0,105),t:0,duration:.65,receiver:target.id};g.carrier=-1;
}
export function switchPlayer(g,team){
 if(g.phase!=='live')return;
 const target=g.ball||g.players[g.carrier]||{x:0,y:g.spot};
 const candidates=g.players.filter(p=>p.team===team).sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y));
 g.controlled[team]=candidates.find(p=>p.id!==g.controlled[team])?.id??candidates[0].id;
}
function deadAdvance(g){
 if(g.next==='kickoff'){g.next=null;if(g.ot){endOTPossession(g);return;}newPossession(g,25);}
 else if(g.next==='punt'){g.next=null;newPossession(g,g.returnSpot);}
 else if(g.next==='miss'||g.next==='turnover'){g.next=null;if(g.ot){endOTPossession(g);return;}newPossession(g,100-g.spot);}
 else formation(g);
}
function tackle(g,carrier,defender){
 const end=clamp(carrier.y,0,100),gain=end-g.playStart;
 g.stats[g.pos].yards+=Math.round(gain);g.stats[1-g.pos].tackles++;
 if(g.penalty){g.spot=Math.max(1,g.playStart-10);finish(g,'HOLDING · Offense · 10 yards · Replay down');return;}
 if(end<=0){g.scores[1-g.pos]+=2;g.next='turnover';g.spot=75;finish(g,'SAFETY · TWO POINTS');return;}
 g.spot=end;
 if(end>=g.target){g.down=1;g.target=Math.min(100,end+10);finish(g,'FIRST DOWN · '+Math.round(gain)+' YARDS');}
 else{g.down++;if(g.down>4){g.next='turnover';finish(g,'TURNOVER ON DOWNS');}else finish(g,Math.round(gain)+' YARDS · '+['','1ST','2ND','3RD','4TH'][g.down]+' DOWN');}
}
export function update(g,dt,inputs=[{},{}],human=[true,false]){
 if(g.phase==='final')return;dt=Math.min(dt,.05);g.elapsed+=dt;g.phaseTime+=dt;
 if(g.phase==='dead'){
  if(g.phaseTime>2.3){deadAdvance(g);if(g.phase==='final')return;
   if(g.clock<=0&&!g.ot){
    if(g.quarter<4){g.quarter++;g.clock=g.length;if(g.quarter===3){g.pos=0;newPossession(g,25);}announce(g,g.quarter===3?'SECOND HALF':'QUARTER '+g.quarter);}
    else if(g.scores[0]===g.scores[1]){g.ot=true;g.quarter=5;g.clock=0;g.pos=0;g.spot=75;g.down=1;g.target=85;formation(g);announce(g,'OVERTIME · Alternating possessions');}
    else{g.phase='final';announce(g,'FINAL');}
   }
  }return;
 }
 if(g.phase==='ready'){
  g.playClock-=dt;
  if(!human[g.pos]&&g.phaseTime>2){g.play=rand(g)<.4?0:rand(g)<.5?1:2;if(g.down===4){kick(g,g.spot>55?'fg':'punt');return;}snap(g);}
  if(g.playClock<=0){g.spot=Math.max(1,g.spot-5);formation(g);announce(g,'DELAY OF GAME · 5 yards');}return;
 }
 if(!g.ot)g.clock=Math.max(0,g.clock-dt);
 const offense=g.pos,diff={Freshman:.8,Varsity:1,Heisman:1.18}[g.difficulty]||1;
 if(!human[offense]&&g.carrier===0&&!g.ball&&g.phaseTime>1.4+rand(g)*.7)throwPass(g,Math.floor(rand(g)*3));
 if(g.rtg&&g.pos===0&&g.rtg!=='QB'&&g.carrier===0&&!g.ball&&g.phaseTime>1.65)throwPass(g,g.rtg==='WR'?0:1);
 for(const p of g.players){
  const input=inputs[p.team]||{},isControlled=human[p.team]&&g.controlled[p.team]===p.id;
  let vx=0,vy=0;
  if(p.stun>0){p.stun-=dt;continue;}
  const carrier=g.players[g.carrier],target=g.ball||carrier||{x:0,y:g.spot+10};
  if(isControlled&&(input.x||input.y)){vx=input.x;vy=input.y;}
  else if(p.team===offense){
   if(p.id===g.carrier){
    if(p.id===0&&g.play!==0&&g.phaseTime<4){vx=Math.sin(g.phaseTime)*.15;vy=g.phaseTime<.6?-.4:.03;}
    else{vy=1;const nearest=g.players.filter(d=>d.team!==offense&&d.y>p.y&&d.y-p.y<9).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];vx=nearest?(p.x>nearest.x?.45:-.45):-.015*p.x;}
   }else if(p.id>=6||p.id===5){
    const d=g.players.filter(d=>d.team!==offense).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];vx=(d.x-p.x)*.7;vy=(d.y-p.y)*.6;
    if(Math.hypot(d.x-p.x,d.y-p.y)<1.6)d.stun=.12;
   }else{vy=g.play===0?.65:1;vx=g.play===2?(p.homeX<0?.38:-.38):p.homeX*.002;if(p.y>99)vy=-.2;}
  }else{
   if(g.ball||g.carrier!==0||g.phaseTime>1.9||p.id<14){vx=target.x-p.x;vy=target.y-p.y;}
   else{const receiver=g.players[2+(p.id%3)];vx=receiver.x-p.x;vy=receiver.y+2-p.y;}
  }
  let len=Math.hypot(vx,vy);if(len>1){vx/=len;vy/=len;}
  let speed=(p.role==='OL'||p.role==='DL'?4.8:7.3)+(g.ratings[p.team]-75)*.025;
  if(!human[p.team])speed*=p.team===1?diff:1;
  if(isControlled&&input.sprint)speed*=1.18;
  if(isControlled)speed+=g.boost*.025;
  if(p.id===0&&g.carrier===0&&g.play!==0)speed*=.8;
  p.vx=vx*speed;p.vy=vy*speed;p.x=clamp(p.x+p.vx*dt,-27.5,27.5);p.y=clamp(p.y+p.vy*dt,-8,108);
  if(isControlled&&input.juke&&g.carrier===p.id&&g.elapsed-(g.lastJuke||-10)>2){g.lastJuke=g.elapsed;for(const d of g.players)if(d.team!==p.team&&Math.hypot(p.x-d.x,p.y-d.y)<3)d.stun=.55;}
 }
 if(g.ball){
  const b=g.ball;b.t+=dt;const t=clamp(b.t/b.duration,0,1);b.x=b.sx+(b.tx-b.sx)*t;b.y=b.sy+(b.ty-b.sy)*t;
  if(t>=1){
   const near=g.players.filter(p=>p.team!==offense).find(p=>Math.hypot(p.x-b.x,p.y-b.y)<1.7);
   const receiver=g.players[b.receiver],distance=Math.hypot(receiver.x-b.x,receiver.y-b.y);
   if(near&&rand(g)<.32){g.spot=clamp(b.y,1,99);g.next='turnover';g.ball=null;finish(g,'INTERCEPTED · Possession changes');return;}
   if(distance<6&&rand(g)>.12){g.carrier=b.receiver;receiver.x=b.x;receiver.y=b.y;g.stats[offense].completions++;if(!g.rtg||g.pos!==0)g.controlled[offense]=g.carrier;g.ball=null;announce(g,'COMPLETE');}
   else{g.ball=null;g.down++;if(g.down>4)g.next='turnover';finish(g,g.down>4?'INCOMPLETE · Turnover on downs':'INCOMPLETE');return;}
  }
 }
 const c=g.players[g.carrier];
 if(c&&!g.ball){
  if(c.y>=100){g.stats[g.pos].yards+=Math.round(100-g.playStart);score(g,7,'TOUCHDOWN · Extra point good');return;}
  if(Math.abs(c.x)>26.6){tackle(g,c,null);return;}
  if(g.phaseTime>.65){const d=g.players.find(d=>d.team!==offense&&d.stun<=0&&Math.hypot(c.x-d.x,c.y-d.y)<1.25);if(d){tackle(g,c,d);return;}}
 }
 if(!g.penalty&&g.phaseTime>1&&rand(g)<dt*.0015)g.penalty=true;
 if(g.phaseTime>16){if(c)tackle(g,c,null);else finish(g,'PLAY DEAD');}
}
