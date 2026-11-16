const CACHE='drawnote-v5',SHARE='drawnote-share';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-192.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==SHARE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method==='POST'&&u.pathname.endsWith('/share-target')){
    e.respondWith((async()=>{
      try{const fd=await e.request.formData();const files=fd.getAll('files').filter(f=>f&&f.size);const c=await caches.open(SHARE);let i=0;
        for(const f of files){await c.put(new Request('./shared/'+Date.now()+'-'+(i++)),new Response(f,{headers:{'Content-Type':f.type||'application/octet-stream','X-Name':encodeURIComponent(f.name||'file')}}))}
        return Response.redirect('./?share='+files.length,303)}
      catch(err){return Response.redirect('./?share=0',303)}})());
    return}
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return res})));
});
