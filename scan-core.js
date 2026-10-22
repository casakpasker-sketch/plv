(function(root){
'use strict';
function makeDecoder(Z){
 const formats=['EAN_13','EAN_8','UPC_A','UPC_E','CODE_128','CODE_39','CODE_93','CODABAR','ITF','QR_CODE','DATA_MATRIX','PDF_417'].map(k=>Z.BarcodeFormat[k]);
 const hints=new Map([[Z.DecodeHintType.POSSIBLE_FORMATS,formats],[Z.DecodeHintType.TRY_HARDER,true]]);
 const reader=new Z.MultiFormatReader();
 return function decodeFrame(image){
  const {width:w,height:h,data}=image;if(!w||!h||data.length!==w*h*4)throw new Error('Image de caméra incomplète');
  const gray=new Uint8ClampedArray(w*h);for(let i=0,j=0;i<gray.length;i++,j+=4)gray[i]=(data[j]+2*data[j+1]+data[j+2])>>2;
  function read(p,width,height){try{return reader.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.RGBLuminanceSource(p,width,height))),hints)}catch(e){if(e instanceof Z.NotFoundException||e instanceof Z.ChecksumException||e instanceof Z.FormatException)return null;throw e}finally{reader.reset()}}
  let result=read(gray,w,h);if(result)return result;
  // Turn vertical bars into horizontal scan lines, including in portrait on iOS.
  const rotated=new Uint8ClampedArray(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)rotated[x*h+h-1-y]=gray[y*w+x];
  return read(rotated,h,w);
 }
}
if(typeof module==='object'&&module.exports)module.exports=makeDecoder;else root.makeBarcodeDecoder=makeDecoder;
})(typeof globalThis==='undefined'?this:globalThis);
