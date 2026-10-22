(function(root){
'use strict';
const ORIGIN='https://www.castorama.fr';
function same(a,b){return String(a??'').padStart(14,'0')===b.padStart(14,'0')}
function unescapeHtml(s){return String(s).replace(/&(?:amp|quot|apos|lt|gt|#x27|#39);/g,x=>({'&amp;':'&','&quot;':'"','&apos;':"'",'&#x27;':"'",'&#39;':"'",'&lt;':'<','&gt;':'>'}[x])).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))}
function extractProduct(html,code){
 const products=[];
 function walk(value){if(Array.isArray(value))return value.forEach(walk);if(!value||typeof value!=='object')return;if([value['@type']].flat().includes('Product'))products.push(value);if(value['@graph'])walk(value['@graph']);if(value.itemListElement)walk(value.itemListElement);if(value.item)walk(value.item)}
 for(const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{walk(JSON.parse(m[1].replace(/<!--[\s\S]*?-->/g,'').trim()))}catch{}}
 const product=products.find(p=>[p.gtin13,p.gtin12,p.gtin14,p.gtin8,p.gtin].some(v=>v&&same(v,code)));if(!product||typeof product.name!=='string')return null;
 const offers=Array.isArray(product.offers)?product.offers:[product.offers];const offer=offers.find(o=>o&&o.price!=null&&o.price!==''&&Number.isFinite(Number(o.price))&&Number(o.price)>=0&&o.priceCurrency==='EUR');
 const candidate=product.url||offer?.url;let url;try{const parsed=new URL(candidate,ORIGIN);if(parsed.origin!==ORIGIN||!parsed.pathname.endsWith('/'+code+'_CAFR.prd'))return null;url=parsed.href}catch{return null}
 return{code,name:unescapeHtml(product.name),price:offer?Number(offer.price):null,currency:'EUR',url,availability:offer?.availability?.split('/').pop()||null,checkedAt:new Date().toISOString(),source:'Castorama.fr'};
}
async function lookup(code,signal,fetcher=fetch){
 if(!/^(?:\d{8}|\d{12,14})$/.test(code))throw Error('invalid_code');
 const response=await fetcher('https://r.jina.ai/',{method:'POST',headers:{Accept:'text/plain','Content-Type':'application/json','X-Respond-With':'html','X-Engine':'direct'},body:JSON.stringify({url:ORIGIN+'/search?term='+encodeURIComponent(code)}),signal});
 if(!response.ok)throw Error(response.status===429?'reader_rate_limited':'reader_unavailable');
 const html=await response.text();if(html.length>5000000)throw Error('reader_response_too_large');
 return extractProduct(html,code);
}
root.CastoramaReader={lookup,extractProduct};
})(typeof globalThis==='undefined'?this:globalThis);
