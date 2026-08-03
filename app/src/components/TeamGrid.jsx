import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card.jsx';
import { themeLabel } from '../lib/theme.js';

export default function TeamGrid({ results, currentTheme, effectiveTheme, onReroll, gridRef }){
  return (
    <>
      {currentTheme === 'random' && (
        <motion.div
          className="theme-flag show"
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
        >
          {effectiveTheme === 'random'
            ? '🎰 Fully Random roll'
            : `🎲 Surprise theme landed: ${themeLabel(effectiveTheme)}!`}
        </motion.div>
      )}
      <div className="team-grid show" ref={gridRef}>
        <AnimatePresence mode="popLayout">
          {results.map((slot,i)=>(
            <Card key={slot.champ.id + '-' + i} slot={slot} index={i} onReroll={onReroll} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
