export function hashStringToInt(str){
  let h = 1779033703 ^ str.length;
  for(let i=0;i<str.length;i++){
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeSeedString(){
  return Math.random().toString(36).slice(2,8) + Math.random().toString(36).slice(2,6);
}

export function pickUnique(rng, arr, n){
  const pool = arr.slice(); const out = [];
  for(let i=0;i<n && pool.length>0;i++){
    const idx = Math.floor(rng()*pool.length);
    out.push(pool[idx]); pool.splice(idx,1);
  }
  return out;
}

export function pickOne(rng, arr){ return arr[Math.floor(rng()*arr.length)]; }

export function shuffle(rng, arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(rng()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
