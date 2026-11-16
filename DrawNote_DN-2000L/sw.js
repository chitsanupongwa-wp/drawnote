const CACHE='drawnote-v20',SHARE='drawnote-share',LIB='drawnote-lib-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-192.png','./icon-maskable-512.png'];
const LIBS=['https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.min.js','https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js','https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
const CDN=/^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.all(ASSETS.map(u=>c.add(u).catch(()=>{})));
  const l=await caches.open(LIB);for(const u of LIBS){try{if(!(await l.match(u))){const r=await fetch(u,{mode:'cors'});if(r.ok)await l.put(u,r)}}catch(err){}}})());self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==SHARE&&k!==LIB).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method==='POST'&&u.pathname.endsWith('/share-target')){
    e.respondWith((async()=>{
      try{const fd=await e.request.formData();const files=fd.getAll('files').filter(f=>f&&f.size);const c=await caches.open(SHARE);let i=0;
        for(const f of files){await c.put(new Request('./shared/'+Date.now()+'-'+(i++)),new Response(f,{headers:{'Content-Type':f.type||'application/octet-stream','X-Name':encodeURIComponent(f.name||'file')}}))}
        return Response.redirect('./?share='+files.length,303)}
      catch(err){return Response.redirect('./?share=0',303)}})());
    return}
  if(e.request.method!=='GET')return;
  if(CDN.test(e.request.url)){e.respondWith(caches.open(LIB).then(c=>c.match(e.request.url).then(r=>r||fetch(e.request).then(res=>{if(res.ok||res.type==='opaque')c.put(e.request.url,res.clone());return res}))));return}
  if(u.origin!==location.origin)return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return res})));
});
