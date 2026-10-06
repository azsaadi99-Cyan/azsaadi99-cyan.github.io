'use strict';
const stages={
 requirements:{n:'01',ar:['تحديد الاحتياج التقني','فهم طبيعة عمل المنشأة وما تحتاجه من أجهزة وأنظمة واتصال، لتحديد التجهيز المناسب.'],en:['IT requirements','Understand the business workflow and its equipment, systems and connectivity requirements to select a suitable setup.']},
 devices:{n:'02',ar:['اختيار الأجهزة وتوريدها','اختيار الأجهزة المناسبة للاستخدام والميزانية، والتنسيق مع الموردين لتوفيرها وتركيبها.'],en:['Equipment selection & sourcing','Select equipment suited to business use and budget, coordinate sourcing with suppliers and install it.']},
 network:{n:'03',ar:['أساسيات الاتصال والشبكات','معرفة بأساسيات العنونة والتوجيه والتحويل وخدمات الشبكات ضمن شهادة CCNA.'],en:['Connectivity fundamentals','CCNA foundational knowledge of addressing, routing, switching and network services.']},
 systems:{n:'04',ar:['تهيئة الأنظمة والأجهزة','إعداد الأجهزة والأنظمة للاستخدام، وربطها ببيئة العمل التقنية في المنشأة.'],en:['Systems & device configuration','Configure devices and systems for use and connect them to the business IT environment.']}
};
const order=Object.keys(stages),root=document.documentElement;
const board=document.querySelector('.system-board'),frame=document.querySelector('.scene-frame');
const runButton=document.getElementById('run-sequence'),motionButton=document.getElementById('motion-setting');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),finePointer=matchMedia('(hover: hover) and (pointer: fine)');
let lang='ar',stage='requirements',playing=false,sequenceTimer=null,userReduced=false;
try{userReduced=localStorage.getItem('ahmed-it-reduce-motion')==='true';}catch{}
function motionOff(){return reduced.matches||userReduced;}
function updateRunLabel(){
 const off=motionOff();runButton.disabled=off;runButton.setAttribute('aria-pressed',String(playing));
 document.getElementById('run-label').textContent=lang==='ar'?(playing?'إيقاف المسار':'تشغيل المسار'):(playing?'Pause sequence':'Play sequence');
 runButton.title=off?(lang==='ar'?'الحركة مخففة؛ اختر المراحل يدويًا':'Motion is reduced; select stages manually'):'';
}
function stopSequence(){clearTimeout(sequenceTimer);sequenceTimer=null;playing=false;updateRunLabel();}
function showStage(key,animate=true){
 if(!stages[key])return;
 const changed=stage!==key;stage=key;const info=stages[key],index=order.indexOf(key);board.dataset.currentStage=key;
 document.querySelectorAll('[data-stage],[data-flow-step]').forEach(b=>{const selected=(b.dataset.stage||b.dataset.flowStep)===key;b.classList.toggle('active',selected);b.classList.toggle('visited',!!b.dataset.flowStep&&order.indexOf(b.dataset.flowStep)<index);b.setAttribute('aria-pressed',String(selected));});
 document.querySelectorAll('[data-route]').forEach(p=>p.classList.toggle('lit',p.dataset.route===key||p.dataset.route==='requirements'));
 document.querySelectorAll('[data-packet]').forEach(p=>p.classList.toggle('lit',p.dataset.packet===key||p.dataset.packet==='requirements'));
 document.querySelectorAll('.work-list li').forEach((el,i)=>el.classList.toggle('current-step',i===index));
 document.querySelector('.detail-index').textContent=info.n;document.getElementById('stage-title').textContent=info[lang][0];document.getElementById('stage-description').textContent=info[lang][1];
 if(changed&&animate&&!motionOff())document.querySelector('.board-detail').animate([{opacity:.65},{opacity:1}],{duration:280,easing:'ease-out'});
}
function selectManually(key){stopSequence();showStage(key);}
document.querySelectorAll('[data-stage]').forEach(b=>{
 b.addEventListener('click',()=>selectManually(b.dataset.stage));
 b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&finePointer.matches)selectManually(b.dataset.stage);});
 b.addEventListener('focus',()=>selectManually(b.dataset.stage));
});
document.querySelectorAll('[data-flow-step]').forEach(b=>b.addEventListener('click',()=>selectManually(b.dataset.flowStep)));
document.querySelectorAll('[data-stage],[data-flow-step]').forEach(b=>b.addEventListener('keydown',e=>{
 if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
 e.preventDefault();const current=b.dataset.stage||b.dataset.flowStep,index=order.indexOf(current);
 const next=e.key==='Home'?0:e.key==='End'?3:(index+(['ArrowRight','ArrowDown'].includes(e.key)?1:3))%4;
 const attr=b.dataset.stage?'data-stage':'data-flow-step';document.querySelector(`[${attr}="${order[next]}"]`).focus();selectManually(order[next]);
}));
runButton.addEventListener('click',()=>{
 if(playing){stopSequence();return;}if(motionOff())return;
 playing=true;showStage(order[0]);updateRunLabel();let index=0;
 function advance(){if(!playing||document.hidden||motionOff()){stopSequence();return;}index++;if(index>=order.length){stopSequence();return;}showStage(order[index]);sequenceTimer=setTimeout(advance,1900);}
 sequenceTimer=setTimeout(advance,1900);
});
function setLanguage(next){
 lang=next;root.lang=lang;root.dir=lang==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-ar][data-en]').forEach(e=>e.innerHTML=e.dataset[lang]);
 document.querySelectorAll('[data-label-ar]').forEach(e=>e.setAttribute('aria-label',e.getAttribute('data-label-'+lang)));
 document.title=lang==='ar'?'أحمد حسن الزهراني | نظم المعلومات والشبكات':'Ahmed Hassen Alzahrani | Information Systems & Networks';
 const toggle=document.getElementById('language');toggle.innerHTML=lang==='ar'?'English <span aria-hidden="true">↗</span>':'العربية <span aria-hidden="true">↗</span>';toggle.lang=lang==='ar'?'en':'ar';toggle.setAttribute('aria-label',lang==='ar'?'Switch to English':'التبديل إلى العربية');
 document.querySelectorAll('.cv-current').forEach(e=>e.href=`assets/Ahmed_Alzahrani_IT_Systems_${lang.toUpperCase()}.pdf?v=5`);
 document.querySelectorAll('.word-current').forEach(e=>e.href=`assets/Ahmed_Alzahrani_IT_Systems_${lang.toUpperCase()}.docx?v=5`);
 showStage(stage,false);updateMotionLabel();updateRunLabel();
}
document.getElementById('language').addEventListener('click',()=>setLanguage(lang==='ar'?'en':'ar'));
function updateMotionLabel(){
 const off=motionOff();motionButton.setAttribute('aria-pressed',String(off));motionButton.disabled=reduced.matches;
 const label=reduced.matches?(lang==='ar'?'الحركة مخففة حسب إعدادات جهازك':'Motion reduced by your device settings'):(lang==='ar'?(off?'تشغيل التأثيرات':'تقليل الحركة'):(off?'Enable effects':'Reduce motion'));
 motionButton.setAttribute('aria-label',label);motionButton.title=label;
}
let targetX=0,targetY=0,currentX=0,currentY=0,pointerFrame=0;
function resetDepth(){targetX=targetY=currentX=currentY=0;cancelAnimationFrame(pointerFrame);pointerFrame=0;board.style.setProperty('--tilt-x','0deg');board.style.setProperty('--tilt-y','0deg');board.style.setProperty('--board-offset','0px');}
function applyMotion(){root.dataset.motion=motionOff()?'reduced':'full';updateMotionLabel();if(motionOff()){stopSequence();resetDepth();document.querySelectorAll('.will-reveal').forEach(el=>el.classList.add('is-visible'));}updateRunLabel();}
motionButton.addEventListener('click',()=>{userReduced=!userReduced;try{localStorage.setItem('ahmed-it-reduce-motion',String(userReduced));}catch{}applyMotion();scheduleScroll();});
reduced.addEventListener('change',()=>{applyMotion();scheduleScroll();});
function renderDepth(){
 if(motionOff()||!finePointer.matches||document.hidden){resetDepth();return;}
 currentX+=(targetX-currentX)*.13;currentY+=(targetY-currentY)*.13;
 board.style.setProperty('--tilt-x',`${(-currentY*6.2).toFixed(3)}deg`);board.style.setProperty('--tilt-y',`${(currentX*7.2).toFixed(3)}deg`);
 if(Math.abs(targetX-currentX)+Math.abs(targetY-currentY)>.005)pointerFrame=requestAnimationFrame(renderDepth);else pointerFrame=0;
}
frame.addEventListener('pointermove',e=>{
 if(e.pointerType!=='mouse'||motionOff()||!finePointer.matches||innerWidth<=760)return;
 const box=frame.getBoundingClientRect(),x=(e.clientX-box.left)/box.width,y=(e.clientY-box.top)/box.height;
 targetX=(x-.5)*2;targetY=(y-.5)*2;board.style.setProperty('--light-x',`${x*100}%`);board.style.setProperty('--light-y',`${y*100}%`);
 if(!pointerFrame)pointerFrame=requestAnimationFrame(renderDepth);
});
frame.addEventListener('pointerleave',()=>{targetX=targetY=0;if(!pointerFrame&&!motionOff())pointerFrame=requestAnimationFrame(renderDepth);});
finePointer.addEventListener('change',resetDepth);
document.querySelectorAll('.expertise-card,.support-card,.project-card,.resume-bar,.hero .button').forEach(el=>{
 let pending=0,lastX=0,lastY=0;
 el.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||motionOff()||!finePointer.matches)return;
  const b=el.getBoundingClientRect();lastX=(e.clientX-b.left)/b.width;lastY=(e.clientY-b.top)/b.height;
  if(!pending)pending=requestAnimationFrame(()=>{pending=0;if(motionOff())return;el.style.setProperty('--light-x',`${lastX*100}%`);el.style.setProperty('--light-y',`${lastY*100}%`);if(el.classList.contains('button')){el.style.setProperty('--magnet-x',`${(lastX-.5)*6}px`);el.style.setProperty('--magnet-y',`${(lastY-.5)*5}px`);}});
 });
 el.addEventListener('pointerleave',()=>{cancelAnimationFrame(pending);pending=0;el.style.setProperty('--magnet-x','0px');el.style.setProperty('--magnet-y','0px');});
});
let scrollFrame=0;const experience=document.getElementById('experience');
function updateScroll(){
 scrollFrame=0;const maximum=Math.max(root.scrollHeight-innerHeight,1);root.style.setProperty('--reading-progress',String(Math.min(scrollY/maximum,1)));
 if(!motionOff()&&finePointer.matches&&innerWidth>760){board.style.setProperty('--board-offset',`${Math.min(scrollY*.045,16)}px`);const b=experience.getBoundingClientRect();experience.style.setProperty('--experience-shift',`${Math.max(-16,Math.min(16,b.top*.025))}px`);}else{board.style.setProperty('--board-offset','0px');experience.style.setProperty('--experience-shift','0px');}
}
function scheduleScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);}
addEventListener('scroll',scheduleScroll,{passive:true});addEventListener('resize',()=>{resetDepth();scheduleScroll();});
if('IntersectionObserver' in window){
 const visibility=new IntersectionObserver(entries=>entries.forEach(entry=>{frame.classList.toggle('is-outside',!entry.isIntersecting);if(!entry.isIntersecting)stopSequence();}),{threshold:.05});visibility.observe(frame);
 const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}}),{threshold:.08});
 document.querySelectorAll('.section-heading,.expertise-card,.support-card,.project-card,.profile-grid>article,.resume-bar,.contact-inner>div').forEach((el,i)=>{if(motionOff())return;el.classList.add('will-reveal');el.style.setProperty('--reveal-delay',`${i%3*65}ms`);reveal.observe(el);});
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopSequence();resetDepth();frame.classList.add('is-outside');}else{frame.classList.toggle('is-outside',frame.getBoundingClientRect().bottom<0||frame.getBoundingClientRect().top>innerHeight);scheduleScroll();}});
applyMotion();showStage(stage,false);updateScroll();
