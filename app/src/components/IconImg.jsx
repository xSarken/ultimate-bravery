import { useState } from 'react';
import { colorFromString } from '../lib/color.js';

export default function IconImg({ src, alt, className }){
  const [failed, setFailed] = useState(false);
  if(!src || failed){
    return <span className="icon-fallback" style={{background:colorFromString(alt)}}>{alt.charAt(0)}</span>;
  }
  return <img className={className} src={src} alt={alt} onError={()=>setFailed(true)} />;
}
