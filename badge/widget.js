(function(){
  const s=document.currentScript;
  const project=s?.dataset?.project||'OrigoSeal';
  const host=location.host;
  const base=location.pathname.split('/').slice(0,2).join('/');
  const a=document.createElement('a');
  a.href= base? base+'/' : '/';
  a.className='btn primary';
  a.textContent='Verified by '+project;
  const t=document.getElementById('preview')||document.body;
  t.appendChild(a);
})();
