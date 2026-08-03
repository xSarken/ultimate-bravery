import { motion } from 'framer-motion';
import ChampionSplash from './ChampionSplash.jsx';
import RunesBlock from './RunesBlock.jsx';
import ItemChips from './ItemChips.jsx';
import SpellChips from './SpellChips.jsx';
import SkillOrderGrid from './SkillOrderGrid.jsx';
import ChallengesList from './ChallengesList.jsx';
import { regionLabel } from '../lib/labels.js';

export default function Card({ slot, index, onReroll }){
  const r = slot.role;
  const isSupport = r.key === 'support';
  return (
    <motion.div
      className={`card role-${r.key}`}
      layout
      initial={{ opacity:0, y:28, scale:0.94 }}
      animate={{ opacity:1, y:0, scale:1 }}
      transition={{ duration:0.5, delay: index*0.09, ease:[0.16,1,0.3,1] }}
      whileHover={{ y:-6, transition:{ duration:0.2 } }}
    >
      <div className="card-art">
        <ChampionSplash champ={slot.champ} imgClassName="card-art-img" fallbackClassName="card-art-fallback" />
        <div className={`role-badge role-${r.key}`}>{r.icon} {r.label}</div>
        <motion.button
          className="reroll-btn"
          title="Reroll this slot"
          onClick={()=>onReroll(index)}
          whileHover={{ rotate:160 }}
          whileTap={{ scale:0.85 }}
        >
          🎲
        </motion.button>
        <div className="card-name-strip">
          <div className="player-name">{slot.playerName}</div>
          <div className="champ-name">{slot.champ.name}</div>
          <div className="champ-region">{regionLabel(slot.champ.region)}</div>
        </div>
      </div>
      <div className="card-body">
        <div className="card-section section-runes">
          <div className="section-label">🔮 Runes</div>
          <RunesBlock runes={slot.runes} />
        </div>
        <div className="card-section section-build">
          <div className="section-label">
            ⚔️ Build
            {isSupport && <span style={{color:'var(--support)'}}> (support item guaranteed)</span>}
            {slot.hasNoBoots && <span style={{color:'var(--adc)'}}> · barefoot (no boots)</span>}
            {slot.isTank && <span style={{color:'var(--jungle)'}}> · tank items only</span>}
            {slot.bonusBootSlot && <span style={{color:'var(--adc)'}}> · bonus boot slot (7 items)</span>}
          </div>
          <div className="chips"><ItemChips items={slot.items} /></div>
        </div>
        <div className="card-section section-spells">
          <div className="section-label">🌀 Spells</div>
          <div className="chips"><SpellChips spells={slot.spells} /></div>
        </div>
        <div className="card-section section-skillorder">
          <div className="section-label">📈 Skill Order (Lvl 1-18)</div>
          <SkillOrderGrid skillOrder={slot.skillOrder} />
        </div>
        <div className="card-section section-challenges">
          <div className="section-label">⚡ Bravery Challenges</div>
          <ChallengesList challenges={slot.challenges} />
        </div>
        <div className="card-section section-punishment">
          <div className="section-label punishment-label">☠️ Punishment (if you fail)</div>
          <div className="punishment-text">{slot.punishment}</div>
        </div>
      </div>
    </motion.div>
  );
}
