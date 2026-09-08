// Shared, read-only gallery data for Firebase Hosting and GitHub Pages.
import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import {getFirestore,collection,getDocs,query,where} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';
import {firebaseConfig} from './config.js';
const app=getApps().find(app=>app.name==='public-gallery')||initializeApp(firebaseConfig,'public-gallery');
const db=getFirestore(app),mediaOrigin='https://gill-brophy-art.web.app';
export async function fetchWorks(){
 const snapshot=await getDocs(query(collection(db,'works'),where('published','==',true)));
 const works=snapshot.docs.map(d=>{
  const w={...d.data(),id:d.id};
  for(const [field,path] of [['image',w.storagePath],['thumbnail',w.thumbPath]]){
   w[field]=path?`https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${encodeURIComponent(path)}?alt=media`:new URL(w[field],mediaOrigin).href;
  }
  return w;
 }).sort((a,b)=>a.position-b.position||a.created-b.created);
 return {ok:true,json:async()=>({works})};
}
