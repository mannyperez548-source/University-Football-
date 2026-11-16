let ctx,master,timer,beat=0,track=0,active=false,volume=.35;
export const playlist=['Saturday Sunrise','Campus After Dark','Fourth Quarter Lights'];
const scales=[[130.81,164.81,196,261.63],[110,130.81,164.81,220],[146.83,174.61,220,293.66]];
function tone(freq,length,type='sine',gain=.12){if(!ctx)return;let o=ctx.createOscillator(),v=ctx.createGain();o.type=type;o.frequency.value=freq;v.gain.setValueAtTime(gain,ctx.currentTime);v.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+length);o.connect(v);v.connect(master);o.start();o.stop(ctx.currentTime+length);}
export function unlock(){if(!ctx){ctx=new AudioContext();master=ctx.createGain();master.gain.value=volume;master.connect(ctx.destination);}ctx.resume();}
export function setVolume(v){volume=Number(v);if(master)master.gain.value=volume;}
export function lobby(on){active=on;if(timer)return;timer=setInterval(()=>{if(!active||!ctx)return;let notes=scales[track];tone(notes[beat%4]/2,.35,'triangle',.14);if(beat%2===0)tone(notes[(beat*3)%4]*2,.2,'sine',.05);if(beat%4===0)tone(55,.12,'sine',.3);beat++;if(beat%64===0)track=(track+1)%3;},230);}
export function effect(type='whistle'){if(type==='score'){for(let i=0;i<3;i++)setTimeout(()=>tone([392,494,587][i],.5,'triangle',.2),i*100);}else if(type==='snap')tone(100,.12,'triangle',.2);else tone(1900,.12,'sine',.065);}
