import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import { REGION_LABELS, SQUAD_LABELS } from './data/champions.js';
import { makeSeedString } from './lib/rng.js';
import { rollFullTeam, rerollSlot } from './lib/rollEngine.js';
import SpotlightReveal from './components/SpotlightReveal.jsx';
import TeamGrid from './components/TeamGrid.jsx';
import BackgroundChampions from './components/BackgroundChampions.jsx';
import { setMuted, loadMutedPref, saveMutedPref } from './lib/sound.js';

const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const seed = params.get('seed');
  const theme = params.get('theme');
  const names = params.get('names');
  return { seed, theme, names: names ? names.split('|') : null };
}

function writeUrlParams(seed, theme, names) {
  try {
    const params = new URLSearchParams();
    params.set('seed', seed);
    params.set('theme', theme);
    params.set('names', names.join('|'));
    window.history.replaceState({}, '', window.location.pathname + '?' + params.toString());
  } catch {
    // URL API unavailable (e.g. sandboxed preview) — sharing just won't persist across reloads.
  }
}

export default function App() {
  const [names, setNames] = useState(DEFAULT_NAMES);
  const [theme, setTheme] = useState('random');
  const [seed, setSeed] = useState(null);
  const [effectiveTheme, setEffectiveTheme] = useState('random');
  const [results, setResults] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [copyLabel, setCopyLabel] = useState('Copy');
  const [imageBusy, setImageBusy] = useState(false);
  const [muted, setMutedUi] = useState(() => loadMutedPref());
  const gridRef = useRef(null);

  useEffect(() => {
    setMuted(muted);
    saveMutedPref(muted);
  }, [muted]);

  useEffect(() => {
    const { seed: urlSeed, theme: urlTheme, names: urlNames } = readUrlParams();
    if (urlSeed && urlTheme) {
      const loadedNames = urlNames ? DEFAULT_NAMES.map((d, i) => urlNames[i] || d) : DEFAULT_NAMES;
      setNames(loadedNames);
      setTheme(urlTheme);
      setSeed(urlSeed);
      const { results: rolled, effectiveTheme: effective } = rollFullTeam(urlSeed, urlTheme, loadedNames);
      setResults(rolled);
      setEffectiveTheme(effective);
    }
  }, []);

  useEffect(() => {
    function handleMove(e) {
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
      document.documentElement.style.setProperty('--my', `${e.clientY}px`);
    }
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  function handleNameChange(i, value) {
    setNames(prev => prev.map((n, idx) => (idx === i ? value : n)));
  }

  function handleRoll() {
    if (rolling) return;
    const newSeed = makeSeedString();
    setSeed(newSeed);
    setShareUrl(null);
    const { results: rolled, effectiveTheme: effective } = rollFullTeam(newSeed, theme, names);
    setResults(rolled);
    setEffectiveTheme(effective);
    setRolling(true);
  }

  function handleRevealDone() {
    setRolling(false);
    writeUrlParams(seed, theme, names);
  }

  function handleReroll(index) {
    setResults(prev => rerollSlot(seed, index, prev, effectiveTheme));
  }

  function handleShare() {
    if (!seed) {
      alert('Roll a team first!');
      return;
    }
    writeUrlParams(seed, theme, names);
    setShareUrl(window.location.href);
    setCopyLabel('Copy');
  }

  function handleCopy() {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopyLabel('Copied!');
    setTimeout(() => setCopyLabel('Copy'), 1200);
  }

  function handleLoadFromLink() {
    const { seed: urlSeed, theme: urlTheme, names: urlNames } = readUrlParams();
    if (urlSeed && urlTheme) {
      const loadedNames = urlNames ? DEFAULT_NAMES.map((d, i) => urlNames[i] || d) : DEFAULT_NAMES;
      setNames(loadedNames);
      setTheme(urlTheme);
      setSeed(urlSeed);
      setShareUrl(null);
      const { results: rolled, effectiveTheme: effective } = rollFullTeam(urlSeed, urlTheme, loadedNames);
      setResults(rolled);
      setEffectiveTheme(effective);
    } else {
      alert('No share code found in the current URL. Paste a full shared link into your browser address bar first.');
    }
  }

  async function handleDownloadImage() {
    if (!gridRef.current) return;
    setImageBusy(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(gridRef.current, { backgroundColor: '#0a1418', useCORS: true, scale: 2 });
      const link = document.createElement('a');
      link.download = 'ultimate-bravery-team.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Could not generate image (likely a cross-origin image restriction). A manual screenshot will still work great!');
    }
    setImageBusy(false);
  }

  const showEmptyState = !rolling && !results;

  return (
    <>
      <BackgroundChampions />
      <div className="bg-aurora" aria-hidden="true">
        <div className="bg-blob a" />
        <div className="bg-blob b" />
        <div className="bg-blob c" />
      </div>
      <div className="bg-noise" aria-hidden="true" />
      <div className="cursor-glow" aria-hidden="true" />
    <div className="wrap">
      <header>
        <div className="eyebrow">Summoner's Rift · Custom Chaos</div>
        <h1>Ultimate Bravery</h1>
        <div className="sub">Random champ. Random build. Random <b>indignity</b>. Roll your whole team at once.</div>
      </header>

      <motion.div
        className="panel"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2>Your Team</h2>
        <div className="names-grid">
          {names.map((n, i) => (
            <div className="name-field" key={i}>
              <span>Player {i + 1}</span>
              <input
                type="text"
                value={n}
                onChange={e => handleNameChange(i, e.target.value)}
                maxLength={20}
              />
            </div>
          ))}
        </div>
        <div className="controls-row">
          <div className="field-group" style={{ flex: 2 }}>
            <label>Champion Pool</label>
            <select value={theme} onChange={e => setTheme(e.target.value)}>
              <option value="random">Fully Random</option>
              <optgroup label="Region">
                {Object.entries(REGION_LABELS).map(([key, label]) => (
                  <option key={key} value={`region:${key}`}>{label}</option>
                ))}
              </optgroup>
              <optgroup label="Squad">
                {Object.entries(SQUAD_LABELS).map(([key, label]) => (
                  <option key={key} value={`squad:${key}`}>{label}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="field-group" style={{ flex: '0 0 auto', minWidth: 'auto' }}>
            <button
              className={`roll-btn ${rolling ? 'rolling' : ''}`}
              onClick={handleRoll}
              disabled={rolling}
            >
              🎲 Roll The Team
            </button>
          </div>
        </div>
        <div className="secondary-actions">
          <button className="ghost-btn" onClick={handleShare}>🔗 Get Share Link</button>
          <button className="ghost-btn" onClick={handleLoadFromLink}>📥 Load From Link</button>
          <button className="ghost-btn" onClick={handleDownloadImage} disabled={!results || imageBusy}>
            {imageBusy ? 'Rendering…' : '🖼️ Download Team Image'}
          </button>
          <button className="ghost-btn" onClick={() => setMutedUi(m => !m)}>
            {muted ? '🔇 Sound Off' : '🔊 Sound On'}
          </button>
        </div>
        {shareUrl && (
          <div className="share-row show">
            <input type="text" className="seed-input" value={shareUrl} readOnly />
            <button className="ghost-btn" onClick={handleCopy}>{copyLabel}</button>
          </div>
        )}
      </motion.div>

      <motion.div
        className="panel"
        style={{ paddingTop: 22 }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2>The Draft</h2>
        {rolling && results && (
          <SpotlightReveal results={results} names={names} effectiveTheme={effectiveTheme} onDone={handleRevealDone} />
        )}
        {!rolling && results && (
          <TeamGrid
            results={results}
            currentTheme={theme}
            effectiveTheme={effectiveTheme}
            onReroll={handleReroll}
            gridRef={gridRef}
          />
        )}
        {showEmptyState && (
          <div className="empty-state">
            No bravery has been rolled yet. Enter your squad above and hit <b>Roll The Team</b>.
          </div>
        )}
      </motion.div>

      <footer>Not affiliated with Riot Games. Art &amp; data via Data Dragon (Riot's public asset CDN). Build responsibly (you won't).</footer>
    </div>
    </>
  );
}
