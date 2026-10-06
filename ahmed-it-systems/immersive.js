'use strict';
(() => {
 const hero=document.querySelector('.hero'),canvas=document.getElementById('circuit-field'),ctx=canvas.getContext('2d'),root=document.documentElement,dialog=document.getElementById('project-dialog');
 if(!ctx)return;
 let w=0,h=0,frame=0,last=0,t=0,visible=true,pointer={x:.5,y:.5,active:false},nodes=[];
 const fine=matchMedia('(hover:hover) and (pointer:fine)'),copy=document.querySelector('.hero-copy');
 const reduced=()=>root.dataset.motion==='reduced';
 function seed(){nodes=Array.from({length:w<760?25:48},(_,i)=>({x:((i*0.61803398875+.07)%1)*w,y:((i*.41421356237+.19)%1)*h,phase:i*1.7,r:i%3===0?2.2:1.1}));}
 function draw(){
  ctx.clearRect(0,0,w,h);const points=nodes.map(n=>({...n,x:n.x+Math.sin(t*.35+n.phase)*13,y:n.y+Math.cos(t*.3+n.phase)*16}));
  points.forEach((a,i)=>{
   for(let j=i+1;j<points.length;j++){const b=points[j],dist=Math.hypot(a.x-b.x,a.y-b.y);if(dist>150)continue;ctx.strokeStyle=`rgba(${i%2?'136,107,255':'54,208,242'},${(.13*(1-dist/150)).toFixed(3)})`;ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
   ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fillStyle=i%3===0?'#a291fa88':'#4bdaef77';ctx.fill();
  });
  // The pointer illuminates nearby circuit points; this is decorative, never telemetry.
  if(pointer.active&&!reduced()){const px=pointer.x*w,py=pointer.y*h;points.forEach((n,i)=>{const dist=Math.hypot(px-n.x,py-n.y);if(dist>210)return;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(n.x,n.y);ctx.strokeStyle=`rgba(${i%2?'163,126,255':'79,236,255'},${(.55*(1-dist/210)).toFixed(3)})`;ctx.lineWidth=1;ctx.stroke();});const glow=ctx.createRadialGradient(px,py,0,px,py,130);glow.addColorStop(0,'#46e2f51d');glow.addColorStop(1,'#46e2f500');ctx.fillStyle=glow;ctx.fillRect(px-130,py-130,260,260);}
 }
 function allowed(){return visible&&!reduced()&&!document.hidden&&!dialog.open;}
 function tick(time){frame=0;if(!allowed())return;if(time-last>=40){t+=Math.min((time-last)/1000,.06);last=time;draw();}frame=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(frame);frame=0;if(reduced()){pointer.active=false;copy.style.setProperty('--copy-x','0px');copy.style.setProperty('--copy-y','0px');document.querySelectorAll('[style*="--section-depth"]').forEach(el=>el.style.removeProperty('--section-depth'));}draw();if(allowed()){last=performance.now();frame=requestAnimationFrame(tick);}}
 function resize(){const b=hero.getBoundingClientRect();w=b.width;h=b.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);seed();draw();}
 hero.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||!fine.matches||reduced())return;const b=hero.getBoundingClientRect();pointer={x:(event.clientX-b.left)/w,y:(event.clientY-b.top)/h,active:true};copy.style.setProperty('--copy-x',((pointer.x-.5)*-8).toFixed(2)+'px');copy.style.setProperty('--copy-y',((pointer.y-.5)*-7).toFixed(2)+'px');});
 hero.addEventListener('pointerleave',()=>{pointer.active=false;copy.style.setProperty('--copy-x','0px');copy.style.setProperty('--copy-y','0px');});
 new ResizeObserver(resize).observe(hero);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;hero.classList.toggle('effects-outside',!visible);sync();},{threshold:.02}).observe(hero);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-motion']});new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});document.addEventListener('visibilitychange',sync);
 const cards=[...document.querySelectorAll('.expertise-card,.support-card,.project-card')];let scrolling=0;
 function depth(){scrolling=0;if(reduced()||!fine.matches||innerWidth<=760)return;cards.forEach((card,i)=>{const b=card.getBoundingClientRect();if(b.bottom<0||b.top>innerHeight)return;const shift=Math.max(-8,Math.min(8,(b.top-innerHeight*.4)*.012))*(i%2?1:-1);card.style.setProperty('--section-depth',shift.toFixed(2)+'px');});}
 addEventListener('scroll',()=>{if(!scrolling)scrolling=requestAnimationFrame(depth);},{passive:true});addEventListener('resize',depth);resize();sync();
})();
