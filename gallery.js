import {fetchWorks} from './firebase-client/gallery-data.js';
import {displayTitle,groupPaintings,collectionCovers,openingIds} from './curation.js';
const $=id=>document.getElementById(id);
let works=[],paintings=[],visible=[],current=null,opener=null;
const params=new URLSearchParams(location.search);$('search').value=params.get('q')||'';
if(['order','title','newest'].includes(params.get('sort')))$('sort').value=params.get('sort');
async function load(){try{
 $('gallery-error').hidden=true;const r=await fetchWorks();if(!r.ok)throw Error();({works}=await r.json());paintings=groupPaintings(works);
 const names=[...new Set(paintings.map(w=>w.collection).filter(Boolean))].sort();
 $('collection').replaceChildren(new Option('All collections',''));names.forEach(n=>$('collection').add(new Option(n,n)));
 $('collection').value=params.get('collection')||'';buildCollections(names);render();fromHash();
}catch(e){$('gallery-error').hidden=false;$('work-count').textContent='Collection unavailable';}}
function buildCollections(names){
 $('collection-previews').replaceChildren();
 for(const name of names){
  const members=paintings.filter(w=>w.collection===name),cover=members.find(w=>collectionCovers.includes(w.id))||members[0];
  const a=document.createElement('a');a.className='collection-tile';a.href='/gill-brophy-website/gallery.html?collection='+encodeURIComponent(name);a.dataset.collection=name;
  const img=document.createElement('img');img.src=cover.thumbnail;img.alt='';img.loading='lazy';
  const title=document.createElement('span');title.textContent=name;
  const count=document.createElement('small');count.textContent=members.length+' works';a.append(img,title,count);
  a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();$('collection').value=name;$('search').value='';render();$('gallery-results').scrollIntoView({block:'start',behavior:'instant'})});
  $('collection-previews').append(a);
 }
}
function render(){
 const q=$('search').value.trim().toLowerCase(),collection=$('collection').value;
 visible=paintings.filter(w=>(!collection||w.collection===collection)&&(!q||(w.title+' '+w.collection+' '+w.description).toLowerCase().includes(q)));
 if($('sort').value==='order')visible.sort((a,b)=>a.position-b.position);
 if($('sort').value==='title')visible.sort((a,b)=>a.title.localeCompare(b.title));if($('sort').value==='newest')visible.sort((a,b)=>b.created-a.created);
 $('gallery').replaceChildren();$('empty').hidden=visible.length!==0;
 $('work-count').textContent=paintings.length+' works in '+new Set(paintings.map(w=>w.collection)).size+' collections';
 $('results-title').textContent=collection||'All paintings';$('results-count').textContent=visible.length+' '+(visible.length===1?'work':'works');
 for(const a of $('collection-previews').children){if(a.dataset.collection===collection)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')}
 for(const w of visible){
  const b=document.createElement('button');b.className='work-card';b.setAttribute('aria-label','View '+w.title);
  const img=document.createElement('img');img.src=w.thumbnail;img.alt=w.title;img.width=w.width;img.height=w.height;img.loading='lazy';img.decoding='async';
  const caption=document.createElement('div');caption.className='work-caption';const h=document.createElement('h2');h.textContent=w.title;
  const c=document.createElement('small');c.textContent=w.collection;caption.append(h,c);b.append(img,caption);b.addEventListener('click',()=>{opener=b;open(w.id)});$('gallery').append(b);
 }
 const p=new URLSearchParams();if(q)p.set('q',$('search').value);if(collection)p.set('collection',collection);if($('sort').value!=='order')p.set('sort',$('sort').value);history.replaceState(null,'','/gill-brophy-website/gallery.html'+(p.size?'?'+p.toString():'')+location.hash);
}
function open(id){
 const painting=paintings.find(p=>p.views.some(w=>w.id===id));if(!painting)return;
 const w=painting.views.find(w=>w.id===id)||painting.views[0];current=painting;
 $('viewer-title').textContent=displayTitle(painting);$('viewer-details').textContent=[w.medium,w.year,w.dimensions].filter(Boolean).join(' · ');
 $('viewer-description').textContent=w.description;$('viewer-image').alt=displayTitle(painting)+(w.id!==painting.id?' — detail':'');$('image-error').hidden=true;$('viewer-image').src=w.image;
 $('viewer-views').replaceChildren();$('viewer-views').hidden=painting.views.length<2;
 painting.views.forEach((view,i)=>{const b=document.createElement('button');b.type='button';b.textContent=i===0?'Full painting':'Detail';b.setAttribute('aria-pressed',String(view.id===w.id));b.addEventListener('click',()=>open(view.id));$('viewer-views').append(b)});
 const list=visible.some(x=>x.id===painting.id)?visible:paintings,index=list.findIndex(x=>x.id===painting.id);
 $('previous').disabled=index<=0;$('next').disabled=index>=list.length-1;
 if(!$('viewer').open){$('viewer').showModal();document.body.style.overflow='hidden'}
 history.replaceState(null,'',location.pathname+location.search+'#'+id);
}
function step(delta){const list=visible.some(x=>x.id===current?.id)?visible:paintings;const i=list.findIndex(w=>w.id===current?.id),w=list[i+delta];if(w)open(w.id)}
function fromHash(){if(location.hash)open(location.hash.slice(1))}
$('viewer-close').addEventListener('click',()=>$('viewer').close());$('viewer').addEventListener('close',()=>{document.body.style.overflow='';history.replaceState(null,'',location.pathname+location.search);if(opener?.isConnected)opener.focus()});
$('viewer-image').addEventListener('error',()=>$('image-error').hidden=false);$('previous').addEventListener('click',()=>step(-1));$('next').addEventListener('click',()=>step(1));
$('viewer').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}if(e.key==='ArrowRight'){e.preventDefault();step(1)}});
['search','collection','sort'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));
$('clear').addEventListener('click',()=>{$('search').value='';$('collection').value='';render()});$('retry').addEventListener('click',load);addEventListener('hashchange',fromHash);load();
