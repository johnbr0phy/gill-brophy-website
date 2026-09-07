import {openingIds,groupPaintings} from './curation.js';
// Visually reviewed white/off-white grounds. These remain available in the gallery.
const whiteBackgroundIds=new Set([
 "eae70281444a71af01b1fccc", // Artwork 04
 "12ebd0533a0a7dc2b823b56b", // Artwork 08
 "444c3c4e0bc1e93c0652244a", // Flora —  Transparencies
 "104a84fb859e21762fdbb2b8", // Flora —  In the Pink
 "272a8cf9b38dfce6044749ad", // Artwork 17
 "22754c6879dca5e5c1f47678", // Artwork 18
 "8f1ddca72ee99534314bc2a7", // Artwork 19
 "9bbad714aa66fd317c870e5a", // Artwork 20
 "fab08e1fe5649d4c63d4b9dd", // Artwork 21
 "bfb5d79db71489055c479ca9", // Artwork 22
 "b3f13bdff8a0278f90730b01", // Artwork 23
 "1db8b6a08ec02ebaf384b419", // Artwork 24
 "7266e7aa8d4b684272306d43", // Artwork 25
 "c7f3868e587e454437958242", // Talking Heads - Talking to Myself
 "e25eaf24e252b5d8a863d387", // Flora —  Pink with a Wink
 "555d4e058c7044d9cd0887ea", // Flora —  The Orange Tulips
 "a02445212b0b9d003b3c3e41", // Flora —  The Orange Tulips
 "4d6621e637be933f62afd4ff", // Growth
 "75468b16b2766554f4ae0637", // Rudbekia Dancers
 "00d35d83d110ff6776af569f", // Loop the Loop
 "f563abc5b549c8db9c8599fe", // Profusion - Square
 "964ff9c9074cc3e7706f1147", // Summer
 "18509801d619f7442e5a7133", // Hellebores
 "143358be9397521d00aa3832", // White Label
 "adf5ed552ab010a954a131e4", // Segments
 "4793d1af02c3b0e14bb352aa", // Cat and Mouse
 "ec3b627c2860f84f885b5cbb", // Artwork 83
 "c9d00f8b595adc0353c3503e", // Test Valley Treasure
 "5170b6e9a1acce07fd8e2640", // Artwork 89
 "65bd994b63e364d222a6dc63", // Artwork 96
 "6f811bfba0fc2c4c078c2301", // Artwork 97
 "fdd2cf101e2890ed008bf724", // Ten Red Buds
 "6af17d6760b477664e746acc", // Spook
]);
// Select once per page load. Scrolling never changes this sequence.
const shuffled=(values,random)=>{const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[result[i],result[j]]=[result[j],result[i]]}return result};
export function selectGalleryWorks(works,previous=[],count=8,random=Math.random){
 previous=Array.isArray(previous)?previous:[];
 const unique=[...new Map(groupPaintings(works.filter(Boolean)).map(w=>works.find(source=>source?.id===w.id)).filter(w=>w&&w.published!==false&&!whiteBackgroundIds.has(w.id)&&typeof w.id==='string'&&typeof w.image==='string').map(w=>[w.id,w])).values()];
 const old=new Set(previous),fresh=shuffled(unique.filter(w=>!old.has(w.id)),random),recent=shuffled(unique.filter(w=>old.has(w.id)),random);
 const preferred=fresh.filter(w=>openingIds.includes(w.id));
 const reserve=recent.filter(w=>openingIds.includes(w.id)&&w.id!==previous[0]);
 const opening=preferred[0]||reserve[0];
 const ordered=opening?[opening,...fresh.filter(w=>w.id!==opening.id),...recent.filter(w=>w.id!==opening.id)]:[...fresh,...recent];
 const selected=ordered.slice(0,Math.max(0,count));
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
