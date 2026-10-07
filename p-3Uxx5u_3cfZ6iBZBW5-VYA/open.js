'use strict';
(async()=>{
 const status=document.getElementById('status'),params=new URLSearchParams(location.hash.slice(1)),keyText=params.get('k');
 const message='This link is incomplete or invalid. Ask the owner for the full sharing link.';
 if(!keyText||!/^[A-Za-z0-9_-]{43}$/.test(keyText)){status.textContent=message;return;}
 const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 try{
  const key=await crypto.subtle.importKey('raw',decode(keyText),'AES-GCM',false,['decrypt']);
  const parts=await Promise.all(["content-e4ed732ebecd0a-00.txt","content-e4ed732ebecd0a-01.txt","content-e4ed732ebecd0a-02.txt","content-e4ed732ebecd0a-03.txt","content-e4ed732ebecd0a-04.txt","content-e4ed732ebecd0a-05.txt","content-e4ed732ebecd0a-06.txt","content-e4ed732ebecd0a-07.txt","content-e4ed732ebecd0a-08.txt","content-e4ed732ebecd0a-09.txt","content-e4ed732ebecd0a-10.txt","content-e4ed732ebecd0a-11.txt","content-e4ed732ebecd0a-12.txt","content-e4ed732ebecd0a-13.txt","content-e4ed732ebecd0a-14.txt","content-e4ed732ebecd0a-15.txt","content-e4ed732ebecd0a-16.txt","content-e4ed732ebecd0a-17.txt","content-e4ed732ebecd0a-18.txt","content-e4ed732ebecd0a-19.txt","content-e4ed732ebecd0a-20.txt","content-e4ed732ebecd0a-21.txt","content-e4ed732ebecd0a-22.txt"].map(async name=>{const r=await fetch(name);if(!r.ok)throw Error('Unavailable');return r.text();}));
  const sealed=decode(parts.join(''));
  const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:sealed.slice(0,12),additionalData:new TextEncoder().encode('portfolio-package-v1')},key,sealed.slice(12));
  const unpacked=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const pack=JSON.parse(new TextDecoder().decode(unpacked)),urls=new Map();
  function assetURL(name){
   name=name.split('?')[0];if(urls.has(name))return urls.get(name);const item=pack.files[name];if(!item)return name;
   let bytes=decode(item.data);
   if(item.type==='text/html'){
    const doc=new DOMParser().parseFromString(new TextDecoder().decode(bytes),'text/html');
    doc.querySelectorAll('[src],[href],[poster]').forEach(n=>{for(const attr of ['src','href','poster']){const value=n.getAttribute(attr);if(!value)continue;const embedded=pack.files[value.split('?')[0]];if(value.startsWith('index.html'))n.setAttribute(attr,location.pathname+'#k='+keyText);else if(embedded&&value.split('?')[0]!==name){if(n.tagName==='LINK'&&n.rel==='stylesheet'){const style=doc.createElement('style');style.textContent=new TextDecoder().decode(decode(embedded.data));n.replaceWith(style);}else n.setAttribute(attr,'data:'+embedded.type+';base64,'+embedded.data);}}});
    bytes=new TextEncoder().encode('<!doctype html>'+doc.documentElement.outerHTML);
   }
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
