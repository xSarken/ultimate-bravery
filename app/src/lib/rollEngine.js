import { CHAMPIONS } from '../data/champions.js';
import { RUNE_TREES, STAT_SHARDS, ITEM_POOL, BOOT_POOL, SUPPORT_ITEMS, SPELLS_NON_JUNGLE, SMITE } from '../data/ddragon.js';
import { CHALLENGES } from '../data/challenges.js';
import { PUNISHMENTS } from '../data/punishments.js';
import { SKILL_ORDER_RULES } from '../data/skillOrderRules.js';
import { ROLES } from '../data/roles.js';
import { hashStringToInt, mulberry32, pickUnique, pickOne, shuffle } from './rng.js';
import { getPoolByKey, resolveEffectiveTheme } from './theme.js';

// Matches a real rune page: primary tree gives a keystone plus exactly one
// minor per row (3 total, one from each of its 3 rows); secondary tree gives
// 2 minors picked from 2 DIFFERENT rows (never two from the same row).
function pickRunes(rng){
  const pathNames = Object.keys(RUNE_TREES);
  const primaryName = pickOne(rng, pathNames);
  const secondaryName = pickOne(rng, pathNames.filter(p=>p!==primaryName));
  const primary = RUNE_TREES[primaryName], secondary = RUNE_TREES[secondaryName];
  const keystone = pickOne(rng, primary.keystones);
  const primaryMinors = primary.rows.map(row => pickOne(rng, row));
  const secondaryRowIdx = pickUnique(rng, [0, 1, 2], 2);
  const secondaryMinors = secondaryRowIdx.map(i => pickOne(rng, secondary.rows[i]));
  const shards = [pickOne(rng, STAT_SHARDS.offense), pickOne(rng, STAT_SHARDS.flex), pickOne(rng, STAT_SHARDS.defense)];
  return {
    primaryName, secondaryName,
    primaryColor:primary.color, primaryTreeIcon:primary.treeIcon,
    secondaryColor:secondary.color, secondaryTreeIcon:secondary.treeIcon,
    keystone, primaryMinors, secondaryMinors, shards
  };
}

// Same as pickUnique, but picking a challenge with a `group` (e.g. the
// mutually-exclusive onlyTank/onlyAP/onlyAD build-archetype trio) removes
// the rest of that group too, so a slot never gets told to build two
// contradictory item sets at once.
// Build-archetype challenges (full tank/AP/AD) are rare and mutually
// exclusive by design — rather than just being 3 entries in the general
// pool (which ties their odds to how many other challenges exist),
// each gets an explicit independent target chance. A single weighted
// roll decides whether ANY archetype challenge fires this slot (their
// combined chance), and if it does, one is picked uniformly from the
// three — that keeps each one's individual odds exactly at ARCHETYPE_CHANCE_EACH
// regardless of how the rest of the challenge pool grows or shrinks.
const ARCHETYPE_CHALLENGES = CHALLENGES.filter(c => c.group === 'buildArchetype');
const ARCHETYPE_CHANCE_EACH = 0.045;
const NON_ARCHETYPE_CHALLENGES = CHALLENGES.filter(c => c.group !== 'buildArchetype');

function pickChallenges(rng, role){
  const pool = role.key === 'adc' ? NON_ARCHETYPE_CHALLENGES.filter(c=>!c.noBoots) : NON_ARCHETYPE_CHALLENGES;
  const out = [];
  if(rng() < ARCHETYPE_CHALLENGES.length * ARCHETYPE_CHANCE_EACH){
    out.push(pickOne(rng, ARCHETYPE_CHALLENGES));
  }
  return [...out, ...pickUnique(rng, pool, 3 - out.length)];
}

function insertAtRandomIndex(rng, arr, item, minIndex){
  const lo = minIndex || 0;
  const idx = lo + Math.floor(rng()*(arr.length - lo + 1));
  return [...arr.slice(0,idx), item, ...arr.slice(idx)];
}

function pickItems(rng, role, hasNoBoots, isTank, isAP, isAD){
  const supportItem = role.key === 'support' ? {...pickOne(rng, SUPPORT_ITEMS), isSupport:true} : null;
  let pool = ITEM_POOL.filter(it => !supportItem || it.name !== supportItem.name);
  if(isTank){
    const tankOnly = pool.filter(it=>it.tank);
    pool = tankOnly.length >= 6 ? tankOnly : [...tankOnly, ...pool.filter(it=>!it.tank)];
  } else if(isAP){
    const apOnly = pool.filter(it=>it.ap);
    pool = apOnly.length >= 6 ? apOnly : [...apOnly, ...pool.filter(it=>!it.ap)];
  } else if(isAD){
    const adOnly = pool.filter(it=>it.ad);
    pool = adOnly.length >= 6 ? adOnly : [...adOnly, ...pool.filter(it=>!it.ad)];
  }
  // ADC house rule: boots are a bonus 7th slot (their "role quest" reward), never
  // traded away — so ADC always gets a full 6 core items PLUS boots. `coreNeed`
  // must NOT subtract 1 for ADC's boot like it does for every other role,
  // otherwise the boot just replaces a core slot instead of adding to it.
  const bonusBootSlot = role.key === 'adc';
  const includeBoot = bonusBootSlot || !hasNoBoots;
  const coreNeed = supportItem ? (includeBoot ? 4 : 5) : (bonusBootSlot ? 6 : (includeBoot ? 5 : 6));
  const rest = pickUnique(rng, pool, coreNeed);
  let items = supportItem ? [supportItem, ...rest] : rest;
  if(includeBoot){
    const boot = {...pickOne(rng, BOOT_POOL), isBoot:true};
    items = insertAtRandomIndex(rng, items, boot, supportItem ? 1 : 0);
  }
  return { items, bonusBootSlot };
}

// Generates a level-1-to-18 skill point order following real League rules:
// one point per level, R caps at 3 and can ONLY be leveled at 6/11/16, and —
// this is the part a naive "shuffle a bag of 5 Q/5 W/5 E" build ignores — a
// basic ability's rank can never exceed ceil(championLevel / 2). That's why
// e.g. E>Q>Q>Q is illegal: the 3rd point in Q would land at champion level 4,
// but rank 3 requires level >= 5. Some champions also have real per-kit
// restrictions on top of the generic cap — see SKILL_ORDER_RULES.
export function pickSkillOrder(rng, champ){
  const rule = (champ && SKILL_ORDER_RULES[champ.id]) || {};
  const locked = rule.locked || {};
  const ranks = {Q:0,W:0,E:0};
  const order = [];
  for(let lvl=1; lvl<=18; lvl++){
    if(lvl===6||lvl===11||lvl===16){ order.push('R'); continue; }
    if(lvl===1 && rule.forceFirst){
      ranks[rule.forceFirst]++; order.push(rule.forceFirst); continue;
    }
    const cap = Math.ceil(lvl/2);
    const eligible = ['Q','W','E'].filter(k=>{
      if(ranks[k] >= 5 || ranks[k]+1 > cap) return false;
      const prereqs = locked[k];
      if(prereqs && ranks[k]===0){
        if(lvl===1) return false;
        return prereqs.length===0 || prereqs.some(p=>ranks[p]>=1);
      }
      return true;
    });
    const key = eligible.length ? pickOne(rng, eligible) : ['Q','W','E'].find(k=>ranks[k]<5);
    ranks[key]++;
    order.push(key);
  }
  const counts = {Q:0,W:0,E:0};
  const maxedOrder = [];
  for(const l of order){ if(l==='R') continue; counts[l]++; if(counts[l]===5 && !maxedOrder.includes(l)) maxedOrder.push(l); }
  return { order, maxedOrder };
}

export function buildSlot(rng, role, champ, playerName){
  const runes = pickRunes(rng);
  const challenges = pickChallenges(rng, role);
  const hasNoBoots = challenges.some(c=>c.noBoots);
  const isTank = challenges.some(c=>c.onlyTank);
  const isAP = challenges.some(c=>c.onlyAP);
  const isAD = challenges.some(c=>c.onlyAD);
  const { items, bonusBootSlot } = pickItems(rng, role, hasNoBoots, isTank, isAP, isAD);
  const skillOrder = pickSkillOrder(rng, champ);
  const punishment = pickOne(rng, PUNISHMENTS);
  let spells;
  if(role.key === 'jungle'){
    const other = pickOne(rng, SPELLS_NON_JUNGLE);
    spells = [{name:SMITE, forced:true}, {name:other, forced:false}];
  } else {
    const two = pickUnique(rng, SPELLS_NON_JUNGLE, 2);
    spells = two.map(n=>({name:n, forced:false}));
  }
  return { role, champ, playerName, runes, items, spells, challenges, hasNoBoots, isTank, isAP, isAD, bonusBootSlot, skillOrder, punishment };
}

// Champion/role/build are rolled first per anonymous slot, then the 5
// entered names are seeded-shuffled onto those slots (not just names[i]) so
// the "roll champs first, then randomly assign players" reveal has a real
// randomized assignment to show — and since it's still driven by `rng`
// (not client-side Math.random), a shared seed+names link reproduces the
// exact same assignment, not just the same builds.
export function rollFullTeam(seedStr, theme, names){
  const rng = mulberry32(hashStringToInt(seedStr));
  const effectiveTheme = resolveEffectiveTheme(rng, theme);
  const pool = getPoolByKey(effectiveTheme);
  const effectivePool = pool.length >= 5 ? pool : CHAMPIONS;
  const roles = shuffle(rng, ROLES);
  const champs = pickUnique(rng, effectivePool, 5);
  const assignedNames = shuffle(rng, names);
  const results = [];
  for(let i=0;i<5;i++) results.push(buildSlot(rng, roles[i], champs[i], assignedNames[i]));
  return { results, effectiveTheme };
}

export function rerollSlot(seed, index, results, effectiveTheme){
  const seedBase = seed + '-reroll-' + index + '-' + Date.now();
  const rng = mulberry32(hashStringToInt(seedBase));
  const usedIds = results.filter((_,i)=>i!==index).map(r=>r.champ.id);
  const pool = getPoolByKey(effectiveTheme).filter(c=>!usedIds.includes(c.id));
  const effectivePool = pool.length>0 ? pool : CHAMPIONS.filter(c=>!usedIds.includes(c.id));
  const champ = pickOne(rng, effectivePool);
  const role = results[index].role;
  const playerName = results[index].playerName;
  const next = results.slice();
  next[index] = buildSlot(rng, role, champ, playerName);
  return next;
}
