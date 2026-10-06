'use strict';
(() => {
 const canvas=document.getElementById('hologram'),context=canvas.getContext('2d');
 const diagram=canvas.parentElement,dialog=document.getElementById('project-dialog'),content=document.getElementById('project-dialog-content');
 let width=0,height=0,angle=0,raf=0,last=0,inView=true,opener=null,previousOverflow='';
 function translate(scope){const language=document.documentElement.lang==='en'?'en':'ar';scope.querySelectorAll('[data-ar][data-en]').forEach(el=>el.innerHTML=el.dataset[language]);scope.querySelectorAll('[data-alt-ar]').forEach(el=>el.alt=el.getAttribute('data-alt-'+language));scope.querySelectorAll('[data-label-ar]').forEach(el=>el.setAttribute('aria-label',el.getAttribute('data-label-'+language)));}
 document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{
  const template=document.getElementById('project-'+button.dataset.project);if(!template)return;
  opener=button;content.replaceChildren(template.content.cloneNode(true));translate(content);
  previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();dialog.scrollTop=0;sync();
 }));
 document.getElementById('close-project').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();});
 dialog.addEventListener('close',()=>{content.querySelectorAll('video').forEach(video=>video.pause());document.body.style.overflow=previousOverflow;content.replaceChildren();opener?.focus({preventScroll:true});sync();});
 const languageObserver=new MutationObserver(()=>{translate(document);if(dialog.open)translate(content);});languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 document.querySelectorAll('.project-card').forEach(card=>{
  card.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||document.documentElement.dataset.motion==='reduced')return;const b=card.getBoundingClientRect();const x=(event.clientX-b.left)/b.width,y=(event.clientY-b.top)/b.height;card.style.setProperty('--card-x',((.5-y)*5).toFixed(2)+'deg');card.style.setProperty('--card-y',((x-.5)*7).toFixed(2)+'deg');});
  card.addEventListener('pointerleave',()=>{card.style.setProperty('--card-x','0deg');card.style.setProperty('--card-y','0deg');});
 });
 if(!context)return;
 function project(x,y,z){const ca=Math.cos(angle),sa=Math.sin(angle),x1=x*ca+z*sa,z1=-x*sa+z*ca;const cy=Math.cos(.32),sy=Math.sin(.32),y1=y*cy-z1*sy,z2=y*sy+z1*cy;const radius=Math.min(width*.23,height*.32),depth=3.8/(3.8-z2);return [width*.5+x1*radius*depth,height*.49+y1*radius*depth,z2];}
 function draw(){
  context.clearRect(0,0,width,height);const simple=width<370;const segments=simple?28:44;
  function ring(latitude,longitude){const points=[];for(let i=0;i<=segments;i++){const t=i/segments*Math.PI*2;let x,y,z;if(latitude!==null){const r=Math.cos(latitude);x=Math.cos(t)*r;y=Math.sin(latitude);z=Math.sin(t)*r;}else{x=Math.cos(t)*Math.cos(longitude);y=Math.sin(t);z=Math.cos(t)*Math.sin(longitude);}points.push(project(x,y,z));}for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],front=(a[2]+b[2])/2;context.strokeStyle=front>0?'rgba(78,222,249,'+(0.12+front*.29)+')':'rgba(168,133,255,.12)';context.lineWidth=front>0?1:.65;context.beginPath();context.moveTo(a[0],a[1]);context.lineTo(b[0],b[1]);context.stroke();}}
  for(let i=-3;i<=3;i++)ring(i*Math.PI/8,null);for(let i=0;i<(simple?8:12);i++)ring(null,i*Math.PI/(simple?8:12));
  for(let i=0;i<7;i++){const p=project(Math.cos(i*1.77)*.87,Math.sin(i*1.19)*.5,Math.sin(i*1.77)*.87);context.beginPath();context.arc(p[0],p[1],p[2]>0?2:1.2,0,Math.PI*2);context.fillStyle=i%2?'#b394ff':'#7becff';context.fill();}
 }
 function resize(){const b=diagram.getBoundingClientRect();width=b.width;height=b.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);draw();}
 function allowed(){return inView&&!document.hidden&&!dialog.open&&document.documentElement.dataset.motion!=='reduced';}
 function tick(time){raf=0;if(!allowed())return;if(time-last>40){angle+=Math.min((time-last)/1000,.05)*.18;last=time;draw();}raf=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(raf);raf=0;if(allowed()){last=performance.now();raf=requestAnimationFrame(tick);}else draw();}
 new ResizeObserver(resize).observe(diagram);
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.02}).observe(diagram);
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
 document.addEventListener('visibilitychange',sync);resize();sync();
})();
