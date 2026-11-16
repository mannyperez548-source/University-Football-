import * as THREE from '/vendor/three.module.js';
const canvas=document.querySelector('#world');
export const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
const scene=new THREE.Scene();scene.background=new THREE.Color('#172d48');scene.fog=new THREE.FogExp2('#172d48',.0025);
const camera=new THREE.PerspectiveCamera(49,innerWidth/innerHeight,.1,700);camera.position.set(-45,46,83);
scene.add(new THREE.HemisphereLight('#d3eaff','#46552b',2.3));const sun=new THREE.DirectionalLight('#ffe6be',2.8);sun.position.set(-35,75,30);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-90,right:90,top:90,bottom:-90,near:1,far:240});sun.shadow.bias=-.0005;scene.add(sun);
const mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const green=mat('#245d42'),white=mat('#f6f2df'),steel=mat('#6b7c85',.4,.65),dark=mat('#13202a'),gold=mat('#ffce36',.3,.5);
function box(w,h,d,m,x=0,y=0,z=0,parent=scene){let o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.receiveShadow=true;parent.add(o);return o;}
function cyl(r,h,m,x,y,z,parent=scene){let o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),m);o.position.set(x,y,z);parent.add(o);return o;}
box(190,1,145,mat('#152c23'),0,-.8,0);box(120,.2,53.33,green,0,-.15,0);
for(let i=0;i<20;i++)box(5,.025,53.33,mat(i%2?'#32744c':'#2c6844'),-47.5+i*5,0,0);
const endMats=[mat('#782936'),mat('#153d6a')];box(10,.03,53.33,endMats[0],-55,.02,0);box(10,.03,53.33,endMats[1],55,.02,0);
for(let x=-50;x<=50;x+=5)box(.13,.04,53.33,white,x,.04,0);
for(let x=-49;x<50;x++){for(const z of [-8.8,8.8])box(.08,.05,.7,white,x,.05,z);}
for(const z of [-26.7,26.7])box(120,.07,.24,white,0,.07,z);
function textPlane(text,w,h,color='#ffffff',bg=null){let c=document.createElement('canvas');c.width=1024;c.height=256;let cx=c.getContext('2d');if(bg){cx.fillStyle=bg;cx.fillRect(0,0,1024,256);}cx.fillStyle=color;cx.font='bold 150px Arial';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(text,512,140,1000);let tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;let m=new THREE.MeshBasicMaterial({map:tex,transparent:!bg,side:THREE.DoubleSide});return new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);}
for(let x=-40;x<=40;x+=10){let n=50-Math.abs(x);for(let z of [-19,19]){let t=textPlane(String(n),3.7,2.7);t.rotation.x=-Math.PI/2;t.rotation.z=z>0?Math.PI:0;t.position.set(x,.09,z);scene.add(t);}}
let midfield=textPlane('SL',11,8,'#f1e9cb');midfield.rotation.x=-Math.PI/2;midfield.position.set(0,.1,0);scene.add(midfield);
let ends=[];for(let x of [-55,55]){let t=textPlane('SATURDAY',37,6);t.rotation.x=-Math.PI/2;t.rotation.z=Math.PI/2;t.position.set(x,.1,0);scene.add(t);ends.push(t);}
for(const x of [-62,62]){cyl(.18,7,gold,x,3.5,0);box(.25,.25,6.1,gold,x,7,0);for(const z of [-3.05,3.05])cyl(.13,5,gold,x,9.5,z);}
for(const z of [-1,1])for(let tier=0;tier<9;tier++){box(145,1.5,3.3,mat(tier%2?'#39424b':'#4c555d'),0,2+tier*1.55,z*(34+tier*3.2));}
for(const x of [-1,1])for(let tier=0;tier<7;tier++)box(3.3,1.5,65,mat('#3d4952'),x*(69+tier*3.2),2+tier*1.55,0);
// Instanced crowd: thousands of colored seats/silhouettes in a single draw call.
let crowd=new THREE.InstancedMesh(new THREE.BoxGeometry(.65,1,.6),mat('#ffffff'),5200),dummy=new THREE.Object3D();let seed=71;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
for(let i=0;i<5200;i++){let tier=Math.floor(rnd()*9),side=rnd()<.5?-1:1;let x=(rnd()-.5)*139,z=side*(34+tier*3.2+(rnd()-.5)*2),y=3+tier*1.55;if(i>4200){x=side*(70+tier*2.4);z=(rnd()-.5)*62;}dummy.position.set(x,y,z);dummy.scale.set(1,.7+rnd()*.7,1);dummy.updateMatrix();crowd.setMatrixAt(i,dummy.matrix);crowd.setColorAt(i,new THREE.Color(['#ce3c40','#e6dfc4','#204d73','#263544','#f0a63c'][Math.floor(rnd()*5)]));}scene.add(crowd);
for(let x of [-60,60])for(let z of [-47,47]){cyl(.4,33,steel,x,16,z);box(10,3,.7,dark,x,33,z);for(let a=-4;a<=4;a+=2)box(1.3,1.4,.2,new THREE.MeshBasicMaterial({color:'#fff8dc'}),x+a,33,z+.5);}
let video=textPlane('SATURDAY LEGENDS',29,8,'#d4ff59','#091823');video.position.set(0,25,-63);scene.add(video);box(31,10,1,dark,0,25,-64);
const line=box(.18,.08,53.3,mat('#29ccff'),-25,.1,0),gain=box(.2,.08,53.3,mat('#ffda32'),-15,.1,0);
let models=[];const skins=['#e7b998','#a56c46','#683b2c','#c58b62'];
function player(team,i){let group=new THREE.Group(),jersey=mat(team.color),skin=mat(skins[i%4]),pants=mat('#eee9d8');let body=box(.85,.95,.55,jersey,0,1.8,0,group);body.castShadow=true;let helmet=new THREE.Mesh(new THREE.SphereGeometry(.39,14,10),jersey);helmet.position.y=2.68;helmet.castShadow=true;group.add(helmet);box(.4,.13,.35,steel,.28,2.6,0,group);box(.17,.27,.43,skin,.28,2.43,0,group);
 let arms=[],legs=[];for(let sign of [-1,1]){let arm=new THREE.Group();arm.position.set(0,2.08,sign*.48);box(.26,.72,.27,skin,0,-.27,0,arm);group.add(arm);arms.push(arm);let leg=new THREE.Group();leg.position.set(0,1.35,sign*.23);box(.32,.85,.32,pants,0,-.35,0,leg);box(.5,.21,.33,dark,.09,-.81,0,leg);group.add(leg);legs.push(leg);}scene.add(group);return{group,arms,legs,jersey,skin,helmet};}
let ring=new THREE.Mesh(new THREE.RingGeometry(.8,1.04,32),new THREE.MeshBasicMaterial({color:'#d4ff59',side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.16;scene.add(ring);
let ball=new THREE.Mesh(new THREE.SphereGeometry(.24,12,8),mat('#783c22'));ball.scale.set(1.7,.8,.8);ball.castShadow=true;scene.add(ball);
let currentTeams='',stadium='night',appearanceKey='';
export function setStadium(value){stadium=value;scene.background.set(value==='sunset'?'#805961':value==='day'?'#779fbf':'#172d48');scene.fog.color.copy(scene.background);sun.color.set(value==='sunset'?'#ffa45f':'#ffe6be');sun.intensity=value==='night'?1.7:2.8;}
export function appearance(playerData){if(!playerData||!models.length)return;let key=JSON.stringify(playerData);if(key===appearanceKey)return;appearanceKey=key;const model=models[0];model.skin.color.set(playerData.skin);model.group.scale.setScalar(Number(playerData.height)/72);if(model.hair){model.group.remove(model.hair);model.hair.geometry.dispose();}if(playerData.hair!=='Shaved'){model.hair=box(.36,playerData.hair==='Long'?.55:.19,.43,mat('#21160f'),-.12,2.35,0,model.group);}}
export function draw(g,seat,dt,time,brightness=1){renderer.toneMappingExposure=Number(brightness)*1.25;
 if(g){let key=g.home.id+'-'+g.away.id;if(key!==currentTeams){for(const m of models)scene.remove(m.group);models=[];for(let i=0;i<22;i++)models.push(player(i<11?g.home:g.away,i));endMats[0].color.set(g.home.color);endMats[1].color.set(g.away.color);currentTeams=key;appearanceKey='';}
 for(let i=0;i<22;i++){let p=g.players[i],m=models[i];m.group.position.lerp(new THREE.Vector3(p.x-50,0,p.y),Math.min(1,dt*22));let run=Math.hypot(p.vx,p.vy)>.1;if(run)m.group.rotation.y=Math.atan2(-p.vy,p.vx);m.legs[0].rotation.z=run?Math.sin(p.anim*1.5)*.7:0;m.legs[1].rotation.z=-m.legs[0].rotation.z;m.arms[0].rotation.z=-m.legs[0].rotation.z;m.arms[1].rotation.z=m.legs[0].rotation.z;m.group.position.y=run?Math.abs(Math.sin(p.anim*1.5))*.07:0;}
 const p=g.players.find(p=>p.id===g.carrier)||g.players[g.offense*11];let bp=g.flight||{x:p.x+.3,y:p.y,z:1.8};ball.position.set(bp.x-50,bp.z,bp.y);ball.rotation.z=time*3;line.position.x=g.ball-50;gain.position.x=g.target-50;
 let selected=g.players[g.control[seat]];ring.position.x=selected.x-50;ring.position.z=selected.y;
 const focus=g.phase==='live'?p.x-50:g.ball-50;let desired=new THREE.Vector3(focus-23,30,43);camera.position.lerp(desired,1-Math.exp(-dt*3));camera.lookAt(focus+7,0,0);
 }else{let t=time*.025;camera.position.set(Math.cos(t)*90,43,Math.sin(t)*80);camera.lookAt(0,0,0);ring.visible=false;}ring.visible=!!g;renderer.render(scene,camera);
}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
