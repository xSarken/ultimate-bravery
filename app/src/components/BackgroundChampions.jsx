import { useCallback, useMemo, useState } from 'react';
import { CHAMPIONS } from '../data/champions.js';
import { ddChampionSplash } from '../data/ddragon.js';

const LANES = 8;
const PER_LANE = 5; // 8 * 5 = 40, ~6x the original 6-portrait pool
const MAX_SKIN = 6; // trying a number higher than a champ's actual skin count just 404s and respawns

function randomPick() {
  const champ = CHAMPIONS[Math.floor(Math.random() * CHAMPIONS.length)];
  const skin = Math.floor(Math.random() * (MAX_SKIN + 1));
  return { champ, skin };
}

// Decorative only: a wide pool of champion splash portraits (mix of base
// skins and random alternates) drifting continuously right-to-left behind
// the page content, spread across fixed lanes so they don't stack. Every
// time a portrait finishes a full loop (or its randomly-picked skin 404s)
// it respawns as a brand new random champion/skin, so the same handful of
// faces never just loops in place — the whole pool cycles through variety.
export default function BackgroundChampions() {
  const slots = useMemo(() => {
    const laneHeight = 100 / LANES;
    const out = [];
    for (let lane = 0; lane < LANES; lane++) {
      const duration = 34 + Math.random() * 24;
      for (let j = 0; j < PER_LANE; j++) {
        out.push({
          id: `${lane}-${j}`,
          top: laneHeight * lane + laneHeight * 0.15 + Math.random() * (laneHeight * 0.2),
          size: 140 + Math.random() * 80,
          duration,
          delay: -((j / PER_LANE) * duration) - Math.random() * 4,
        });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lane/slot layout picked once per mount
  }, []);

  const [portraits, setPortraits] = useState(() => slots.map(s => ({ ...s, ...randomPick() })));

  const respawn = useCallback(id => {
    setPortraits(prev => prev.map(p => (p.id === id ? { ...p, ...randomPick() } : p)));
  }, []);

  return (
    <div className="bg-champs" aria-hidden="true">
      {portraits.map(p => (
        <img
          key={p.id}
          className="bg-champ-portrait"
          src={ddChampionSplash(p.champ.id, p.skin)}
          alt=""
          loading="lazy"
          style={{
            top: `${p.top}%`,
            width: `${p.size}px`,
            '--drift-duration': `${p.duration}s`,
            '--drift-delay': `${p.delay}s`,
          }}
          onAnimationIteration={() => respawn(p.id)}
          onError={() => respawn(p.id)}
        />
      ))}
    </div>
  );
}
