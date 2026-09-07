// Interpretations of visible paint qualities, not claims about Gill's materials.
// All randomness is chosen once per visit; scrolling only exposes existing marks.
export const BRUSH_STYLES = [
 ['watercolour','Watercolour wash','fluid','wash','sweep',.29,12],
 ['wet-on-wet','Wet-on-wet blooms','fluid','bloom','pool',.34,14],
 ['ink-bleed','Bleeding ink','fluid','ink','ribbon',.22,15],
 ['salt-wash','Salt and pigment','fluid','salt','pool',.29,16],
 ['spray-mist','Spray-can mist','atmospheric','spray','sweep',.30,17],
 ['aerosol','Dense aerosol','graphic','aerosol','cross',.23,17],
 ['loaded-mop','Loaded mop brush','fluid','mop','sweep',.30,13],
 ['splash-brush','Sloppy brush and splatters','textured','splatter','cross',.26,15],
 ['dry-bristle','Dry bristle','textured','dry','sweep',.27,17],
 ['flat-brush','Flat hog brush','textured','flat','cross',.23,17],
 ['palette-knife','Palette-knife strokes','textured','knife','cross',.27,15],
 ['rake','Raked paint','graphic','rake','ribbon',.28,17],
 ['sponge','Sponge stippling','textured','sponge','pool',.28,17],
 ['pastel','Soft pastel','atmospheric','pastel','sweep',.30,15],
 ['charcoal','Charcoal drag','graphic','charcoal','cross',.25,17],
 ['fan','Fan-brush sweeps','textured','fan','arc',.30,16],
 ['filbert','Filbert petals','fluid','petal','arc',.28,17],
 ['ink-ribbon','Flowing ink ribbons','graphic','ribbon','ribbon',.19,19],
 ['drips','Running paint','fluid','drip','fall',.22,18],
 ['rag','Rag scumbling','textured','rag','arc',.30,16],
].map(([id,name,family,tip,gesture,width,count])=>({id,name,family,tip,gesture,width,count}));

const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v));
export function seededRandom(seed){
 let state=2166136261;for(const c of String(seed))state=Math.imul(state^c.charCodeAt(0),16777619);
 return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
}

// A small colour/edge study also covers new uploads without needing an annotation.
export function analyseSurface(pixels){
 let edges=0,grain=0,chroma=0,count=0;
 const {data,width,height}=pixels;
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
  const i=(y*width+x)*4,lum=j=>(data[j]*.2126+data[j+1]*.7152+data[j+2]*.0722)/255;
  const c=lum(i),left=lum(i-4),right=lum(i+4),up=lum(i-width*4),down=lum(i+width*4);
  edges+=(Math.abs(right-left)+Math.abs(down-up))/2;
  grain+=Math.abs(c-(left+right+up+down)/4);
  chroma+=(Math.max(data[i],data[i+1],data[i+2])-Math.min(data[i],data[i+1],data[i+2]))/255;count++;
 }
 return {edges:count?edges/count:0,grain:count?grain/count:0,chroma:count?chroma/count:0};
}

export function surfaceAffinity(work,study={}){
 const name=[work.medium,work.original_name,work.title].filter(Boolean).join(' ').toLowerCase();
 if(/watercolou?r|inspired by elda|reflections/.test(name))return 'fluid';
 if(/impasto|orange tulips|the ribbon|rock garden/.test(name))return 'textured';
 if(/\bink\b|loop the loop|jacob.?s pots|snapshots|talking heads/.test(name))return 'graphic';
 if(study.grain>.065)return 'textured';
 if(study.edges>.16)return 'graphic';
 if(study.edges<.075)return 'fluid';
 return 'atmospheric';
}

export function chooseBrush(work,study,used=[],previous='',random=Math.random){
 const affinity=surfaceAffinity(work,study);
 let pool=BRUSH_STYLES.filter(s=>!used.includes(s.id)&&s.id!==previous);
 if(!pool.length)pool=BRUSH_STYLES.filter(s=>s.id!==previous);
 const weight=s=>s.family===affinity?4:1;
 let draw=random()*pool.reduce((sum,s)=>sum+weight(s),0);
 return pool.find(s=>(draw-=weight(s))<0)||pool.at(-1);
}

/** A bounded field of marks; coordinates are viewport-relative so portrait crops fill. */
export function buildRevealMarks(style,seed){
 const random=seededRandom(seed),marks=[];
 const angle=random()*TAU,ca=Math.cos(angle),sa=Math.sin(angle);
 for(let stroke=0;stroke<style.count;stroke++){
  const station=((stroke*.61803398875+random()*.07)%1)*1.44-.22;
  const bend=(random()-.5)*.36,start=random()*.34,duration=.30+random()*.18;
  const cx=.08+random()*.84,cy=.08+random()*.84,rotation=random()*TAU;
  const steps=style.gesture==='pool'?17:29;
  for(let step=0;step<steps;step++){
   const t=step/(steps-1),travel=stroke%2?1-t:t;
   let x=travel*1.5-.25,y=station+Math.sin(travel*Math.PI)*bend;
   if(style.gesture==='cross'&&stroke%2)[x,y]=[y,x];
   if(style.gesture==='fall'){x=station+Math.sin(t*3+rotation)*.018;y=t*1.5-.25}
   if(style.gesture==='ribbon'){x=station+Math.sin(t*5+rotation)*.14;y=travel*1.5-.25}
   if(style.gesture==='arc'){const a=rotation+t*Math.PI*1.4,r=.16+(stroke/style.count)*.57;x=.5+Math.cos(a)*r;y=.5+Math.sin(a)*r}
   if(style.gesture==='pool'){const a=rotation+t*TAU,r=.02+t*.19;x=cx+Math.cos(a)*r;y=cy+Math.sin(a)*r}
   if(['sweep','cross'].includes(style.gesture)){
    const dx=x-.5,dy=y-.5;x=.5+dx*ca-dy*sa;y=.5+dx*sa+dy*ca;
   }
   marks.push({x,y,size:style.width*(.72+random()*.48),angle:style.gesture==='fall'?0:angle+rotation*.18+Math.sin(t*4)*.25,
    start:start+t*duration,duration:.09+random()*.055,opacity:.66+random()*.30,tip:Math.floor(random()*3)});
  }
 }
 return marks.sort((a,b)=>a.start-b.start);
}

/** Three fixed organic impressions per painting, reused rather than grain regenerated per frame. */
export function createBrushTips(style,seed,makeCanvas=()=>document.createElement('canvas')){
 return Array.from({length:3},(_,variant)=>{
  const canvas=makeCanvas();canvas.width=canvas.height=128;
  const c=canvas.getContext('2d'),r=seededRandom(seed+':'+variant),tip=style.tip;
  c.translate(64,64);c.fillStyle=c.strokeStyle='#fff';c.lineCap='round';
  const dot=(x,y,rad,alpha=1)=>{c.globalAlpha=alpha;c.beginPath();c.arc(x,y,Math.max(.2,rad),0,TAU);c.fill()};
  const cloud=(radius,alpha)=>{
   const g=c.createRadialGradient(0,0,2,0,0,radius);g.addColorStop(0,`rgba(255,255,255,${alpha})`);g.addColorStop(.64,`rgba(255,255,255,${alpha*.8})`);g.addColorStop(1,'rgba(255,255,255,0)');
   c.globalAlpha=1;c.fillStyle=g;c.fillRect(-64,-64,128,128);c.fillStyle='#fff';
  };
  const scatter=(count,radius,size,alpha=1)=>{for(let i=0;i<count;i++){const a=r()*TAU,d=Math.sqrt(r())*radius;dot(Math.cos(a)*d,Math.sin(a)*d,.4+r()*size,alpha*(.3+r()*.7))}};
  const line=(x,y,x2,y2,width,alpha=1)=>{c.globalAlpha=alpha;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke()};
  if(['wash','bloom','salt','ink','mop'].includes(tip)){
   cloud(61,tip==='ink'?.88:.42);
   for(let i=0;i<(tip==='bloom'?13:7);i++){
    const a=r()*TAU,d=r()*20;c.save();c.translate(Math.cos(a)*d,Math.sin(a)*d);cloud(25+r()*21,tip==='mop'?.75:.25);c.restore();
   }
   if(tip==='ink'||tip==='mop')scatter(32,45,5,.65);
   if(tip==='salt'){c.globalCompositeOperation='destination-out';scatter(95,52,2.4,.85);c.globalCompositeOperation='source-over'}
  }else if(tip==='spray'||tip==='aerosol'){
   if(tip==='aerosol')cloud(43,.48);
   scatter(tip==='spray'?390:270,60,tip==='spray'?1.25:2.0,.85);
  }else if(tip==='splatter'){
   dot(0,0,22,.92);
   for(let i=0;i<14;i++){const a=r()*TAU,d=26+r()*24;line(Math.cos(a)*14,Math.sin(a)*14,Math.cos(a)*d,Math.sin(a)*d,1+r()*5,.8)}
   scatter(45,60,3.1,.95);
  }else if(['dry','flat','rake','charcoal'].includes(tip)){
   const count=tip==='rake'?7:tip==='charcoal'?100:44;
   for(let i=0;i<count;i++){
    const x=tip==='rake'?-42+i*14:-48+r()*96,y=-38+r()*18;
    line(x,y,x+(r()-.5)*9,30+r()*18,tip==='rake'?5:tip==='flat'?2.8:.6+r()*1.2,tip==='charcoal'?.35+r()*.5:.7+r()*.3);
   }
   if(tip==='flat'){c.globalAlpha=.7;c.fillRect(-46,-24,92,43)}
  }else if(tip==='knife'){
   c.beginPath();c.moveTo(-48,-30);c.lineTo(46,-41);c.lineTo(35,34);c.lineTo(-42,43);c.closePath();c.fill();
   c.globalCompositeOperation='destination-out';for(let i=0;i<15;i++)line(-48+r()*20,-40+r()*80,48,-40+r()*80,.5+r(),.6);c.globalCompositeOperation='source-over';
  }else if(tip==='sponge'){scatter(95,50,5,.7);scatter(35,43,7,.7)}
  else if(tip==='pastel'){cloud(57,.35);scatter(550,56,1.1,.6)}
  else if(tip==='fan'){
   for(let i=0;i<48;i++){const a=-2.55+i/47*2;line(0,34,Math.cos(a)*55,Math.sin(a)*55,1+r()*1.6,.55+r()*.4)}
  }else if(tip==='petal'){
   c.beginPath();c.moveTo(0,54);c.bezierCurveTo(-66,6,-39,-52,0,-51);c.bezierCurveTo(39,-52,66,6,0,54);c.fill();
   c.globalCompositeOperation='destination-out';for(let i=0;i<14;i++)line((r()-.5)*60,-45,(r()-.5)*15,44,.5,.35);c.globalCompositeOperation='source-over';
  }else if(tip==='ribbon'){
   for(let i=0;i<4;i++){c.globalAlpha=.65;c.lineWidth=9-i*1.3;c.beginPath();c.moveTo(-40,-48+i*7);c.bezierCurveTo(44,-26,-48,26,40,48-i*7);c.stroke()}
  }else if(tip==='drip'){
   cloud(34,.85);for(let i=0;i<8;i++){const x=(r()-.5)*46,y=24+r()*37;line(x,-7,x,y,1+r()*3,.85);dot(x,y,1.4+r()*2.1,.9)}
  }else if(tip==='rag'){
   for(let i=0;i<38;i++){c.globalAlpha=.2+r()*.45;c.lineWidth=1+r()*5;c.beginPath();c.arc((r()-.5)*50,(r()-.5)*50,9+r()*22,r()*TAU,r()*TAU);c.stroke()}
  }
  c.globalAlpha=1;return canvas;
 });
}

export function drawReveal(ink,marks,tips,phase,width,height){
 const unit=Math.min(width,height);
 for(const mark of marks){
  if(mark.start>=phase)break;
  const t=clamp((phase-mark.start)/mark.duration),ease=t*t*(3-2*t);
  const size=mark.size*unit*(.65+.35*ease),cs=Math.cos(mark.angle),sn=Math.sin(mark.angle);
  ink.globalAlpha=mark.opacity*ease;
  ink.setTransform(cs,sn,-sn,cs,mark.x*width,mark.y*height);
  ink.drawImage(tips[mark.tip],-size/2,-size/2,size,size);
 }
 ink.setTransform(1,0,0,1,0,0);ink.globalAlpha=1;
}
