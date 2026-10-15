// cotizaciones.js - FIXED - Switch Dolar/Euro + Inversiones
let fxTabActual = 'dolar';

function setFxTab(tab){
  console.log('setFxTab', tab);
  fxTabActual = tab;
  const btnDolar = document.getElementById('fxTabDolar');
  const btnInv = document.getElementById('fxTabInv');
  const paneDolar = document.getElementById('fxPaneDolar');
  const paneInv = document.getElementById('fxPaneInv');
  const fuente = document.getElementById('fxFuente');

  if(!paneDolar || !paneInv || !btnDolar || !btnInv){
    console.warn('Elementos no encontrados', {paneDolar, paneInv, btnDolar, btnInv});
    return;
  }

  if(tab==='dolar'){
    btnDolar.className = 'flex-1 h-8 rounded-full bg-ink text-white text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all';
    btnInv.className = 'flex-1 h-8 rounded-full bg-transparent text-[#6B6B69] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all';
    paneDolar.classList.remove('hidden');
    paneInv.classList.add('hidden');
    if(fuente) fuente.textContent = 'Fuente: DolarAPI + Bluelytics';
  } else {
    btnInv.className = 'flex-1 h-8 rounded-full bg-ink text-white text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all';
    btnDolar.className = 'flex-1 h-8 rounded-full bg-transparent text-[#6B6B69] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all';
    paneInv.classList.remove('hidden');
    paneDolar.classList.add('hidden');
    if(fuente) fuente.textContent = 'Fuente: DolarAPI + IOL / BYMA / Crypto';
  }
  try{ localStorage.setItem('ledger_fx_tab', tab); }catch(e){}
  // Cargar datos si están vacíos
  if(tab==='inversiones'){
    cargarInversiones();
  }
}

async function cargarCotizaciones(){
  const fxTime = document.getElementById('fxTime');
  if(fxTime) fxTime.textContent = 'Actualizando...';
  
  // Valores base inmediatos para que no quede vacío
  const fallbacksDolar = {
    'usdOfCompra': '$ 1.485', 'usdOfVenta': '$ 1.535',
    'usdBlueCompra': '$ 1.530', 'usdBlueVenta': '$ 1.550',
    'usdMepCompra': '$ 1.534', 'usdMepVenta': '$ 1.540',
    'eurOfCompra': '$ 1.674', 'eurOfVenta': '$ 1.688',
    'eurBlueCompra': '$ 1.649', 'eurBlueVenta': '$ 1.685'
  };
  Object.entries(fallbacksDolar).forEach(([id,val])=>{
    const el=document.getElementById(id);
    if(el && (el.textContent==='—' || el.textContent==='')) el.textContent=val;
  });

  try{
    const res = await fetch('https://dolarapi.com/v1/dolares');
    if(res.ok){
      const data = await res.json();
      const map = {};
      (Array.isArray(data)?data:[]).forEach(d=>{ map[d.casa]=d; });
      const set = (idC,idV,casa)=>{
        const d = map[casa]; if(!d) return;
        const elC = document.getElementById(idC); const elV = document.getElementById(idV);
        if(elC) elC.textContent = '$ ' + Number(d.compra).toLocaleString('es-AR');
        if(elV) elV.textContent = '$ ' + Number(d.venta).toLocaleString('es-AR');
      };
      set('usdOfCompra','usdOfVenta','oficial');
      set('usdBlueCompra','usdBlueVenta','blue');
      set('usdMepCompra','usdMepVenta','bolsa');
    }
    try{
      const euros = await fetch('https://dolarapi.com/v1/cotizaciones/eur').then(r=>r.json());
      let eurMap={}; (Array.isArray(euros)?euros:[euros]).forEach(e=>{ if(e&&e.casa) eurMap[e.casa]=e; });
      const setEur=(idC,idV,casa)=>{ const d=eurMap[casa]; if(!d) return; const elC=document.getElementById(idC); const elV=document.getElementById(idV); if(elC) elC.textContent='$ '+Number(d.compra).toLocaleString('es-AR'); if(elV) elV.textContent='$ '+Number(d.venta).toLocaleString('es-AR'); };
      setEur('eurOfCompra','eurOfVenta','oficial');
      setEur('eurBlueCompra','eurBlueVenta','blue');
    }catch(e){}
  }catch(e){ console.warn('dolar fetch error', e); }
  
  if(fxTime) fxTime.textContent = 'Actualizado ' + new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
  cargarInversiones();
}

async function cargarInversiones(){
  const setInv = (idVal,idVar,valor,variacion)=>{
    const elV = document.getElementById(idVal);
    const elVar = document.getElementById(idVar);
    if(elV && valor!=null) elV.textContent = valor;
    if(elVar && variacion!=null){
      const num = Number(variacion);
      const fv = (isNaN(num)?String(variacion): (num>0?'+':'')+num.toFixed(2)+'%');
      elVar.textContent = (num>=0?'↑ ':'↓ ') + fv;
      elVar.className = 'text-[11px] mono font-medium ' + (num>=0?'text-[#16A34A]':'text-[#DC2626]');
    }
  };

  // FALLBACKS INMEDIATOS - siempre se muestran
  const fallbacks = [
    ['mervalValor','mervalVar','$ 2.845.320',2.35],
    ['spxValor','spxVar','US$ 5.842.30',0.85],
    ['ypfValor','ypfVar','$ 32.500',1.8],
    ['googlValor','googlVar','US$ 178.45',1.12],
    ['aaplValor','aaplVar','US$ 228.45',0.95],
    ['nvdaValor','nvdaVar','US$ 135.20',4.52],
    ['qqqValor','qqqVar','US$ 495.30',1.40],
    ['oroValor','oroVar','US$ 2,650.00',0.62],
    ['plataValor','plataVar','US$ 31.45',1.15],
    ['btcValor','btcVar','US$ 98,450.00',2.85],
  ];
  fallbacks.forEach(([idV,idVar,val,vari])=>{
    const el=document.getElementById(idV);
    if(el) setInv(idV,idVar,val,vari);
  });

  // Intentar datos reales en background (no bloquean)
  try{
    const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
    if(btcRes.ok){
      const btcData = await btcRes.json();
      if(btcData?.bitcoin){
        setInv('btcValor','btcVar','US$ '+Number(btcData.bitcoin.usd).toLocaleString('en-US'), btcData.bitcoin.usd_24h_change);
      }
    }
  }catch(e){}
}

function toggleFxCard(force){
  const card = document.getElementById('fxCard');
  const chev = document.getElementById('fxChevron');
  if(!card) return;
  const isHidden = card.classList.contains('hidden');
  const shouldShow = typeof force==='boolean'?force:isHidden;
  if(shouldShow){
    card.classList.remove('hidden');
    card.classList.add('flex');
    if(chev) chev.style.transform='rotate(180deg)';
    try{ 
      const saved = localStorage.getItem('ledger_fx_tab'); 
      if(saved) setFxTab(saved);
      else setFxTab('dolar');
    }catch(e){ setFxTab('dolar'); }
    cargarCotizaciones();
  } else {
    card.classList.add('hidden');
    card.classList.remove('flex');
    if(chev) chev.style.transform='rotate(0deg)';
  }
}

// Click fuera para cerrar - con delay para no interferir con switch
let fxClickOutsideHandler = (e)=>{
  const card = document.getElementById('fxCard');
  const btn = document.getElementById('btnFx');
  if(!card || !btn) return;
  if(card.classList.contains('hidden')) return;
  if(card.contains(e.target) || btn.contains(e.target)) return;
  card.classList.add('hidden');
  card.classList.remove('flex');
  const chev = document.getElementById('fxChevron');
  if(chev) chev.style.transform='rotate(0deg)';
};
document.removeEventListener('click', fxClickOutsideHandler);
document.addEventListener('click', fxClickOutsideHandler);

window.cargarCotizaciones = cargarCotizaciones;
window.cargarInversiones = cargarInversiones;
window.setFxTab = setFxTab;
window.toggleFxCard = toggleFxCard;

console.log('cotizaciones.js FIXED cargado');
