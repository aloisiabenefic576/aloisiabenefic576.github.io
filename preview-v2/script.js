const header=document.getElementById('siteHeader');
const progress=document.getElementById('scrollProgress');
const updateScroll=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${max>0?scrollY/max*100:0}%`;header.classList.toggle('scrolled',scrollY>24)};
addEventListener('scroll',updateScroll,{passive:true});updateScroll();

const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const slider=document.getElementById('beforeAfter');
const after=document.getElementById('baAfter');
const divider=document.getElementById('baDivider');
let value=52,dragging=false,dir=1,autoTimer;
const render=v=>{value=Math.max(8,Math.min(92,v));after.style.clipPath=`inset(0 0 0 ${value}%)`;divider.style.left=`${value}%`;slider.setAttribute('aria-valuenow',Math.round(value))};
const fromX=x=>{const r=slider.getBoundingClientRect();render((x-r.left)/r.width*100)};
const stopAuto=()=>{clearInterval(autoTimer);autoTimer=null};
slider.addEventListener('pointerdown',e=>{dragging=true;stopAuto();slider.setPointerCapture(e.pointerId);fromX(e.clientX)});
slider.addEventListener('pointermove',e=>{if(dragging)fromX(e.clientX)});
slider.addEventListener('pointerup',()=>dragging=false);
slider.addEventListener('pointercancel',()=>dragging=false);
slider.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();stopAuto();render(value-3)}if(e.key==='ArrowRight'){e.preventDefault();stopAuto();render(value+3)}});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){autoTimer=setInterval(()=>{if(dragging)return;value+=.22*dir;if(value>72||value<32)dir*=-1;render(value)},42)}
render(value);

const form=document.getElementById('calculatorForm');
const rangeEl=document.getElementById('priceRange');
const savingEl=document.getElementById('savingValue');
const timeEl=document.getElementById('timeValue');
const fmt=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(Math.round(n));
const config={objectType:{commercial:1.14,office:1.1,private:1,auto:.78},damage:{scratches:1,welding:1.34,haze:.86,construction:.92},depth:{light:.72,medium:1,deep:1.48},access:{easy:1,medium:1.18,hard:1.58},urgency:{standard:1,fast:1.16,today:1.36}};
let current={low:0,high:0,saving:0,time:''};
function calculate(){const d=new FormData(form);const area=Math.max(.2,Number(d.get('area'))||.2);const pieces=Math.max(1,Number(d.get('pieces'))||1);const replacement=Math.max(0,Number(d.get('replacement'))||0);const glass=d.get('objectType')==='auto'?'auto':'architectural';const rate=glass==='auto'?3300:5100;let mid=area*rate*config.objectType[d.get('objectType')]*config.damage[d.get('damage')]*config.depth[d.get('depth')]*config.access[d.get('access')]*config.urgency[d.get('urgency')]+pieces*700;mid=Math.max(4000,mid);const low=Math.max(4000,mid*.86),high=mid*1.14;const replacementBase=replacement||mid*2.35;const saving=Math.max(0,Math.min(replacementBase-mid,replacementBase*.67));const days=area<=4?'от нескольких часов':area<=15?'1–3 дня':'от 3 дней';current={low,high,saving,time:days};rangeEl.textContent=`${fmt(low)}–${fmt(high)} ₽`;savingEl.textContent=saving>0?`до ${fmt(saving)} ₽`:'после оценки';timeEl.textContent=days}
form.addEventListener('input',calculate);calculate();

const toast=document.getElementById('toast');
document.getElementById('sendCalculation').addEventListener('click',async()=>{const d=new FormData(form);const text=`Здравствуйте. Хочу получить оценку работ.\nОбъект: ${form.objectType.options[form.objectType.selectedIndex].text}\nПлощадь: ${d.get('area')} м²\nЭлементов: ${d.get('pieces')}\nПовреждение: ${form.damage.options[form.damage.selectedIndex].text}\nГлубина: ${form.depth.options[form.depth.selectedIndex].text}\nДоступ: ${form.access.options[form.access.selectedIndex].text}\nСрочность: ${form.urgency.options[form.urgency.selectedIndex].text}\nОриентир восстановления: ${fmt(current.low)}–${fmt(current.high)} ₽\nПотенциальная экономия: до ${fmt(current.saving)} ₽`;
try{await navigator.clipboard.writeText(text)}catch(e){}
toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2500);setTimeout(()=>window.open('https://t.me/zhukov_boss','_blank','noopener'),180)});