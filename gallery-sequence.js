// Select once per page load. Scrolling never changes this sequence.
const shuffled=(values,random)=>{const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[result[i],result[j]]=[result[j],result[i]]}return result};
export function selectGalleryWorks(works,previous=[],count=8,random=Math.random){
 previous=Array.isArray(previous)?previous:[];
 const unique=[...new Map(works.filter(w=>w&&w.published!==false&&typeof w.id==='string'&&typeof w.image==='string').map(w=>[w.id,w])).values()];
 const old=new Set(previous),fresh=shuffled(unique.filter(w=>!old.has(w.id)),random),recent=shuffled(unique.filter(w=>old.has(w.id)),random);
 const selected=[...fresh,...recent].slice(0,Math.max(0,count));
 if(selected.length>1&&selected[0].id===previous[0]){const i=selected.findIndex(w=>w.id!==previous[0]);[selected[0],selected[i]]=[selected[i],selected[0]]}
 return selected;
}
export function scoreForWork(work){
 const name=(work.original_name||work.title||'').toLowerCase();
 const named=[[/orange tulips/,'tulips'],[/jacob.?s pots/,'pots'],[/the ribbon/,'ribbon'],[/blue.*gold/,'flowers'],[/reflections/,'reflections'],[/neon bouquet/,'branches'],[/loop the loop/,'loops'],[/the bud/,'bud']];
 return named.find(([test])=>test.test(name))?.[1]||'gallery';
}
// Uncatalogued/new paintings get broad scumbles and fine curved strokes, never a mismatched flower stencil.
export function galleryStrokes(seed){
 let state=2166136261;for(const c of seed)state=Math.imul(state^c.charCodeAt(0),16777619);
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 const strokes=[],angle=random()*Math.PI;
 for(let i=0;i<116;i++){
  const broad=i<34,detail=i>=88,width=broad?.12+random()*.15:detail?.008+random()*.015:.035+random()*.06;
  const cx=random(),cy=random(),length=broad?1.0+random()*.4:detail?.2+random()*.45:.25+random()*.4,bend=(random()-.5)*.12;
  const rotate=angle+(random()-.5)*(broad?.5:2),c=Math.cos(rotate),s=Math.sin(rotate);
  const points=Array.from({length:22},(_,k)=>{const t=k/21-.5,x=t*length,y=Math.sin((t+.5)*Math.PI)*bend;return[cx+x*c-y*s,cy+x*s+y*c]});
  strokes.push({points,width,start:broad?random()*.17:detail?.66+random()*.14:.18+random()*.40,duration:broad?.25:detail?.13:.19,opacity:broad?.80:.98});
 }
 return strokes.sort((a,b)=>a.start-b.start);
}
