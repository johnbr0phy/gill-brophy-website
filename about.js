import {fetchWorks} from './firebase-client/gallery-data.js';
import {displayTitle,groupPaintings} from './curation.js';
// Use the live published library, so hidden works never leak through the about page.
const slots=['hero','closing'];
try{
 const response=await fetchWorks();if(!response.ok)throw Error('Gallery unavailable');
 const {works}=await response.json();
 const pool=groupPaintings(works.filter(w=>w.published!==false&&w.image));
 let previous=[];
 try{const saved=JSON.parse(sessionStorage.getItem('about-selected-works')||'[]');if(Array.isArray(saved))previous=saved}catch{}
 const shuffle=items=>{for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]]}return items};
 const selected=[...shuffle(pool.filter(w=>!previous.includes(w.id))),...shuffle(pool.filter(w=>previous.includes(w.id)))].slice(0,slots.length);
 try{sessionStorage.setItem('about-selected-works',JSON.stringify(selected.map(w=>w.id)))}catch{}
 for(const [index,slot] of slots.entries()){
  const work=selected[index];
  if(!work)continue;
  const image=document.querySelector(`[data-art="${slot}"]`);
  image.alt=`${displayTitle(work)}, a painting by Gill Brophy`;
  image.addEventListener('load',()=>{image.hidden=false},{once:true});
  image.loading='eager';
  image.src=work.image;
  const link=document.querySelector(`[data-art-link="${slot}"]`);if(link)link.href='/gill-brophy-website/gallery.html#'+work.id;
  const caption=document.querySelector(`[data-art-caption="${slot}"]`);if(caption)caption.textContent=displayTitle(work);
 }
}catch(error){console.warn('About page artwork unavailable:',error)}
