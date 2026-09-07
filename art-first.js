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
