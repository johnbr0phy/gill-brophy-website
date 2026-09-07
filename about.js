// Use the live published library, so hidden works never leak through the about page.
const choices={hero:/GB024 Flora - The Ribbon\.jpg/i,closing:/GB164 Flora- Bouquet in Blue & Gold\.jpg/i};
try{
 const response=await fetch('/gill-brophy-website/works.json',{cache:'no-store'});if(!response.ok)throw Error('Gallery unavailable');
 const {works}=await response.json();const used=new Set();
 for(const [slot,pattern] of Object.entries(choices)){
  const work=works.find(w=>pattern.test(w.original_name))||works.find(w=>!used.has(w.id));
  if(!work)continue;used.add(work.id);
  const image=document.querySelector(`[data-art="${slot}"]`);
  image.alt=slot==='pots'?work.title:`Detail of ${work.title}, a painting by Gill Brophy`;
  image.addEventListener('load',()=>{image.hidden=false},{once:true});
  image.loading='eager';
  image.src=work.image;
  const link=document.querySelector(`[data-art-link="${slot}"]`);if(link)link.href='/gill-brophy-website/gallery.html#'+work.id;
  const caption=document.querySelector(`[data-art-caption="${slot}"]`);if(caption)caption.textContent=work.title;
 }
}catch(error){console.warn('About page artwork unavailable:',error)}
