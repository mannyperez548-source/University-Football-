import * as THREE from '/vendor/three.module.js';
import {TEAMS} from '/shared/teams.js';
const temp=new THREE.Object3D();
function mat(color,roughness=.65,metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness});}
export class StadiumView{
 constructor(canvas){
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#151e38');this.scene.fog=new THREE.FogExp2('#273650',.0025);
  this.camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,600);this.camera.position.set(65,55,80);
  this.scene.add(new THREE.HemisphereLight('#b9d9ff','#3b4a2b',2));
  this.sun=new THREE.DirectionalLight('#ffe0b5',3.3);this.sun.position.set(-60,90,30);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-75,right:75,top:75,bottom:-75,near:1,far:250});this.sun.shadow.bias=-.0007;this.scene.add(this.sun);this.scene.add(this.sun.target);
  this.scene.add(new THREE.AmbientLight('#8295cd',.5));
  const sky=new THREE.Mesh(new THREE.SphereGeometry(450,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:{},vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v;void main(){float h=normalize(v).y;vec3 c=mix(vec3(.85,.32,.19),vec3(.045,.075,.17),smoothstep(-.04,.65,h));gl_FragColor=vec4(c,1.);}'}));this.scene.add(sky);
  this.buildField();this.buildStands();this.buildLights();this.buildProps();this.athletes=[];this.lastTeamKey='';
  this.ball=new THREE.Mesh(new THREE.SphereGeometry(.26,14,10),mat('#8c4222'));this.ball.scale.set(.68,.65,1.2);this.ball.castShadow=true;this.scene.add(this.ball);
  const lace=new THREE.Mesh(new THREE.BoxGeometry(.045,.03,.25),mat('#fff4df'));lace.position.set(0,.16,0);this.ball.add(lace);
  this.ring=new THREE.Mesh(new THREE.RingGeometry(.8,1.05,48),new THREE.MeshBasicMaterial({color:'#58f3dc',side:THREE.DoubleSide,transparent:true,opacity:.95}));this.ring.rotation.x=-Math.PI/2;this.ring.position.y=.04;this.scene.add(this.ring);
  this.los=this.line('#48c9ff');this.first=this.line('#ffd76a');this.clock=0;this.cameraMode='broadcast';this.lastScore='';this.stadium=0;
  window.addEventListener('resize',()=>this.resize());this.resize();
 }
 resize(){this.renderer.setSize(innerWidth,innerHeight);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();}
 line(color){const l=new THREE.Mesh(new THREE.PlaneGeometry(53.3,.13),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8,depthWrite:false}));l.rotation.x=-Math.PI/2;l.position.y=.035;this.scene.add(l);return l;}
 buildField(){
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=3072;const c=canvas.getContext('2d');
  c.fillStyle='#20633e';c.fillRect(0,0,1536,3072);
  for(let i=0;i<24;i++){c.fillStyle=i%2?'#236a42':'#1d603a';c.fillRect(85,i*128,1366,128);}
  let seed=17;for(let i=0;i<140000;i++){seed=(seed*16807)%2147483647;const x=seed%1536;seed=(seed*16807)%2147483647;const y=seed%3072;c.fillStyle=i%2?'#ffffff0a':'#00000016';c.fillRect(x,y,1.4,3);}
  c.fillStyle='#14233c';c.fillRect(85,0,1366,256);c.fillRect(85,2816,1366,256);
  c.strokeStyle='#f4f3de';c.lineWidth=5;c.strokeRect(85,256,1366,2560);
  for(let y=0;y<=100;y++){
   const py=2816-y*25.6;
   if(y%5===0){c.lineWidth=y%10===0?4:2;c.beginPath();c.moveTo(85,py);c.lineTo(1451,py);c.stroke();}
   else{for(const x of [85,650,886,1451])c.fillRect(x-7,py,14,3);}
   if(y%10===0&&y>0&&y<100){const n=String(y<=50?y:100-y);c.font='bold 86px Arial';c.fillStyle='#f5f1da';c.textAlign='center';c.save();c.translate(290,py);c.rotate(Math.PI/2);c.fillText(n,0,30);c.restore();c.save();c.translate(1246,py);c.rotate(-Math.PI/2);c.fillText(n,0,30);c.restore();}
  }
  c.fillStyle='#f1dba0';c.textAlign='center';c.font='900 104px Arial';c.fillText('COLLEGE GRIDIRON',768,168);c.save();c.translate(768,2940);c.rotate(Math.PI);c.fillText('SATURDAY LIGHTS',0,35);c.restore();
  c.save();c.translate(768,1536);c.rotate(-Math.PI/2);c.fillStyle='#e8d4a860';c.font='900 220px Arial';c.fillText('CG',0,70);c.restore();
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=this.renderer.capabilities.getMaxAnisotropy();
  const field=new THREE.Mesh(new THREE.PlaneGeometry(60,120),new THREE.MeshStandardMaterial({map:tex,roughness:1}));field.rotation.x=-Math.PI/2;field.receiveShadow=true;this.scene.add(field);
  const base=new THREE.Mesh(new THREE.PlaneGeometry(400,400),mat('#202c32'));base.rotation.x=-Math.PI/2;base.position.y=-.08;this.scene.add(base);
  for(const end of [-1,1]){
   const postMat=mat('#ffcc3b',.3,.6);const group=new THREE.Group();group.position.set(0,0,end*60);
   const cyl=(radius,len,x,y,z,rot=0)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,len,10),postMat);m.position.set(x,y,z);m.rotation.z=rot;group.add(m);};
   cyl(.15,4,0,2,0);cyl(.12,6.2,0,4,0,Math.PI/2);cyl(.11,5,-3.1,6.5,0);cyl(.11,5,3.1,6.5,0);this.scene.add(group);
  }
  for(let y=-50;y<=50;y+=10)for(const x of [-28,28]){const marker=new THREE.Mesh(new THREE.BoxGeometry(.7,.8,.2),mat('#ff651b'));marker.position.set(x,.4,y);this.scene.add(marker);}
 }
 buildStands(){
  const concrete=mat('#333e53'),seat=mat('#54687d');this.standMaterial=seat;
  for(let tier=0;tier<3;tier++){
   const count=80;const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),concrete,count);
   for(let i=0;i<count;i++){const a=i/count*Math.PI*2,r=1+tier*.17;temp.position.set(Math.cos(a)*48*r,5+tier*8,Math.sin(a)*81*r);temp.rotation.set(0,-a,0);temp.scale.set(12,8+tier*1.5,8);temp.updateMatrix();mesh.setMatrixAt(i,temp.matrix);}mesh.receiveShadow=true;this.scene.add(mesh);
  }
  const n=6600,crowd=new THREE.InstancedMesh(new THREE.BoxGeometry(.52,.9,.45),seat,n);const color=new THREE.Color();
  for(let i=0;i<n;i++){
   const row=i%22,col=Math.floor(i/22),a=col/300*Math.PI*2;
   temp.position.set(Math.cos(a)*(45+row*.85),2.5+row*.95,Math.sin(a)*(77+row*.95));temp.rotation.set(0,-a,0);temp.scale.set(1,1+(i%5)*.06,1);temp.updateMatrix();crowd.setMatrixAt(i,temp.matrix);color.set(['#f7e7c1','#50607b','#c79755','#253148','#a7433b','#e0d2b2','#267274'][i%7]);crowd.setColorAt(i,color);
  }this.scene.add(crowd);
  this.ribbonMat=new THREE.MeshBasicMaterial({color:'#43c7bc'});
  for(const side of [-1,1]){const ribbon=new THREE.Mesh(new THREE.BoxGeometry(.5,1.2,128),this.ribbonMat);ribbon.position.set(side*49,10,0);this.scene.add(ribbon);}
 }
 buildLights(){
  for(const x of [-1,1])for(const z of [-1,1]){
   const pole=new THREE.Mesh(new THREE.CylinderGeometry(.28,.5,35,8),mat('#6e7b85',.4,.5));pole.position.set(x*48,17,z*65);this.scene.add(pole);
   const panel=new THREE.Mesh(new THREE.BoxGeometry(9,3,.8),mat('#c8ced0'));panel.position.set(x*48,35,z*65);panel.lookAt(0,15,0);this.scene.add(panel);
   for(let i=0;i<12;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.35,6,4),new THREE.MeshBasicMaterial({color:'#fff2d5'}));l.position.set((i%6-2.5)*1.3,Math.floor(i/6)*1.1-.5,.5);panel.add(l);}
   const light=new THREE.SpotLight('#d8eaff',4500,170,.65,.7,1.7);light.position.set(x*48,34,z*65);light.target.position.set(x*5,0,z*15);this.scene.add(light,light.target);
  }
 }
 buildProps(){
  this.scoreCanvas=document.createElement('canvas');this.scoreCanvas.width=1024;this.scoreCanvas.height=512;this.scoreTex=new THREE.CanvasTexture(this.scoreCanvas);this.scoreTex.colorSpace=THREE.SRGBColorSpace;
  const board=new THREE.Mesh(new THREE.BoxGeometry(29,15,1.2),mat('#101823'));board.position.set(0,25,-92);this.scene.add(board);
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(27,13),new THREE.MeshBasicMaterial({map:this.scoreTex}));screen.position.set(0,25,-91.3);this.scene.add(screen);
  for(const x of [-10,10]){const p=new THREE.Mesh(new THREE.BoxGeometry(1,24,1),mat('#404a55'));p.position.set(x,12,-92);this.scene.add(p);}
  for(const side of [-1,1])for(let i=0;i<14;i++){
   const body=new THREE.Mesh(new THREE.CapsuleGeometry(.26,.8,3,5),mat(i%2?'#cc804e':'#dde0d9'));body.position.set(side*(30+i%2),.9,-30+i*4.5);this.scene.add(body);
  }
 }
 makeAthlete(team,index,custom){
  const g=new THREE.Group(),bodyMat=mat(team.primary,.45),helmetMat=mat(team.primary,.22,.3),pantsMat=mat(team.secondary,.65),skin=mat(custom?.skin||'#a86942');
  const mesh=(geo,material,x,y,z)=>{const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;};
  mesh(new THREE.CapsuleGeometry(.36,.6,4,8),bodyMat,0,1.05,0);
  mesh(new THREE.BoxGeometry(.92,.23,.47),bodyMat,0,1.43,0);
  mesh(new THREE.SphereGeometry(.31,12,10),skin,0,1.81,0);
  const helmet=mesh(new THREE.SphereGeometry(.35,14,12,0,Math.PI*2,0,Math.PI*.74),helmetMat,0,1.86,0);helmet.rotation.x=-.18;
  const stripe=mesh(new THREE.BoxGeometry(.065,.035,.57),pantsMat,0,2.19,0);
  const mask=new THREE.Mesh(new THREE.TorusGeometry(.24,.024,5,10,Math.PI),mat('#aeb6bf',.25,.7));mask.position.set(0,1.76,-.28);mask.rotation.z=Math.PI;g.add(mask);
  const limbs=[];
  for(const side of [-1,1]){
   const arm=new THREE.Group();arm.position.set(side*.47,1.41,0);g.add(arm);const a=new THREE.Mesh(new THREE.CapsuleGeometry(.115,.48,3,6),skin);a.position.y=-.32;a.castShadow=true;arm.add(a);limbs.push(arm);
   const leg=new THREE.Group();leg.position.set(side*.19,.78,0);g.add(leg);const l=new THREE.Mesh(new THREE.CapsuleGeometry(.15,.47,3,6),pantsMat);l.position.y=-.3;l.castShadow=true;leg.add(l);const shoe=new THREE.Mesh(new THREE.BoxGeometry(.22,.13,.4),mat('#eff3f2'));shoe.position.set(0,-.68,-.07);leg.add(shoe);limbs.push(leg);
  }
  const c=document.createElement('canvas');c.width=128;c.height=128;const cx=c.getContext('2d');cx.fillStyle=team.primary;cx.fillRect(0,0,128,128);cx.fillStyle='#fffef4';cx.font='bold 88px Arial';cx.textAlign='center';cx.fillText(String(index<11?[7,22,1,11,3,88,71,64,55,66,77][index]:index+10),64,100);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
  const number=new THREE.Mesh(new THREE.PlaneGeometry(.46,.44),new THREE.MeshBasicMaterial({map:tx}));number.position.set(0,1.17,.36);g.add(number);const front=number.clone();front.rotation.y=Math.PI;front.position.z=-.36;g.add(front);
  if(custom?.hair==='Long'){for(let i=0;i<5;i++)mesh(new THREE.CapsuleGeometry(.04,.22,2,4),mat('#231a15'),(i-2)*.1,1.54,.23);}
  if(custom?.hair==='Curly'){for(let i=0;i<5;i++)mesh(new THREE.SphereGeometry(.07,5,4),mat('#201713'),(i-2)*.1,1.61,.27);}
  if(custom)g.scale.setScalar((Number(custom.height)||72)/72);
  g.userData={limbs};this.scene.add(g);return g;
 }
 configure(settings){this.cameraMode=settings.camera;this.renderer.toneMappingExposure=Number(settings.brightness);const high=settings.quality!=='Performance';this.renderer.setPixelRatio(Math.min(devicePixelRatio,high?1.75:1));this.renderer.shadowMap.enabled=high;this.resize();}
 draw(game,dt,side=0,custom=null){
  this.clock+=dt;const time=this.clock;
  if(game){
   const key=game.teams.join(',')+':'+game.pos+JSON.stringify(custom||{});
   if(key!==this.lastTeamKey){for(const g of this.athletes){this.scene.remove(g);g.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(o.material.map)o.material.map.dispose();o.material.dispose();}});}this.athletes=game.players.map(player=>this.makeAthlete(TEAMS[game.teams[player.team]],player.id,player.team===0&&player.id===game.controlled[0]?custom:null));this.lastTeamKey=key;this.ribbonMat.color.set(TEAMS[game.teams[0]].primary);}
   const stadium=game.stadium||0;
   if(this.stadium!==stadium){this.stadium=stadium;this.sun.color.set(['#ffe0b5','#bfd5ff','#ffad6b'][stadium]);this.scene.fog.color.set(['#273650','#15283e','#64464a'][stadium]);}
   for(let i=0;i<game.players.length;i++){
    const player=game.players[i],g=this.athletes[i];const target=new THREE.Vector3(player.x,0,50-player.y);
    g.position.lerp(target,Math.min(1,dt*18));
    const speed=Math.hypot(player.vx,player.vy);if(speed>.2){const angle=Math.atan2(-player.vx,player.vy);let delta=(angle-g.rotation.y+Math.PI*3)%(Math.PI*2)-Math.PI;g.rotation.y+=delta*Math.min(1,dt*14);}
    const run=Math.sin(time*(speed>5?15:9)+i)*Math.min(speed*.12,.8);g.userData.limbs.forEach((limb,j)=>limb.rotation.x=(j===0||j===3?1:-1)*run);g.position.y=Math.abs(Math.sin(time*15+i))*.05*Math.min(speed,1);
   }
   const carrier=game.players[game.carrier]||game.players[0];
   if(game.ball){const b=game.ball,t=b.t/b.duration;this.ball.position.set(b.x,1.7+Math.sin(Math.PI*t)*6,50-b.y);this.ball.rotation.z+=dt*16;}
   else{this.ball.position.set(carrier.x+.25,1.03,50-carrier.y-.22);this.ball.rotation.set(0,0,.6);}
   const selected=game.players[game.controlled[side]]||carrier;this.ring.position.set(selected.x,.06,50-selected.y);this.ring.visible=true;
   this.los.position.z=50-game.spot;this.first.position.z=50-game.target;this.los.visible=this.first.visible=true;
   const cy=game.phase==='ready'?game.spot:carrier.y;
   const target=this.cameraMode==='chase'?new THREE.Vector3(selected.x*.6,13,50-cy+24):new THREE.Vector3(42,36,50-cy+34);
   this.camera.position.lerp(target,1-Math.exp(-dt*3));this.camera.lookAt(this.cameraMode==='chase'?selected.x*.6:0,0,50-cy-8);
   const score=game.scores.join(':')+game.quarter+Math.ceil(game.clock);
   if(score!==this.lastScore){this.lastScore=score;this.paintScore(game);}
   this.sun.target.position.set(0,0,50-cy);this.sun.position.set(-50,90,80-cy);
  }else{
   for(const a of this.athletes)a.visible=false;this.ring.visible=false;this.los.visible=this.first.visible=false;
   this.camera.position.set(Math.sin(time*.04)*115,48,Math.cos(time*.04)*120);this.camera.lookAt(0,0,0);this.paintScore(null);
  }
  if(game)for(const a of this.athletes)a.visible=true;
  this.renderer.render(this.scene,this.camera);
 }
 paintScore(game){
  const c=this.scoreCanvas.getContext('2d');c.fillStyle='#071421';c.fillRect(0,0,1024,512);c.fillStyle='#52e6d2';c.fillRect(0,0,1024,14);c.textAlign='center';c.font='bold 38px Arial';c.fillText('COLLEGE GRIDIRON',512,80);
  if(game){c.fillStyle='#f4f3e9';c.font='bold 26px Arial';c.fillText(TEAMS[game.teams[0]].name.toUpperCase(),512,150);c.fillText(TEAMS[game.teams[1]].name.toUpperCase(),512,355);c.font='bold 100px Arial';c.fillText(game.scores[0]+'   —   '+game.scores[1],512,275);c.font='32px Arial';c.fillStyle='#e9be74';c.fillText((game.ot?'OVERTIME':'Q'+game.quarter)+'   '+Math.floor(game.clock/60)+':'+String(Math.floor(game.clock%60)).padStart(2,'0'),512,435);}
  else{c.fillStyle='#f4f3e9';c.font='bold 78px Arial';c.fillText('SATURDAY',512,235);c.fillText('STARTS HERE.',512,330);c.fillStyle='#e9be74';c.font='28px Arial';c.fillText('68 PROGRAMS   /   ONE LEGACY',512,440);}
  this.scoreTex.needsUpdate=true;
 }
}
