import { CHAMPIONS, REGION_LABELS, SQUAD_LABELS, ALL_THEME_KEYS } from '../data/champions.js';
import { pickOne } from './rng.js';

export function getPoolByKey(theme){
  if(theme === 'random') return CHAMPIONS;
  if(theme.startsWith('region:')) return CHAMPIONS.filter(c => c.region === theme.split(':')[1]);
  if(theme.startsWith('squad:')) return CHAMPIONS.filter(c => c.groups.includes(theme.split(':')[1]));
  return CHAMPIONS;
}

export function themeLabel(theme){
  if(theme==='random') return 'Fully Random';
  if(theme.startsWith('region:')) return REGION_LABELS[theme.split(':')[1]];
  if(theme.startsWith('squad:')) return SQUAD_LABELS[theme.split(':')[1]];
  return theme;
}

// Fully Random has weighted chaos: ~40% of the time it secretly rolls one
// specific region/squad pool instead of the full roster.
export function resolveEffectiveTheme(rng, theme){
  if(theme !== 'random') return theme;
  if(rng() < 0.4){
    return pickOne(rng, ALL_THEME_KEYS);
  }
  return 'random';
}
