(function(root){
'use strict';
const text=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&(?:amp|quot|apos|lt|gt|nbsp|#39|#x27);/g,c=>({'&amp;':'&','&quot;':'"','&apos;':"'",'&#39;':"'",'&#x27;':"'",'&lt;':'<','&gt;':'>','&nbsp;':' '}[c])).replace(/&#(\d+);/g,(m,n)=>Number(n)<=1114111?String.fromCodePoint(Number(n)):m).replace(/\s+/g,' ').trim();
function amount(value){const s=String(value??'').replace(/[\s\u00a0\u202f]/g,'');if(!/^\d+(?:[.,]\d{1,2})?$/.test(s))return null;const n=Number(s.replace(',','.'));return Number.isFinite(n)&&n>=0?n:null}
function extract(results,ean){
 for(const result of results||[]){let url;try{url=new URL(result.url||result.unescapedUrl);if(url.protocol!=='https:'||!['www.castorama.fr','castorama.fr'].includes(url.hostname))continue;const code=url.pathname.match(/\/(\d{8,14})_CAFR\.prd$/)?.[1];if(!code||code.padStart(14,'0')!==ean.padStart(14,'0'))continue}catch{continue}
  const title=text(result.titleNoFormatting||result.title).replace(/\s*[|–-]\s*Castorama\s*$/i,'').trim();if(!title)continue;
  const prices=[];function add(value,currency){if(String(currency||'').toUpperCase()!=='EUR')return;const n=amount(value);if(n!==null)prices.push(n)}
  const rich=result.richSnippet||{};function visit(value,key='',depth=0){if(depth>7||!value||typeof value!=='object')return;if(Array.isArray(value)){value.forEach(v=>visit(v,key,depth+1));return}if(/offer|product|pricespecification/i.test(key)||value['@type']==='Offer')add(value.price,value.pricecurrency||value.priceCurrency||value.currency);add(value['product:price:amount'],value['product:price:currency']);for(const[k,v]of Object.entries(value))if(v&&typeof v==='object')visit(v,k,depth+1)}visit(rich);
  let unique=[...new Set(prices)];let price=unique.length===1?unique[0]:null;let priceEvidence=unique.length===1?'structured':null;
  if(!unique.length){const snippet=text(result.contentNoFormatting||result.content);if(!/(?:à partir|a partir|\/\s*(?:m[²2]|l\b|litre|kg)|par\s+(?:litre|m[²2]|kg))/i.test(snippet)){const found=[...snippet.matchAll(/\b(\d+(?:[.,]\d{1,2})?)\s*(?:€|EUR\b)/g)].map(m=>amount(m[1]));unique=[...new Set(found.filter(n=>n!==null))];if(unique.length===1){price=unique[0];priceEvidence='snippet'}}}
  return {code:ean,name:title,price,currency:'EUR',url:url.href,indexed:true,source:'Résultat Google pour Castorama',checkedAt:new Date().toISOString(),priceEvidence};
 }return null;
}
function engineId(raw){const value=String(raw||'').trim();const cx=value.match(/[?&]cx=([a-zA-Z0-9:_-]+)/)?.[1]||value;return /^[a-zA-Z0-9:_-]{5,100}$/.test(cx)?cx:null}
const api={extract,engineId};if(typeof module==='object'&&module.exports)module.exports=api;else root.GoogleProductCore=api;
})(typeof globalThis==='undefined'?this:globalThis);
