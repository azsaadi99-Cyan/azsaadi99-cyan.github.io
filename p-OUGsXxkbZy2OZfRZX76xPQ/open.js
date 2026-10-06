'use strict';
(async()=>{
 const status=document.getElementById('status'),params=new URLSearchParams(location.hash.slice(1)),keyText=params.get('k');
 const message='الرابط غير مكتمل أو غير صحيح. اطلب الرابط الكامل من صاحب الموقع.';
 if(!keyText||!/^[A-Za-z0-9_-]{43}$/.test(keyText)){status.textContent=message;return;}
 const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 try{
  const key=await crypto.subtle.importKey('raw',decode(keyText),'AES-GCM',false,['decrypt']);
  const response=await fetch('content-a8debd5d971905.bin');if(!response.ok)throw Error('Unavailable');
  const sealed=new Uint8Array(await response.arrayBuffer());
  const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:sealed.slice(0,12),additionalData:new TextEncoder().encode('portfolio-package-v1')},key,sealed.slice(12));
  const unpacked=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const pack=JSON.parse(new TextDecoder().decode(unpacked)),urls=new Map();
  function assetURL(name){
   name=name.split('?')[0];if(urls.has(name))return urls.get(name);const item=pack.files[name];if(!item)return name;
   let bytes=decode(item.data);
   if(name==='app.js'){
    let script=new TextDecoder().decode(bytes);
    script=script.replace(/\.forEach\(e=>e\.href=(`assets\/Ahmed_Alzahrani_IT_Systems_\$\{lang\.toUpperCase\(\)\}\.(pdf|docx)\?v=5`)\);/g,(_,value,extension)=>'.forEach(e=>{e.href=window.__assetURL('+value+');e.download=`Ahmed_Alzahrani_IT_Systems_${lang.toUpperCase()}.'+extension+'`;});');
    bytes=new TextEncoder().encode(script);
   }
   const url=URL.createObjectURL(new Blob([bytes],{type:item.type}));urls.set(name,url);return url;
  }
  window.__assetURL=assetURL;
  const parsed=new DOMParser().parseFromString(pack.html,'text/html');
  for(const scope of [parsed,...Array.from(parsed.querySelectorAll('template'),t=>t.content)])for(const n of scope.querySelectorAll('[src],[href],[poster]'))for(const attr of ['src','href','poster']){
   const value=n.getAttribute(attr);if(!value||!pack.files[value.split('?')[0]])continue;
   n.setAttribute(attr,assetURL(value));
   if(n.hasAttribute('download'))n.setAttribute('download',value.split('?')[0].split('/').pop());
  }
  document.open();document.write('<!doctype html>'+parsed.documentElement.outerHTML);document.close();
  document.addEventListener('click',event=>{
   const a=event.target.closest?.('a');if(!a)return;const href=a.getAttribute('href');if(!href?.startsWith('#'))return;
   const id=href.slice(1),target=document.getElementById(id);if(!target)return;
   event.preventDefault();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
   history.replaceState(null,'',location.pathname+'#k='+keyText+'&s='+encodeURIComponent(id));
  },true);
  const section=params.get('s');if(section)requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById(section)?.scrollIntoView()));
 }catch{
  if(document.getElementById('status'))status.textContent=message;
 }
})();
