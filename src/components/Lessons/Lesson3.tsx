import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Lesson3({ onComplete, onMistake }: { onComplete: () => void; onMistake: () => void }) {
  const targetPhrase = ['Nei', 'Undareikshik'];
  const allBlocks = ['Undareikshik', 'Nei', '❤️'];

  const [availableBlocks, setAvailableBlocks] = useState(allBlocks);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const handleSelect = (block: string, index: number) => {
    if (status !== 'idle') return;
    const newAvailable = [...availableBlocks];
    newAvailable.splice(index, 1);
    setAvailableBlocks(newAvailable);
    const newSelected = [...selectedBlocks, block];
    setSelectedBlocks(newSelected);

    if (newSelected.length === targetPhrase.length) {
      const isCorrect = newSelected.every((val, i) => val === targetPhrase[i]);
      if (isCorrect) {
        setStatus('correct');
        setTimeout(onComplete, 2000);
      } else {
        setStatus('wrong');
        onMistake();
        setTimeout(() => { setAvailableBlocks(allBlocks); setSelectedBlocks([]); setStatus('idle'); }, 1500);
      }
    }
  };

  const handleDeselect = (block: string, index: number) => {
    if (status !== 'idle') return;
    const newSelected = [...selectedBlocks];
    newSelected.splice(index, 1);
    setSelectedBlocks(newSelected);
    setAvailableBlocks([...availableBlocks, block]);
  };

  return (
    <div className="w-full bg-white rounded-3xl border-4 border-foreground shadow-[0_8px_0_0_#111827] overflow-hidden flex flex-col p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-black text-center mb-1">Forma la frase</h2>
      <p className="text-center font-bold mb-6 text-base sm:text-xl" style={{ color: '#1E3A8A' }}>
        "Te quiero mucho"
      </p>

      {/* Target area */}
      <div
        className="min-h-[64px] sm:min-h-[80px] border-b-2 border-dashed border-border mb-6 flex flex-wrap gap-2 pb-2 items-end justify-center"
      >
        {selectedBlocks.length === 0 && (
          <span className="text-muted-foreground text-sm font-semibold self-center pb-2">
            Toca las palabras en orden...
          </span>
        )}
        {selectedBlocks.map((block, i) => (
          <motion.button
            layoutId={`block-${block}-${i}`}
            key={`sel-${i}`}
            onClick={() => handleDeselect(block, i)}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-card border-2 border-foreground rounded-xl font-bold text-sm sm:text-base shadow-[0_3px_0_0_#111827] active:translate-y-[1px] active:shadow-none min-h-[44px]"
          >
            {block}
          </motion.button>
        ))}
      </div>

      {/* Available blocks */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {availableBlocks.map((block, i) => (
          <motion.button
            layoutId={`block-${block}-avail-${i}`}
            key={`av-${i}-${block}`}
            onClick={() => handleSelect(block, i)}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-foreground rounded-xl font-bold text-sm sm:text-lg shadow-[0_4px_0_0_#111827] active:translate-y-[2px] active:shadow-[0_2px_0_0_#111827] transition-all hover:bg-muted min-h-[48px]"
          >
            {block}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-6 p-3 sm:p-4 rounded-xl font-bold text-base sm:text-xl text-center text-white"
            style={{ backgroundColor: status === 'correct' ? '#10B981' : '#E6007E' }}
          >
            {status === 'correct' ? '¡Perfecto! Nei Undareikshik 💖' : 'Ups... Intenta de nuevo'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
