export const TRACKS=[{name:'Saturday Voltage',bpm:108,notes:[110,130.81,164.81,146.83]},{name:'Tunnel Vision',bpm:122,notes:[98,116.54,146.83,130.81]},{name:'Campus After Dark',bpm:94,notes:[130.81,155.56,196,174.61]},{name:'Fourth Quarter',bpm:132,notes:[82.41,110,123.47,98]}];
export class AudioEngine{
 constructor(){this.volume=.45;this.music=.28;this.track=0;this.step=0;this.ctx=null;this.playing=false;}
 async start(){try{if(!this.ctx){this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);this.master.gain.value=this.volume;}await this.ctx.resume();if(!this.timer)this.timer=setInterval(()=>this.tick(),80);}catch{}}
 set(volume,music){this.volume=volume;this.music=music;if(this.master)this.master.gain.setTargetAtTime(volume,this.ctx.currentTime,.05);}
 tone(freq,time,duration,gain,type='sine'){
  if(!this.ctx)return;const o=this.ctx.createOscillator(),a=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,time);a.gain.setValueAtTime(.0001,time);a.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),time+.02);a.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(a);a.connect(this.master);o.start(time);o.stop(time+duration+.02);
 }
 tick(){
  if(!this.ctx||!this.playing)return;const now=this.ctx.currentTime;if(now<(this.next||0))return;
  const t=TRACKS[this.track],beat=60/t.bpm/2;this.next=now+beat;const n=t.notes[Math.floor(this.step/8)%4],v=this.music;
  if(this.step%2===0)this.tone(n,now,.28,v*.25,'triangle');
  if(this.step%4===0){this.tone(52,now,.13,v*.5,'sine');this.tone(n*4,now,.65,v*.07,'sine');}
  if(this.step%4===2)this.noise(.07,v*.1);
  this.tone(n*[4,6,8,6][this.step%4],now,.12,v*.055,'triangle');
  this.step++;if(this.step>=128){this.step=0;this.track=(this.track+1)%TRACKS.length;document.dispatchEvent(new Event('trackchange'));}
 }
 noise(duration,gain){if(!this.ctx)return;const b=this.ctx.createBuffer(1,this.ctx.sampleRate*duration,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const src=this.ctx.createBufferSource(),amp=this.ctx.createGain();src.buffer=b;amp.gain.value=gain;src.connect(amp);amp.connect(this.master);src.start();}
 effect(kind){if(!this.ctx)return;const n=this.ctx.currentTime;if(kind==='score'){[261.63,329.63,392,523.25].forEach((f,i)=>this.tone(f,n+i*.13,.5,.17,'triangle'));this.noise(1.1,.16);}else if(kind==='snap'){this.tone(110,n,.12,.15);this.noise(.07,.15);}else if(kind==='whistle'){this.tone(2400,n,.2,.06);this.tone(2800,n+.14,.18,.045);}else if(kind==='tackle')this.noise(.2,.28);else this.tone(660,n,.07,.05);}
}
