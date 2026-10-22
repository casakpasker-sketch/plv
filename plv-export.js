(function(root){
'use strict';
async function generate(template,rows,meta,library){const lib=library||root.PDFLib;if(!lib)throw Error('PDF non chargé');const {PDFDocument,StandardFonts,rgb}=lib;
const source=await PDFDocument.load(template,{ignoreEncryption:true});const output=await PDFDocument.create();const font=await output.embedFont(StandardFonts.Helvetica),bold=await output.embedFont(StandardFonts.HelveticaBold);const offsets=[0,180.56,362.75,543.35];
const clean=s=>String(s??'').replace(/\u202f|\u00a0/g,' ').replace(/[\u2010-\u2015]/g,'-').replace(/\u2026/g,'...').split('').filter(c=>{try{font.encodeText(c);return true}catch{return false}}).join('');
function text(page,value,x,top,width,size=10,strong=false){const f=strong?bold:font;let content=clean(value),s=size;while(f.widthOfTextAtSize(content,s)>width&&s>5)s-=.25;page.drawText(content,{x,y:page.getHeight()-top-s,size:s,font:f,color:rgb(.08,.12,.15)})}
function boxText(page,value,x,top,w,h,size=9){let words=clean(value).split(/\s+/),lines=[],line='';for(const word of words){const next=line?line+' '+word:word;if(font.widthOfTextAtSize(next,size)>w&&line){lines.push(line);line=word}else line=next}if(line)lines.push(line);const max=Math.floor(h/(size+2));for(let i=0;i<Math.min(lines.length,max);i++)text(page,lines[i],x,top+i*(size+2),w,size)}
function cross(page,x,top){const y=page.getHeight()-top;page.drawLine({start:{x:x+2,y:y-2},end:{x:x+9,y:y-9},thickness:1.4,color:rgb(.05,.12,.2)});page.drawLine({start:{x:x+2,y:y-9},end:{x:x+9,y:y-2},thickness:1.4,color:rgb(.05,.12,.2)})}
function white(page,x,top,w,h){page.drawRectangle({x,y:page.getHeight()-top-h,width:w,height:h,color:rgb(1,1,1)})}
for(let start=0;start<rows.length;start+=4){const [page]=await output.copyPages(source,[0]);output.addPage(page);text(page,meta.name||'',434,19,132,9);const date=String(meta.date||'').split('-').reverse().join('/');text(page,date,451,38,116,9);
 rows.slice(start,start+4).forEach((r,index)=>{const dy=offsets[index],ys=[121.72,138.23,154.73,171.23,187.73,205.54,221.88,238.55];const sizes=['7,5x10','10x15','15x21','30x40','TG','A4 outlet','Calicot','Xbanner'];sizes.forEach((s,i)=>{const o=r.sizes[s];if(!o?.selected)return;if(i===6){const width=Number(o.widthCm),height=Number(o.heightCm);if(width>0&&height>0)text(page,String(width)+' x '+String(height)+' cm',71,ys[i]+dy+1,42,6.3,true)}else text(page,String(o.quantity||1),70.4,ys[i]+dy+1,10.3,8,true);if(o.laminated&&i<6)cross(page,103.16,ys[i]+dy);if(o.outdoor&&i<7)cross(page,135.53,ys[i]+dy)});if(r.duplex)cross(page,86.84,171.13+dy);if(r.special)cross(page,135.57,254.5+dy);
 const banners={'Standard':[231.01,100.49],'Promotion':[340.23,100.49],'Quantité limitée':[449.61,100.46],'Exclu carte':[559.44,100.49],'Prix Casto (MDD)':[263.94,124.46],'Prix baissé':[362.22,124.46],'Déstockage':[460.37,124.46],'Outlet':[559.44,124.46]};for(const banner of r.banners||[])if(banners[banner])cross(page,banners[banner][0],banners[banner][1]+dy);
 boxText(page,r.name,179,168+dy,194,42,10);boxText(page,r.benefits,387,185+dy,173,34,8);
 if(r.period||r.leaflet){white(page,177,150+dy,390,13);text(page,[r.period,r.leaflet?'Dépliant page '+r.leaflet:''].filter(Boolean).join(' / '),179,151+dy,386,8)}
 if(r.price!==''){white(page,177,236+dy,86,28);text(page,Number(r.price).toFixed(2).replace('.',',')+' €',179,239+dy,82,20,true)}
 if(r.oldPrice!==''){white(page,176,218+dy,56,16);text(page,Number(r.oldPrice).toFixed(2).replace('.',',')+' €',177,221+dy,54,10)}
 const code=String(r.ean||'');const cell=218/Math.max(13,code.length);for(let i=0;i<code.length;i++)text(page,code[i],348+cell*i,254+dy,cell-2,11,true);
 });}
output.setTitle('Demande de PLV');output.setSubject('Produits et options de signalétique');return output.save();}
const api={generate};if(typeof module==='object'&&module.exports)module.exports=api;else root.PLVExport=api;
})(typeof globalThis==='undefined'?this:globalThis);
