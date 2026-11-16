export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function createGame(home,away,difficulty='Varsity',quarterLength=90){
 const g={home,away,difficulty,quarterLength,quarter:1,clock:quarterLength,playClock:25,score:[0,0],offense:0,ball:25,down:1,target:35,phase:'ready',message:'Choose a play, then snap',players:[],carrier:0,t:0,driveStart:25,play:'inside',defense:'zone',flight:null,ended:false,event:0};formation(g);return g;
}
export function formation(g){
 g.players=[];
 for(let team=0;team<2;team++)for(let i=0;i<11;i++){
 let offense=team===g.offense,x,y;
 if(offense){x=g.ball+(i===0?-4:i===1?-7:i<7?-1:0);y=i===0?0:i===1?2:i<7?(i-4)*2:(i-8.5)*10;}
 else{x=g.ball+(i<4?2:i<7?7:14);y=i<4?(i-1.5)*3:i<7?(i-5)*8:(i-8.5)*11;}
 g.players.push({id:team*11+i,team,role:i,x,y,vx:0,vy:0,skin:i%4,anim:0});
 }
 g.carrier=g.offense*11;g.control=[0,11];g.control[g.offense]=g.carrier;g.control[1-g.offense]=(1-g.offense)*11+5;g.flight=null;g.t=0;
}
export function snap(g){if(g.phase!=='ready'||g.ended)return;if(Math.random()<.025){g.ball=Math.max(1,g.ball-5);g.message='FLAG • False start • 5 yards • Replay down';g.event++;formation(g);return;}g.phase='live';g.t=0;g.driveStart=g.ball;g.message=g.play==='pass'?'Receivers: 1 / 2 / 3 / 4':'Find the running lane';if(g.play==='inside'||g.play==='sweep'){g.carrier=g.offense*11+1;g.control[g.offense]=g.carrier;}g.event++;}
function nextDrive(g,spot){g.offense=1-g.offense;g.ball=clamp(100-spot,1,99);g.down=1;g.target=Math.min(100,g.ball+10);}
function clockEnd(g){if(g.clock>0)return;if(g.quarter<4){g.quarter++;g.clock=g.quarterLength;}else if(g.score[0]!==g.score[1]){g.ended=true;g.phase='final';g.message='FINAL';}else{g.quarter++;g.clock=60;g.message='Overtime • next scoring lead at period end';}}
export function finish(g,reason='Tackled',spot=null){
 if(g.phase!=='live')return;
 let p=g.players.find(p=>p.id===g.carrier);let x=spot??p?.x??g.ball;if(reason==='Tackled'&&Math.random()<.025){g.ball=Math.max(1,g.driveStart-10);g.message='FLAG • Offensive holding • 10 yards • Replay down';g.phase='ready';g.playClock=25;g.event++;clockEnd(g);if(!g.ended)formation(g);return;}
 if(x>=100){g.score[g.offense]+=7;g.message='TOUCHDOWN • automatic PAT good';nextDrive(g,75);}
 else if(x<=0){g.score[1-g.offense]+=2;g.message='SAFETY';nextDrive(g,65);}
 else {g.ball=clamp(x,1,99);g.message=reason;if(reason==='Incomplete pass')g.ball=g.driveStart;
 if(g.ball>=g.target){g.down=1;g.target=Math.min(100,g.ball+10);g.message+=' • First down';}else if(++g.down>4){nextDrive(g,g.ball);g.message+=' • Turnover on downs';}}
 g.phase='ready';g.playClock=25;g.event++;clockEnd(g);if(!g.ended)formation(g);
}
export function kick(g,type){if(g.phase!=='ready')return;g.phase='live';g.driveStart=g.ball;
 if(type==='punt'){g.message='Punt';nextDrive(g,Math.min(80,g.ball+40));}
 else {let distance=117-g.ball;let made=Math.random()<clamp(.98-(distance-25)*.022,.08,.98);if(made){g.score[g.offense]+=3;g.message='FIELD GOAL GOOD';nextDrive(g,75);}else{g.message='Field goal missed';nextDrive(g,g.ball);}}
 g.phase='ready';g.clock=Math.max(0,g.clock-6);g.playClock=25;g.event++;clockEnd(g);if(!g.ended)formation(g);
}
export function pass(g,index){if(g.phase!=='live'||g.flight||g.carrier!==g.offense*11)return;const r=g.players[g.offense*11+7+index%4],q=g.players[g.carrier];g.flight={x:q.x,y:q.y,z:2,t:0,duration:Math.max(.4,Math.hypot(r.x-q.x,r.y-q.y)/28),target:r.id,startX:q.x,startY:q.y};g.carrier=-1;g.event++;}
export function step(g,dt,inputs=[{},{}],humans=[true,false]){
 if(g.ended)return;dt=Math.min(.05,dt);
 if(g.phase==='ready'){g.playClock-=dt;if(g.playClock<=0){g.ball=Math.max(1,g.ball-5);g.target=Math.max(g.ball+1,g.target);g.message='FLAG • Delay of game • 5 yards';g.playClock=25;g.event++;formation(g);}return;}
 g.clock=Math.max(0,g.clock-dt);g.t+=dt;
 const off=g.offense,def=1-off,carrier=g.players.find(p=>p.id===g.carrier),factor={Freshman:.78,Varsity:1,Heisman:1.18}[g.difficulty]||1;
 for(const p of g.players){
 let dx=0,dy=0,input=inputs[p.team]||{},controlled=humans[p.team]&&g.control[p.team]===p.id;
 if(controlled){dx=clamp(Number(input.x)||0,-1,1);dy=clamp(Number(input.y)||0,-1,1);}
 else if(p.team===off){if(p.id===g.carrier){dx=1;dy=g.play==='sweep'&&g.t<2?.65:Math.sin(g.t*2+p.id)*.13;}else if(p.role>=7){dx=g.t<3?1:.35;dy=g.play==='slants'?(p.role%2?.45:-.45):Math.sin(p.role)*.13;}else{dx=.4;dy=0;}}
 else {let target=carrier||g.players[off*11];let tx=target.x,ty=target.y;if(g.t<1.4&&p.role>6&&g.defense==='zone'){tx=g.ball+12;ty=(p.role-8.5)*10;}let d=Math.hypot(tx-p.x,ty-p.y)||1;dx=(tx-p.x)/d;dy=(ty-p.y)/d;}
 let norm=Math.max(1,Math.hypot(dx,dy));let strength=(p.team===0?g.home:g.away)?.stars||3;
 let speed=(p.team===off?7.8:7.15*factor)+(strength-3)*.14;if(controlled&&input.sprint)speed*=1.2;
 if(p.role<7&&p.role>1&&p.team===off)speed*=.55;
 if(p.team===def&&g.t<1.2&&p.role<4)speed*=g.defense==='blitz'?.85:.38;
 p.vx=dx/norm*speed;p.vy=dy/norm*speed;p.x+=p.vx*dt;p.y=clamp(p.y+p.vy*dt,-27,27);p.anim+=Math.hypot(p.vx,p.vy)*dt;
 }
 if(g.flight){let f=g.flight,r=g.players[f.target];f.t+=dt;let u=Math.min(1,f.t/f.duration);f.x=f.startX+(r.x-f.startX)*u;f.y=f.startY+(r.y-f.startY)*u;f.z=2+Math.sin(u*Math.PI)*9;
 if(u>=1){let nearest=g.players.filter(p=>p.team===def).sort((a,b)=>Math.hypot(a.x-r.x,a.y-r.y)-Math.hypot(b.x-r.x,b.y-r.y))[0];if(Math.hypot(nearest.x-r.x,nearest.y-r.y)<1.3){g.flight=null;finish(g,'Pass broken up',g.driveStart);return;}g.carrier=r.id;g.control[off]=r.id;g.flight=null;g.message='COMPLETE';g.event++;}}
 else if(carrier){if(carrier.x>=100||carrier.x<=0||Math.abs(carrier.y)>=26.5){finish(g,Math.abs(carrier.y)>=26.5?'Out of bounds':'Score');return;}
 if(g.t>1&&g.players.some(p=>p.team===def&&Math.hypot(p.x-carrier.x,p.y-carrier.y)<1.2)){finish(g);return;}}
 if(!humans[off]&&g.play==='pass'&&g.t>1.5&&g.carrier===off*11)pass(g,Math.floor(Math.random()*4));
 if(g.t>14)finish(g,'Whistle');
}
export function command(g,team,action,value){
 if(action==='play'&&g.phase==='ready'){if(team===g.offense)g.play=['inside','sweep','pass','slants'].includes(value)?value:'inside';else g.defense=value==='blitz'?'blitz':'zone';}
 if(action==='snap'&&team===g.offense)snap(g);
 if(action==='pass'&&team===g.offense)pass(g,Number(value)||0);
 if(action==='kick'&&team===g.offense)kick(g,value);
 if(action==='switch'){const c=g.players.find(p=>p.id===g.carrier);if(c&&team!==g.offense){let ps=g.players.filter(p=>p.team===team).sort((a,b)=>Math.hypot(a.x-c.x,a.y-c.y)-Math.hypot(b.x-c.x,b.y-c.y));g.control[team]=ps[0].id;}}
}
