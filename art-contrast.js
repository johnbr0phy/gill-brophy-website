// WCAG luminance, using the actual composited painting beneath each control.
export function luminance(r,g,b){
 const linear=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4};
 return .2126*linear(r)+.7152*linear(g)+.0722*linear(b);
}
export function contrastTone(values,previous){
 if(!values.length)return previous||'light';
 const mean=values.reduce((a,b)=>a+b,0)/values.length;
 // Hysteresis prevents lettering flickering as brushwork crosses its background.
 if(previous==='light'&&mean<.23)return 'light';
 if(previous==='dark'&&mean>.14)return 'dark';
 return mean>.18?'dark':'light';
}
export function watchArtContrast(canvas){
 const controls=[...document.querySelectorAll('.portfolio-wordmark,.portfolio-header nav a,.painting-title,.paint-cue')];
 const end=document.querySelector('.paint-end');
 const study=document.createElement('canvas');study.width=120;study.height=80;
 const context=study.getContext('2d',{willReadFrequently:true});
 let last=-Infinity;
 return function update(force=false){
  const now=performance.now();if(!force&&now-last<100)return;last=now;
  if(!canvas.width||!canvas.height)return;
  context.drawImage(canvas,0,0,120,80);
  let pixels;try{pixels=context.getImageData(0,0,120,80).data}catch{return}
  const rect=canvas.getBoundingClientRect(),endTop=end.getBoundingClientRect().top;
  for(const control of controls){
   if(control.hidden)continue;
   const box=control.getBoundingClientRect();if(box.bottom<0||box.top>innerHeight)continue;
   const values=[];
   // Sample a grid within the lettering's own area, not the average whole image.
   for(let y=1;y<6;y++)for(let x=1;x<12;x++){
    const screenX=box.left+box.width*x/12,screenY=box.top+box.height*y/6;
    if(screenY>=endTop){values.push(luminance(24,24,23));continue}
    const px=Math.max(0,Math.min(119,Math.floor((screenX-rect.left)/rect.width*120)));
    const py=Math.max(0,Math.min(79,Math.floor((screenY-rect.top)/rect.height*80)));
    const p=(py*120+px)*4;values.push(luminance(pixels[p],pixels[p+1],pixels[p+2]));
   }
   control.dataset.ink=contrastTone(values,control.dataset.ink);
  }
 };
}
