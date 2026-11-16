import {TEAMS} from './teams.js';
export function newSeason(teamId,year=1){
 const rotation=TEAMS.map(t=>t.id),weeks=[];
 for(let week=1;week<=14;week++){
  const games=[];
  if(week!==5&&week!==10){
   for(let i=0;i<rotation.length/2;i++) games.push({home:rotation[i],away:rotation[rotation.length-1-i],hs:null,as:null});
   rotation.splice(1,0,rotation.pop());
  }
  weeks.push(games);
 }
 return {year,teamId,week:0,weeks,records:TEAMS.map(t=>({id:t.id,w:0,l:0,pf:0,pa:0,cw:0,cl:0})),stage:'regular',post:[],round:0,champion:null};
}
export function ranking(s){
 return [...s.records].sort((a,b)=>value(b)-value(a));
 function value(r){return r.w*115-r.l*55+(r.pf-r.pa)*.2+TEAMS[r.id].stars*16;}
}
export function record(s,g,hs,as){
 if(g.hs!==null)return;
 g.hs=hs;g.as=as;
 const a=s.records[g.home],b=s.records[g.away];
 a.pf+=hs;a.pa+=as;b.pf+=as;b.pa+=hs;
 const w=hs>as?a:b,l=hs>as?b:a;w.w++;l.l++;
 if(TEAMS[g.home].conference===TEAMS[g.away].conference){w.cw++;l.cl++;}
}
function sim(s,g,rng=Math.random){
 let hs=Math.max(3,Math.round(16+TEAMS[g.home].stars*3+rng()*24-TEAMS[g.away].stars*2));
 let as=Math.max(0,Math.round(13+TEAMS[g.away].stars*3+rng()*24-TEAMS[g.home].stars*2));
 if(hs===as)hs+=3;
 record(s,g,hs,as);
}
export function currentGames(s){return s.stage==='regular'?(s.weeks[s.week]||[]):s.post.filter(g=>g.round===s.round);}
export function fixture(s){return currentGames(s).find(g=>(g.home===s.teamId||g.away===s.teamId)&&g.hs===null);}
export function advance(s,result=null,rng=Math.random){
 const f=fixture(s);
 if(f&&result)record(s,f,...(f.home===s.teamId?result:[result[1],result[0]]));
 if(f&&!result)return false;
 for(const g of currentGames(s))if(g.hs===null)sim(s,g,rng);
 if(s.stage==='regular'){
  s.week++;
  if(s.week===14){
   s.regularRecords=JSON.parse(JSON.stringify(s.records));s.stage='conference';s.round=0;
   for(const conf of ['ACC','BIG TEN','SEC','BIG 12']){
    const list=[...s.records].filter(r=>TEAMS[r.id].conference===conf).sort((a,b)=>b.cw-a.cw||a.cl-b.cl||b.w-a.w||b.pf-a.pf);
    s.post.push({home:list[0].id,away:list[1].id,hs:null,as:null,round:0,label:conf+' Championship',kind:'conference'});
   }
  }
 }else if(s.stage==='conference'){
  s.stage='playoff';s.round=1;
  const ranked=ranking(s).map(r=>r.id);
  const champs=s.post.filter(g=>g.kind==='conference').map(g=>g.hs>g.as?g.home:g.away);
  const field=[...new Set([...ranked.slice(0,12),...champs])];
  while(field.length>12){let i=field.length-1;while(champs.includes(field[i]))i--;field.splice(i,1);}
  field.sort((a,b)=>ranked.indexOf(a)-ranked.indexOf(b));s.seeds=field;s.byes=field.slice(0,4);
  for(let i=0;i<4;i++)s.post.push({home:field[4+i],away:field[11-i],hs:null,as:null,round:1,kind:'playoff',label:'Playoff · First round'});
  const eligible=ranked.filter(id=>!field.includes(id)&&s.regularRecords[id].w>=6);
  const names=['Carolina','Coastal','Summit','Heritage','Crescent','Founders','Liberty Lights','Canyon','Magnolia','Atlantic','Frontier','Lakeside','Capital','Pioneer','Harvest','Sunset','Palmetto','Orchard','Copper','Gateway','Riverbend','Evergreen','Prairie','Valley','Seaside','Horizon','Keystone','Redwood'];
  for(let i=0;i+1<eligible.length;i+=2)s.post.push({home:eligible[i],away:eligible[i+1],hs:null,as:null,round:1,kind:'bowl',label:names[i/2]+' Bowl'});
  if(eligible.length%2)s.unpairedBowl=eligible.at(-1);
 }else if(s.stage==='playoff'){
  const winners=s.post.filter(g=>g.round===s.round&&g.kind==='playoff').map(g=>g.hs>g.as?g.home:g.away);
  if(winners.length===1){s.champion=winners[0];s.stage='complete';return true;}
  const field=s.round===1?[...s.byes,...winners]:winners;
  field.sort((a,b)=>s.seeds.indexOf(a)-s.seeds.indexOf(b));s.round++;
  for(let i=0;i<field.length/2;i++)s.post.push({home:field[i],away:field[field.length-1-i],hs:null,as:null,round:s.round,kind:'playoff',label:s.round===2?'Playoff · Quarterfinal':s.round===3?'Playoff · Semifinal':'National Championship'});
 }
 return true;
}
export function eligibleTeams(tier){return TEAMS.filter(t=>t.stars<=({Underdog:2,'Skill player':4,'Heisman contender':5}[tier]||3));}
export function coachOffers(s){const r=s.records[s.teamId],pct=r.w/Math.max(1,r.w+r.l);return TEAMS.filter(t=>t.stars>TEAMS[s.teamId].stars&&t.stars<=(pct>=.75?5:pct>=.6?4:3));}
