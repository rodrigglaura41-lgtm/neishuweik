import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Lesson2({ onComplete, onMistake }: { onComplete: () => void; onMistake: () => void }) {
  const questions = [
    { wam: 'kuarƟ pƟlmera', options: ['Primavera', 'Invierno', 'Verano', 'Otoño'], correct: 0 },
    { wam: 'Isik PƟlmera', options: ['Primavera', 'Invierno', 'Verano', 'Otoño'], correct: 3 },
    { wam: 'Pachik PƟlmera', options: ['Primavera', 'Invierno', 'Verano', 'Otoño'], correct: 2 },    
    { wam: 'Sre PƟlmera', options: ['Primavera', 'Invierno', 'Verano', 'Otoño'], correct: 1 },
    
   
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const handleSelect = (idx: number) => {
    if (status !== 'idle') return;
    setSelectedOpt(idx);

    if (idx === questions[currentQ].correct) {
      setStatus('correct');
      setTimeout(() => {
        if (currentQ < questions.length - 1) {
          setCurrentQ(q => q + 1);
          setSelectedOpt(null);
          setStatus('idle');
        } else {
          onComplete();
        }
      }, 1400);
    } else {
      setStatus('wrong');
      onMistake();
      setTimeout(() => { setSelectedOpt(null); setStatus('idle'); }, 1000);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border-4 border-foreground shadow-[0_8px_0_0_#111827] overflow-hidden flex flex-col">
      {/* Progress indicator */}
      <div className="flex gap-1 px-4 pt-4">
        {questions.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-2 rounded-full border border-foreground/20 transition-all"
            style={{ backgroundColor: i < currentQ ? '#10B981' : i === currentQ ? '#1E3A8A' : '#E5E7EB' }}
          />
        ))}
      </div>

      <div className="p-4 sm:p-6 border-b-4 border-foreground" style={{ backgroundColor: '#1E3A8A' }}>
        <h2 className="text-base sm:text-xl font-bold mb-2 text-white">Traduce esta estación:</h2>
        <p className="text-2xl sm:text-3xl font-black text-center py-3 sm:py-4 bg-white/20 rounded-xl border-2 border-white/50 text-white break-words">
          {questions[currentQ].wam}
        </p>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-3">
        {questions[currentQ].options.map((opt, idx) => {
          let style: React.CSSProperties = {};
          let extraClass = 'bg-white text-foreground hover:bg-muted';

          if (selectedOpt === idx) {
            if (status === 'correct') { style = { backgroundColor: '#10B981', color: '#fff', borderColor: '#059669' }; extraClass = ''; }
            else if (status === 'wrong') { style = { backgroundColor: '#E6007E', color: '#fff', borderColor: '#BE185D' }; extraClass = 'animate-shake'; }
            else { style = { backgroundColor: '#EFF6FF', borderColor: '#1E3A8A', color: '#1E3A8A' }; extraClass = ''; }
          } else if (status === 'correct' && idx === questions[currentQ].correct) {
            style = { backgroundColor: '#10B981', color: '#fff', borderColor: '#059669' }; extraClass = '';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              style={style}
              className={`p-3 sm:p-4 rounded-xl font-bold text-sm sm:text-base border-2 border-border text-left min-h-[52px]
                shadow-[0_4px_0_0_#111827] active:translate-y-[2px] active:shadow-[0_2px_0_0_#111827]
                transition-all ${extraClass}
              `}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="p-3 sm:p-4 font-bold text-base sm:text-lg text-center text-white"
            style={{ backgroundColor: status === 'correct' ? '#10B981' : '#E6007E' }}
          >
            {status === 'correct' ? '¡Excelente! ✨ ! SƟl KƟn ¡' : '¡Uy! Intenta de nuevo 💔 KatƟle'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
