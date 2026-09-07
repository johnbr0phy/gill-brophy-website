import {paintingProgress} from './scroll-progress.js';
import {focalPointFor,coverPlacement} from './focal-points.js';
import {buildStrokes} from './paint-strokes.js';
import {selectGalleryWorks,scoreForWork} from './gallery-sequence.js';
import {analyseSurface,chooseBrush,buildRevealMarks,createBrushTips,drawReveal} from './reveal-brushes.js';
let paintings=[];
const STORAGE_KEY='gill-painting-selection-v1';
const canvas=document.querySelector('#painting'),ctx=canvas.getContext('2d',{alpha:false});
const cue=document.querySelector('.scroll-invitation');
let cueRevealScheduled=false;
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
const SPAN=1.65,images=[],programs=[],reveals=[];
const BRUSH_KEY='gill-reveal-brushes-v1',visitSeed=Math.random().toString(36).slice(2);
const prepared=new Map();
let width=0,height=0,dpr=1,viewportHeight=innerHeight,raf=0,position=0,target=0,gentle=preference.matches,active=-1;
const mask=document.createElement('canvas'),ink=mask.getContext('2d');
const layer=document.createElement('canvas'),layerCtx=layer.getContext('2d');
function surface(){const c=document.createElement('canvas');c.width=width;c.height=height;return c}
// Strokes use normalized artwork coordinates, including their actual aspect ratio.
function measureStrokes(strokes){for(const stroke of strokes){
 let length=0;stroke.lengths=[0];
 for(let i=1;i<stroke.points.length;i++){length+=Math.hypot(stroke.points[i][0]-stroke.points[i-1][0],stroke.points[i][1]-stroke.points[i-1][1]);stroke.lengths.push(length)}
 stroke.length=length;
}return strokes;}
function prepare(index){
 if(prepared.has(index))return prepared.get(index);
 const image=images[index];if(!image?.complete||!image.naturalWidth)return null;
 const data=paintings[index],source=surface(),c=source.getContext('2d');
 const {x,y,sw,sh}=coverPlacement(image.naturalWidth,image.naturalHeight,width,height,data.focus);
 c.drawImage(image,x,y,sw,sh);
 // A low-frequency colour study underlies the sharp pigment. It is built once, not filtered each frame.
 const wash=surface(),wc=wash.getContext('2d'),study=document.createElement('canvas');study.width=70;study.height=70;
 study.getContext('2d').drawImage(source,0,0,70,70);wc.filter=`blur(${Math.max(7,width*.014)}px) saturate(1.12)`;
 wc.drawImage(study,-width*.045,-height*.045,width*1.09,height*1.09);wc.filter='none';
 const result={source,wash,x,y,sw,sh};prepared.set(index,result);
 for(const old of [...prepared.keys()])if(Math.abs(old-index)>2)prepared.delete(old);
 return result;
}
function tracedPath(stroke,amount,mapping,offset=0){
 const points=stroke.points,limit=stroke.length*amount;
 ink.beginPath();
 for(let i=0;i<points.length;i++){
  let [x,y]=points[i];
  if(i&&stroke.lengths[i]>limit){const a=points[i-1],t=(limit-stroke.lengths[i-1])/(stroke.lengths[i]-stroke.lengths[i-1]);x=a[0]+(x-a[0])*t;y=a[1]+(y-a[1])*t;ink.lineTo(mapping.x+x*mapping.sw+offset,mapping.y+y*mapping.sh);break}
  if(!i)ink.moveTo(mapping.x+x*mapping.sw+offset,mapping.y+y*mapping.sh);
  else ink.lineTo(mapping.x+x*mapping.sw+offset,mapping.y+y*mapping.sh);
 }
}
function brush(stroke,amount,mapping){
 if(amount<=0)return;
 const size=stroke.width*Math.min(mapping.sw,mapping.sh),alpha=stroke.opacity??1;
 ink.lineCap='round';ink.lineJoin='round';ink.strokeStyle='#fff';
 // Three nested bristle bands soften the painted boundary without cut-paper edges.
 for(const [thickness,opacity] of [[1.15,.16],[.91,.34],[.70,.92]]){
  ink.globalAlpha=alpha*opacity;ink.lineWidth=Math.max(1,size*thickness);tracedPath(stroke,amount,mapping);ink.stroke();
 }
 if(size>16){ink.globalAlpha=alpha*.26;ink.lineWidth=Math.max(.7,size*.035);for(const shift of [-.48,-.37,.39,.51]){tracedPath(stroke,amount,mapping,size*shift);ink.stroke()}}
}
function paintLayer(index,phase){
 const current=prepare(index);if(!current)return false;
 let previous=index?prepare(index-1):null;
 if(index&&!previous){for(let i=index-2;i>=0;i--){previous=prepare(i);if(previous)break}}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 if(gentle){ctx.drawImage(current.source,0,0);return true}
 ctx.drawImage(previous?previous.source:current.wash,0,0);
 // Incoming colour gradually replaces the preceding painted ground; there is always artwork underneath.
 if(previous){ctx.globalAlpha=clamp(phase/.62)*.88;ctx.drawImage(current.wash,0,0);ctx.globalAlpha=1}
 if(phase>=.98){ctx.drawImage(current.source,0,0);return true}
 ink.clearRect(0,0,width,height);ink.globalCompositeOperation='source-over';
 const reveal=reveals[index];
 drawReveal(ink,reveal.marks,reveal.tips,phase,width,height);
 // Recognisable contours in the hand-scored works arrive after the broader material gestures.
 for(const stroke of programs[index]){
  const amount=clamp((phase-stroke.start)/stroke.duration);if(amount>0)brush(stroke,amount,current);
 }
 // Final glazes resolve the finest source texture after the individual gestures are complete.
 if(phase>.83){ink.globalAlpha=smooth((phase-.83)/.15);ink.fillStyle='#fff';ink.fillRect(0,0,width,height)}
 ink.globalAlpha=1;
 layerCtx.globalCompositeOperation='source-over';layerCtx.clearRect(0,0,width,height);layerCtx.drawImage(current.source,0,0);
 layerCtx.globalCompositeOperation='destination-in';layerCtx.drawImage(mask,0,0);layerCtx.globalCompositeOperation='source-over';
 ctx.drawImage(layer,0,0);return true;
}
function render(){
 raf=0;if(!paintings.length)return;const difference=target-position;
 position=gentle||Math.abs(difference)>.8||Math.abs(difference)<.0006?target:position+difference*.22;
 const {index,phase}=paintingProgress(position,paintings.length,SPAN);
 if(paintLayer(index,phase)){
  if(!cueRevealScheduled){
   cueRevealScheduled=true;
   // Wait until the first painted frame has completed its .35s canvas fade-in.
   setTimeout(()=>{cue.hidden=paintings.length<2},400);
  }
  canvas.classList.add('ready');canvas.dataset.painting=paintings[index].id;canvas.dataset.phase=phase.toFixed(3);
  canvas.dataset.brush=reveals[index].style.id;
 }
 cue.style.opacity=String(1-smooth(position/.55));
 cue.classList.toggle('is-dismissed',position>=.55);
 if(Math.abs(target-position)>.0006)wake();
}
function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(render)}
function readScroll(){target=scrollY/viewportHeight;wake()}
function resize(){
 viewportHeight=document.documentElement.clientHeight||innerHeight;
 const bounds=canvas.getBoundingClientRect();
 dpr=Math.min(devicePixelRatio,1.4);const scale=Math.min(1,1700/(bounds.width*dpr));
 width=Math.max(1,Math.round(bounds.width*dpr*scale));height=Math.max(1,Math.round(bounds.height*dpr*scale));
 canvas.width=mask.width=layer.width=width;canvas.height=mask.height=layer.height=height;
 prepared.clear();target=scrollY/viewportHeight;position=target;
 // Resizing clears the canvas: repaint in the same task, before the browser presents it.
 cancelAnimationFrame(raf);raf=0;render();
}
preference.addEventListener('change',()=>{gentle=preference.matches;wake()});
addEventListener('scroll',readScroll,{passive:true});addEventListener('resize',resize,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else wake()});
// Paints only in response to scrolling or resizing: no continuous animation, scroll capture or timers.
async function start(){
 try{
  const response=await fetch('/gill-brophy-website/works.json',{cache:'no-store'});if(!response.ok)throw Error('Gallery unavailable');
  const {works}=await response.json();let previous=[];
  try{const saved=JSON.parse(sessionStorage.getItem(STORAGE_KEY)||'[]');if(Array.isArray(saved))previous=saved}catch{}
  const selected=selectGalleryWorks(works,previous);
  const loaded=await Promise.all(selected.map(async work=>{
   const image=new Image();image.decoding='async';image.src=work.width*work.height>4_000_000?work.thumbnail:work.image;
   try{await image.decode()}catch{image.src=work.thumbnail;try{await image.decode()}catch{return null}}
   return {work,image};
  }));
  const available=loaded.filter(Boolean);
  if(!available.length){showEmpty(selected.length?'The paintings couldn’t load.':'New paintings will appear here.');return}
  let priorBrushes={};try{const saved=JSON.parse(sessionStorage.getItem(BRUSH_KEY)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))priorBrushes=saved}catch{}
  const usedBrushes=[],studyCanvas=document.createElement('canvas');studyCanvas.width=studyCanvas.height=64;
  const studyContext=studyCanvas.getContext('2d',{willReadFrequently:true});
  for(const {work,image} of available){
   const score=scoreForWork(work);paintings.push({...work,key:score,src:work.image,focus:focalPointFor(work)});images.push(image);
   studyContext.clearRect(0,0,64,64);studyContext.drawImage(image,0,0,64,64);
   let study={};try{study=analyseSurface(studyContext.getImageData(0,0,64,64))}catch{}
   const style=chooseBrush(work,study,usedBrushes,priorBrushes[work.id],Math.random,['watercolour','loaded-mop','dry-bristle','flat-brush','filbert','rag']);
   const seed=visitSeed+':'+work.id+':'+style.id;
   reveals.push({style,marks:buildRevealMarks(style,seed),tips:createBrushTips(style,seed)});
   usedBrushes.push(style.id);priorBrushes[work.id]=style.id;
   programs.push(measureStrokes(score==='gallery'?[]:buildStrokes(score).filter(s=>s.start>.64&&s.width<.035).slice(0,24)));
  }
  try{sessionStorage.setItem(BRUSH_KEY,JSON.stringify(priorBrushes))}catch{}
  try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(paintings.map(p=>p.id)))}catch{}
  document.querySelector('#paint-journey').style.height=(Math.max(1,paintings.length-1)*SPAN+1)*100+'svh';
  document.querySelector('#next-painting').style.top='55svh';
  document.querySelector('.paint-backdrop').style.backgroundImage='none';
  canvas.dataset.sequence=paintings.map(p=>p.id).join(',');canvas.dataset.brushes=reveals.map(r=>r.style.id).join(',');resize();
 }catch(error){console.warn('Could not load the gallery:',error);showEmpty('The gallery is taking a moment.');}
}
function showEmpty(message){
 document.querySelector('#paint-journey').style.height='45svh';cue.hidden=true;
 document.querySelector('.paint-end h2').textContent=message;document.querySelector('.paint-backdrop').style.backgroundImage='none';
}
resize();start();
