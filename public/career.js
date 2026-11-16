export function schedule(teams){
 let ring=teams.map(t=>t.id),weeks=[];
 for(let w=0;w<14;w++){if(w===5||w===10){weeks.push([]);continue;}let games=[];for(let i=0;i<ring.length/2;i++)games.push(w%2?[ring[ring.length-1-i],ring[i]]:[ring[i],ring[ring.length-1-i]]);weeks.push(games);ring.splice(1,0,ring.pop());}return weeks;
}
export function newCareer(teams,team,mode,player){return{version:1,mode,team,player,year:1,week:0,tokens:0,upgrade:0,facilities:0,totalWins:0,totalGames:0,quest:false,log:[],records:teams.map(t=>({id:t.id,w:0,l:0,cfw:0,cfl:0,points:0})),schedule:schedule(teams),post:null};}
export function rankings(c,teams){return [...c.records].sort((a,b)=>(b.w*5-b.l*2+teams[b.id].stars*.8+b.points*.003)-(a.w*5-a.l*2+teams[a.id].stars*.8+a.points*.003));}
export function simulate(a,b,c,teams){let x=teams[a].stars+(a===c.team?c.upgrade*.15+c.facilities*.1:0),y=teams[b].stars+(b===c.team?c.upgrade*.15+c.facilities*.1:0);let sa=Math.max(3,Math.round(17+x*2+Math.random()*21-y*2)),sb=Math.max(3,Math.round(17+y*2+Math.random()*21-x*2));if(sa===sb)sa+=3;return[sa,sb];}
export function currentGames(c){return c.week<14?c.schedule[c.week]:c.post?.games||[];}
export function matchup(c){return currentGames(c).find(p=>p.includes(c.team));}
export function advance(c,teams,result=null){
 const games=currentGames(c),winners=[];
 for(const [a,b] of games){let scores=result&&[a,b].includes(c.team)?(a===c.team?result:[result[1],result[0]]):simulate(a,b,c,teams);if(scores[0]===scores[1])scores[0]+=3;let wi=scores[0]>scores[1]?a:b,lo=wi===a?b:a;winners.push(wi);
 if(c.week<14){c.records[wi].w++;c.records[lo].l++;c.records[a].points+=scores[0]-scores[1];c.records[b].points+=scores[1]-scores[0];if(teams[a].conference===teams[b].conference){c.records[wi].cfw++;c.records[lo].cfl++;}}
 if(a===c.team||b===c.team){c.totalGames++;let won=wi===c.team;if(won)c.totalWins++;c.tokens+=won?60:25;c.log.unshift(`${teams[a].name} ${scores[0]} – ${scores[1]} ${teams[b].name}`);if(won&&!c.quest){c.tokens+=75;c.quest=true;c.log.unshift('Quest complete: first victory +75 tokens');}}
 }
 if(c.week<14){c.week++;if(c.week===14){let champs=[];for(const conf of [...new Set(teams.map(t=>t.conference))].filter(x=>x!=='INDEPENDENT')){let rs=c.records.filter(r=>teams[r.id].conference===conf).sort((a,b)=>b.cfw-a.cfw||b.w-a.w||b.points-a.points);champs.push([rs[0].id,rs[1].id]);}c.post={stage:'Conference championships',games:champs};}return;}
 if(c.post.stage==='Conference championships'){
 let ranked=rankings(c,teams).map(r=>r.id);let seeds=[...new Set([...winners,...ranked])].slice(0,12);c.post={stage:'Playoff first round & bowls',seeds,bye:seeds.slice(0,4),games:[[seeds[4],seeds[11]],[seeds[5],seeds[10]],[seeds[6],seeds[9]],[seeds[7],seeds[8]]]};
 let eligible=ranked.filter(id=>!seeds.includes(id)&&c.records[id].w>=6);for(let i=0;i+1<eligible.length;i+=2)c.post.games.push([eligible[i],eligible[i+1]]);return;
 }
 if(c.post.stage==='Playoff first round & bowls'){let q=[...c.post.bye,...winners.slice(0,4)];c.post={stage:'Quarterfinals',games:[[q[0],q[7]],[q[1],q[6]],[q[2],q[5]],[q[3],q[4]]]};}
 else if(c.post.stage==='Quarterfinals')c.post={stage:'Semifinals',games:[[winners[0],winners[3]],[winners[1],winners[2]]]};
 else if(c.post.stage==='Semifinals')c.post={stage:'National championship',games:[[winners[0],winners[1]]]};
 else if(c.post.stage==='National championship'){c.post={stage:'Season complete',games:[],champion:winners[0]};c.tokens+=100;c.log.unshift(`National champion: ${teams[winners[0]].name}`);}
}
export function nextYear(c,teams){c.year++;c.week=0;c.post=null;c.quest=false;c.records=teams.map(t=>({id:t.id,w:0,l:0,cfw:0,cfl:0,points:0}));c.schedule=schedule(teams);}
