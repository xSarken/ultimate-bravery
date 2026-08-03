// Tiny procedural sound effects for the reveal, synthesized with the Web
// Audio API — no external audio files to download/license, and it works
// offline. Browsers require a user gesture before audio can play; that's
// satisfied here because sounds only ever fire after the "Roll The Team"
// click that starts the reveal.
let ctx = null;
function getCtx(){
  const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if(!AudioCtx) return null;
  if(!ctx) ctx = new AudioCtx();
  if(ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, duration, { type='sine', gain=0.15, delay=0 } = {}){
  const ac = getCtx();
  if(!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
  amp.gain.setValueAtTime(0, ac.currentTime + delay);
  amp.gain.linearRampToValueAtTime(gain, ac.currentTime + delay + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + delay + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(ac.currentTime + delay);
  osc.stop(ac.currentTime + delay + duration + 0.02);
}

const MUTE_KEY = 'ultimate-bravery-muted';
let muted = false;
export function setMuted(v){ muted = v; }
export function isMuted(){ return muted; }
export function loadMutedPref(){
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
}
export function saveMutedPref(v){
  try { localStorage.setItem(MUTE_KEY, v ? '1' : '0'); } catch { /* storage unavailable */ }
}

// Quick randomized-pitch blip — plays on every scramble tick (champion or
// name), like a slot-machine reel clicking past candidates.
export function playScrambleTick(){
  if(muted) return;
  tone(220 + Math.random()*260, 0.045, { type:'square', gain:0.05 });
}
// Two-note rising chime when a champion locks in.
export function playChampSettle(){
  if(muted) return;
  tone(392, 0.12, { type:'triangle', gain:0.16 });
  tone(659, 0.18, { type:'triangle', gain:0.14, delay:0.08 });
}
// A brighter two-note chime (different timbre from the champ settle, sine
// instead of triangle) when a player name locks in.
export function playNameSettle(){
  if(muted) return;
  tone(523, 0.1, { type:'sine', gain:0.15 });
  tone(784, 0.22, { type:'sine', gain:0.16, delay:0.09 });
}
// Four-note ascending arpeggio once the whole reveal finishes.
export function playFinale(){
  if(muted) return;
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.28, { type:'triangle', gain:0.14, delay:i*0.09 }));
}
