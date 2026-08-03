import IconImg from './IconImg.jsx';
import { SPELL_ICONS } from '../data/ddragon.js';

export default function SpellChips({ spells }){
  return spells.map((s,i)=>(
    <span className={`chip spell ${s.forced?'smite':''}`} key={i}>
      <IconImg src={SPELL_ICONS[s.name]} alt={s.name} />
      {s.name}{s.forced?' (forced)':''}
    </span>
  ));
}
