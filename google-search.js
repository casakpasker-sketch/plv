(function(){
'use strict';
const KEY='plv-google-engine',name='plv-google-results';let cx='',loading=null,active=null,chain=Promise.resolve();const $=id=>document.getElementById(id);
try{cx=GoogleProductCore.engineId(localStorage.getItem(KEY))||''}catch{}
function status(s){$('google-status').textContent=s}
function configured(){return !!cx}
function init(){if(loading)return loading;if(!cx)return Promise.reject(Error('google_not_configured'));
 loading=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('google_load_timeout')),15000);window.__gcse={parsetags:'explicit',initializationCallback(){try{window.google.search.cse.element.render({div:'google-results',tag:'searchresults-only',gname:name,attributes:{linkTarget:'_blank',webSearchResultSetSize:10}});clearTimeout(timer);status('Google activé sur cet appareil. Les prix indexés sont à vérifier sur la fiche Castorama.');resolve()}catch(e){clearTimeout(timer);reject(e)}},searchCallbacks:{web:{ready(gname,query,promos,results){if(gname!==name||!active||!String(query).includes(active.code))return;const task=active;active=null;clearTimeout(task.timer);task.signal?.removeEventListener('abort',task.abort);const product=GoogleProductCore.extract(results,task.code);if(product)task.resolve(product);else task.reject(Error('google_no_exact_result'));return undefined}}}};
 const script=document.createElement('script');script.async=true;script.src='https://cse.google.com/cse.js?cx='+encodeURIComponent(cx);script.onerror=()=>{clearTimeout(timer);reject(Error('google_load_failed'))};document.head.append(script);
 });return loading;
}
function lookup(code,signal){const run=chain.catch(()=>{}).then(async()=>{if(signal?.aborted)throw new DOMException('Aborted','AbortError');await init();if(signal?.aborted)throw new DOMException('Aborted','AbortError');status('Recherche Google : '+code);return new Promise((resolve,reject)=>{const task={code,resolve,reject,signal,timer:null,abort:null};task.abort=()=>{if(active===task)active=null;clearTimeout(task.timer);reject(new DOMException('Aborted','AbortError'))};task.timer=setTimeout(()=>{if(active===task)active=null;signal?.removeEventListener('abort',task.abort);status('Google n’a pas répondu. Vérifiez le moteur configuré et les éventuels bloqueurs de contenu.');reject(Error('google_search_timeout'))},20000);signal?.addEventListener('abort',task.abort,{once:true});active=task;try{window.google.search.cse.element.getElement(name).execute('site:castorama.fr "'+code+'"')}catch(e){task.abort();reject(e)}})});chain=run.catch(()=>{});return run}
$('google-engine').value=cx;$('google-settings').open=!cx;
status(cx?'Moteur enregistré. Les recherches Google démarreront au prochain scan.':'Une configuration Google gratuite est nécessaire une seule fois.');
$('google-setup').addEventListener('submit',e=>{e.preventDefault();const value=GoogleProductCore.engineId($('google-engine').value);if(!value){status('Collez le code d’intégration complet ou l’identifiant du moteur Google.');return}try{localStorage.setItem(KEY,value)}catch{status('Le navigateur empêche la sauvegarde du moteur. Autorisez le stockage local et réessayez.');return}location.reload()});
$('google-disable').onclick=()=>{try{localStorage.removeItem(KEY)}catch{}location.reload()};
window.GoogleProduct={configured,lookup};
})();
