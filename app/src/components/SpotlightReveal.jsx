import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useMotionTemplate } from 'framer-motion';
import { getPoolByKey } from '../lib/theme.js';
import { CHAMPIONS } from '../data/champions.js';
import { colorFromString } from '../lib/color.js';
import { ddChampionSplash } from '../data/ddragon.js';
import RunesBlock from './RunesBlock.jsx';
import ItemChips from './ItemChips.jsx';
import SpellChips from './SpellChips.jsx';
import { playScrambleTick, playChampSettle, playNameSettle, playFinale } from '../lib/sound.js';

function wait(ms){ return new Promise(res=>setTimeout(res, ms)); }

const ROLE_COLORS = { top:'#e8590c', jungle:'#2f9e5c', mid:'#c990ff', adc:'#3ec6d9', support:'#f0c419' };

// A single diagonal light sweep across the banner — plays once every time
// `triggerKey` changes (each new reveal), alternating sweep direction so it
// doesn't feel mechanically identical every time.
function ShineSweep({ triggerKey }){
  // eslint-disable-next-line react-hooks/exhaustive-deps -- triggerKey intentionally forces a fresh coin-flip each sweep
  const fromTopLeft = useMemo(() => Math.random() < 0.5, [triggerKey]);
  return (
    <motion.div
      key={triggerKey}
      className={`spot-shine ${fromTopLeft ? 'from-tl' : 'from-tr'}`}
      initial={{ x: fromTopLeft ? '-130%' : '130%', opacity: 0 }}
      animate={{ x: fromTopLeft ? '130%' : '-130%', opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}

const detailParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const detailChild = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

// Two-pass "pack opening" reveal in the same wide cinematic banner:
// Phase 1 rolls all 5 champion builds in slot order, with the player name
// shown as "???" (nobody's been assigned yet). Phase 2 replays each
// already-built slot and rolls/settles the player name that `rollFullTeam`
// already assigned to it (a seeded shuffle, done ahead of time so shared
// links reproduce the same assignment) — this pass is purely the theatrical
// reveal of an answer that's already decided, same as the champion scramble.
export default function SpotlightReveal({ results, names, effectiveTheme, onDone }){
  const [phase, setPhase] = useState('champs'); // 'champs' -> 'names'
  const [stepIndex, setStepIndex] = useState(0);
  const [stage, setStage] = useState('art'); // champs: art -> role -> details | names: nameScramble -> nameSettled
  const [scrambleChamp, setScrambleChamp] = useState(null);
  const [scrambleName, setScrambleName] = useState(null);
  const [artFailed, setArtFailed] = useState(false);
  const [shineTick, setShineTick] = useState(0);
  const skipRef = useRef(false);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 160, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 160, damping: 18 });
  const glareX = useTransform(mx, v => `${v * 100}%`);
  const glareY = useTransform(my, v => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.28), transparent 55%)`;

  function handleMouseMove(e){
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }
  function handleMouseLeave(){
    mx.set(0.5);
    my.set(0.5);
  }

  useEffect(()=>{
    let cancelled = false;

    async function run(){
      const pool = getPoolByKey(effectiveTheme);
      const scramblePool = pool.length>=5 ? pool : CHAMPIONS;
      scramblePool.forEach(c => { const img = new Image(); img.src = ddChampionSplash(c.id); });

      // Phase 1: roll each slot's champion + full build, no name attached yet.
      for(let i=0;i<results.length;i++){
        if(cancelled) return;
        setPhase('champs');
        setStepIndex(i);
        setStage('art');
        setArtFailed(false);
        const ticks = skipRef.current ? 3 : 16;
        for(let t=0;t<ticks;t++){
          if(cancelled) return;
          setArtFailed(false);
          setScrambleChamp(scramblePool[Math.floor(Math.random()*scramblePool.length)]);
          playScrambleTick();
          await wait(skipRef.current ? 20 : 90);
        }
        if(cancelled) return;
        setArtFailed(false);
        setScrambleChamp(results[i].champ);
        playChampSettle();
        await wait(skipRef.current ? 150 : 1300);
        if(cancelled) return;

        setStage('role');
        setShineTick(t => t + 1);
        await wait(skipRef.current ? 150 : 1600);
        if(cancelled) return;

        setStage('details');
        await wait(skipRef.current ? 250 : 2200);
      }

      // Phase 2: replay each slot and roll/settle its already-assigned name.
      for(let i=0;i<results.length;i++){
        if(cancelled) return;
        setPhase('names');
        setStepIndex(i);
        setStage('nameScramble');
        setArtFailed(false);
        const alreadyAssigned = results.slice(0, i).map(r => r.playerName);
        const namePool = names.filter(n => !alreadyAssigned.includes(n));
        const candidates = namePool.length ? namePool : names;
        const ticks = skipRef.current ? 3 : 14;
        for(let t=0;t<ticks;t++){
          if(cancelled) return;
          setScrambleName(candidates[Math.floor(Math.random()*candidates.length)]);
          playScrambleTick();
          await wait(skipRef.current ? 20 : 85);
        }
        if(cancelled) return;
        setScrambleName(results[i].playerName);
        setStage('nameSettled');
        setShineTick(t => t + 1);
        playNameSettle();
        await wait(skipRef.current ? 180 : 1400);
      }

      if(!cancelled){ playFinale(); onDone(); }
    }

    // The CSS background effects already respect this, but the reveal's own
    // JS-timed sequence doesn't automatically — someone with the OS/browser
    // "reduce motion" preference set shouldn't be forced through ~40s of
    // scrambling just to reach the same grid a static-motion visitor gets.
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReducedMotion){
      onDone();
      return () => { cancelled = true; };
    }

    skipRef.current = false;
    run();
    return ()=>{ cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, names]);

  const slot = results[stepIndex];
  if(!slot) return null;
  const champSettled = phase === 'names' || stage === 'role' || stage === 'details';
  const displayChamp = champSettled ? slot.champ : scrambleChamp;
  const roleColor = ROLE_COLORS[slot.role.key] || 'var(--chaos-bright)';
  const showDetails = phase === 'names' || stage === 'details';
  const showRole = phase === 'names' || stage === 'role' || stage === 'details';
  const nameText = phase === 'champs' ? '???' : (stage === 'nameScramble' ? scrambleName : slot.playerName);

  return (
    <div id="spotlightWrap">
      <div
        className="spotlight-perspective"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div className="spotlight-card-wide" style={{ rotateX, rotateY }}>
          <div className="spotlight-progress-group">
            <div className="spotlight-progress-label">🎲 Rolling Champions</div>
            <div className="spotlight-progress">
              {results.map((_,i)=>(
                <div key={i} className={`dot ${phase==='names' || i<stepIndex ? 'done' : (phase==='champs' && i===stepIndex ? 'active' : '')}`} />
              ))}
            </div>
            <div className="spotlight-progress-label">🧑 Assigning Players</div>
            <div className="spotlight-progress">
              {results.map((_,i)=>(
                <div key={i} className={`dot ${phase==='champs' ? '' : (i<stepIndex ? 'done' : (i===stepIndex ? 'active' : ''))}`} />
              ))}
            </div>
          </div>
          <button className="spot-skip" onClick={()=>{ skipRef.current = true; }}>Skip ▶</button>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${phase}-${stepIndex}`}
              className="spot-banner"
              initial={{ opacity: 0, rotateY: 70 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -50 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {displayChamp && (
                artFailed ? (
                  <div className="spot-banner-fallback" style={{background:colorFromString(displayChamp.name)}}>
                    {displayChamp.name.charAt(0)}
                  </div>
                ) : (
                  <img
                    key={displayChamp.id}
                    className="spot-banner-img"
                    src={ddChampionSplash(displayChamp.id)}
                    alt={displayChamp.name}
                    onError={()=>setArtFailed(true)}
                  />
                )
              )}
              <motion.div className="spot-glare" style={{ background: glareBg }} />
              <div className={`spot-banner-scrim ${phase==='names' ? 'dim':''}`} />

              <div className={`spot-role-tag ${showRole ? 'in':''}`} style={{ background: roleColor }}>
                {slot.role.icon} {slot.role.label}
              </div>

              {phase === 'champs' && (
                <div className="spot-banner-text">
                  <div className="spot-player-name placeholder">{nameText}</div>
                  {displayChamp && (
                    <div className="spot-champ-name">{displayChamp.name}</div>
                  )}
                </div>
              )}

              {phase === 'names' && (
                <div className="spot-name-roll">
                  <div className="spot-name-roll-eyebrow">🧑 Assigning Player</div>
                  <motion.div
                    key={nameText}
                    className={`spot-name-roll-name ${stage==='nameSettled' ? 'settled':''}`}
                    initial={{ opacity: 0.3, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: stage==='nameSettled' ? 0.4 : 0.08, ease: [0.16,1,0.3,1] }}
                  >
                    {nameText}
                  </motion.div>
                  <div className="spot-name-roll-sub">→ {slot.champ.name}</div>
                </div>
              )}

              {((phase==='champs' && stage==='role') || (phase==='names' && stage==='nameSettled')) && (
                <ShineSweep triggerKey={`${phase}-${stepIndex}-${shineTick}`} />
              )}
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="spot-details-row"
            variants={detailParent}
            initial="hidden"
            animate={showDetails ? 'show' : 'hidden'}
          >
            {showDetails && (
              <>
                <motion.div className="spot-detail-block" variants={detailChild}>
                  <div className="section-label">Runes</div>
                  <RunesBlock runes={slot.runes} />
                </motion.div>
                <motion.div className="spot-detail-block" variants={detailChild}>
                  <div className="section-label">Build</div>
                  <div className="chips"><ItemChips items={slot.items} /></div>
                </motion.div>
                <motion.div className="spot-detail-block" variants={detailChild}>
                  <div className="section-label">Spells</div>
                  <div className="chips"><SpellChips spells={slot.spells} /></div>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
