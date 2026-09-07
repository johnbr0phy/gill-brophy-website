const menu=document.querySelector('#site-index');
const trigger=document.querySelector('.portfolio-menu-button');
const close=document.querySelector('.index-close');
trigger.addEventListener('click',()=>{
 menu.showModal();document.body.classList.add('index-open');trigger.setAttribute('aria-expanded','true');
});
close.addEventListener('click',()=>menu.close());
menu.addEventListener('close',()=>{document.body.classList.remove('index-open');trigger.setAttribute('aria-expanded','false');if(trigger.getClientRects().length)trigger.focus();else document.querySelector('.desktop-navigation a').focus()});
menu.addEventListener('click',event=>{if(event.target===menu){const b=menu.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right)menu.close()}});
const details=document.querySelector('.work-disclosure');
if(details){
 document.addEventListener('click',event=>{if(!details.contains(event.target))details.open=false});
 details.addEventListener('keydown',event=>{if(event.key==='Escape'){details.open=false;details.querySelector('summary').focus()}});
}

// Close the mobile panel if its trigger disappears at the desktop breakpoint.
matchMedia('(min-width:701px)').addEventListener('change',event=>{if(event.matches&&menu.open)menu.close()});

// On the homepage, leave the artwork clear until the visitor scrolls back up.
if(document.body.classList.contains('paint-home')){
 const header=document.querySelector('.portfolio-header');
 let previous=Math.max(0,scrollY);
 addEventListener('scroll',()=>{
  const current=Math.max(0,Math.min(scrollY,document.documentElement.scrollHeight-innerHeight));
  const delta=current-previous;
  if(current<=8||menu.open){header.classList.remove('is-scrolled-away');previous=current;return}
  if(Math.abs(delta)<6)return;
  header.classList.toggle('is-scrolled-away',delta>0);
  previous=current;
 },{passive:true});
 header.addEventListener('focusin',()=>header.classList.remove('is-scrolled-away'));
}
