import { useEffect, useState } from 'react';
import { ddChampionSplash } from '../data/ddragon.js';
import { colorFromString } from '../lib/color.js';

// Renders either the real Data Dragon splash image OR the fallback monogram
// — never both, so there is no CSS stacking order for a fallback letter to
// wrongly sit on top of a successfully-loaded image. Uses the native-landscape
// splash art (not the portrait loading-screen crop) so faces aren't cropped
// awkwardly when displayed in a wide card.
export default function ChampionSplash({ champ, imgClassName, fallbackClassName }){
  const [failed, setFailed] = useState(false);
  useEffect(()=>{ setFailed(false); }, [champ.id]);

  if(failed){
    return (
      <div className={fallbackClassName} style={{background:colorFromString(champ.name)}}>
        {champ.name.charAt(0)}
      </div>
    );
  }
  return (
    <img
      className={imgClassName}
      src={ddChampionSplash(champ.id)}
      alt={champ.name}
      onError={()=>setFailed(true)}
    />
  );
}
