import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vocabulario, VocabLevel, VocabEntry } from '@/data/vocabulario';

export function Vocabulario() {
  const [selectedLevel, setSelectedLevel] = useState<VocabLevel | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (studyMode && selectedLevel) {
    const word = selectedLevel.palabras[cardIndex];
    return (
      <StudyCard
        level={selectedLevel}
        word={word}
        index={cardIndex}
        total={selectedLevel.palabras.length}
        flipped={flipped}
        onFlip={() => setFlipped(f => !f)}
        onNext={() => { setCardIndex(i => Math.min(i + 1, selectedLevel.palabras.length - 1)); setFlipped(false); }}
        onPrev={() => { setCardIndex(i => Math.max(i - 1, 0)); setFlipped(false); }}
        onClose={() => { setStudyMode(false); setCardIndex(0); setFlipped(false); }}
      />
    );
  }

  if (selectedLevel) {
    return (
      <LevelView
        level={selectedLevel}
        onBack={() => setSelectedLevel(null)}
        onStudy={() => { setStudyMode(true); setCardIndex(0); setFlipped(false); }}
      />
    );
  }

  return <LevelSelector onSelect={setSelectedLevel} />;
}

function LevelSelector({ onSelect }: { onSelect: (l: VocabLevel) => void }) {
  return (
    <div className="w-full px-3 sm:px-4 py-4 flex flex-col items-center">
      <div className="text-center mb-6 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">Vocabulario</h2>
        <p className="text-muted-foreground font-semibold text-sm sm:text-base mt-1">
          Elige un nivel para aprender nuevas palabras
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {vocabulario.map((level, idx) => (
          <motion.button
            key={level.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.07 }}
            onClick={() => onSelect(level)}
            data-testid={`level-btn-${level.id}`}
            className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-foreground shadow-[0_4px_0_0_#111827] active:translate-y-[3px] active:shadow-[0_1px_0_0_#111827] transition-all text-left"
          >
            <div
              className="w-14 h-14 rounded-xl border-2 border-foreground flex items-center justify-center text-xl font-black flex-shrink-0"
              style={{ backgroundColor: level.color, color: '#fff' }}
            >
              N{level.id}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-base text-foreground">{level.titulo}</div>
              <div className="text-xs text-muted-foreground font-semibold mt-0.5 truncate">
                {level.subtitulo}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {'⭐'.repeat(level.stars).split('').map((s, i) => (
                  <span key={i} className="text-xs">{s}</span>
                ))}
                <span className="text-xs text-muted-foreground ml-1 font-semibold">
                  {level.palabras.length} palabras
                </span>
              </div>
            </div>
            <span className="text-muted-foreground text-xl flex-shrink-0">›</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function LevelView({ level, onBack, onStudy }: { level: VocabLevel; onBack: () => void; onStudy: () => void }) {
  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="px-3 sm:px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 font-bold text-sm text-foreground/60 hover:text-foreground transition-colors mb-3"
        >
          ← Niveles
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl border-2 border-foreground flex items-center justify-center text-lg font-black flex-shrink-0"
            style={{ backgroundColor: level.color, color: '#fff' }}
          >
            N{level.id}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground leading-tight">{level.titulo}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">{level.subtitulo}</p>
          </div>
        </div>

        <button
          onClick={onStudy}
          className="w-full py-3 rounded-xl font-black text-base text-white border-2 border-foreground shadow-[0_4px_0_0_#111827] active:translate-y-[3px] active:shadow-[0_1px_0_0_#111827] transition-all"
          style={{ backgroundColor: level.color }}
        >
          🎴 Estudiar con tarjetas ({level.palabras.length})
        </button>
      </div>

      {/* Column headers */}
      <div
        className="flex items-center px-3 sm:px-4 py-2 border-y-2 border-foreground sticky top-[57px] z-10"
        style={{ backgroundColor: level.bg }}
      >
        <div className="flex-1 text-xs font-black text-muted-foreground uppercase tracking-wider text-left">Español</div>
        <div className="w-14 sm:w-16 text-xs font-black text-muted-foreground uppercase tracking-wider text-center">Imagen</div>
        <div className="flex-1 text-xs font-black text-muted-foreground uppercase tracking-wider text-right">Namtrik</div>
      </div>

      {/* Word list */}
      <div className="flex flex-col divide-y-2 divide-border px-1 sm:px-2 pb-8">
        {level.palabras.map((word, i) => (
          <WordRow key={i} word={word} index={i} color={level.color} />
        ))}
      </div>
    </div>
  );
}

function WordRow({ word, index, color }: { word: VocabEntry; index: number; color: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.5) }}
      onClick={() => setRevealed(r => !r)}
      data-testid={`word-row-${index}`}
      className="flex items-center px-2 sm:px-3 py-3 gap-2 sm:gap-3 hover:bg-muted/40 active:bg-muted/60 transition-colors text-left w-full"
    >
      {/* Spanish */}
      <div className="flex-1 min-w-0">
        <span className="font-bold text-sm sm:text-base text-foreground leading-tight block">
          {word.es}
        </span>
      </div>

      {/* Emoji center */}
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-foreground flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
        style={{ backgroundColor: revealed ? color + '22' : '#F9FAFB', borderColor: revealed ? color : '#111827' }}
      >
        {word.emoji}
      </div>

      {/* Namtrik */}
      <div className="flex-1 min-w-0 text-right">
        <AnimatePresence mode="wait">
          {revealed ? (
            <motion.span
              key="revealed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-black text-xs sm:text-sm leading-tight block"
              style={{ color }}
            >
              {word.namtrik}
            </motion.span>
          ) : (
            <motion.span
              key="hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-xs text-muted-foreground block"
            >
              Toca para ver →
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

function StudyCard({
  level, word, index, total, flipped, onFlip, onNext, onPrev, onClose
}: {
  level: VocabLevel; word: VocabEntry; index: number; total: number;
  flipped: boolean; onFlip: () => void;
  onNext: () => void; onPrev: () => void; onClose: () => void;
}) {
  const progress = ((index + 1) / total) * 100;

  return (
    <div className="w-full flex flex-col items-center px-3 sm:px-4 py-4 min-h-[80vh]">
      {/* Top bar */}
      <div className="w-full max-w-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1 font-bold text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            ✕ Cerrar
          </button>
          <span className="font-bold text-sm text-muted-foreground">
            {index + 1} / {total}
          </span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full border-2 border-foreground overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: level.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center gap-5">
        <motion.button
          onClick={onFlip}
          whileTap={{ scale: 0.97 }}
          data-testid="study-card"
          className="w-full bg-white rounded-3xl border-4 border-foreground shadow-[0_8px_0_0_#111827] p-6 sm:p-8 flex flex-col items-center gap-5 min-h-[260px] sm:min-h-[300px] justify-center"
        >
          {/* Emoji */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-3 border-foreground flex items-center justify-center text-5xl sm:text-6xl"
            style={{ backgroundColor: level.color + '18', borderColor: level.color }}
          >
            {word.emoji}
          </div>

          {/* Spanish word always visible */}
          <div className="text-center">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Español</p>
            <p className="text-2xl sm:text-3xl font-black text-foreground">{word.es}</p>
          </div>

          {/* Namtrik — revealed on flip */}
          <AnimatePresence mode="wait">
            {flipped ? (
              <motion.div
                key="namtrik"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center w-full border-t-2 border-dashed border-border pt-4"
              >
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Namtrik</p>
                <p className="text-xl sm:text-2xl font-black" style={{ color: level.color }}>
                  {word.namtrik}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center border-t-2 border-dashed border-border pt-4 w-full"
              >
                <p className="text-sm font-bold text-muted-foreground">
                  Toca para ver en Namtrik
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Navigation */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onPrev}
            disabled={index === 0}
            className="flex-1 py-3 rounded-xl font-bold text-base border-2 border-foreground bg-white shadow-[0_4px_0_0_#111827] active:translate-y-[3px] active:shadow-[0_1px_0_0_#111827] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <button
            onClick={onNext}
            disabled={index === total - 1}
            className="flex-1 py-3 rounded-xl font-black text-base text-white border-2 border-foreground shadow-[0_4px_0_0_#111827] active:translate-y-[3px] active:shadow-[0_1px_0_0_#111827] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: level.color }}
          >
            Siguiente →
          </button>
        </div>

        {index === total - 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-full p-4 rounded-2xl border-2 border-foreground text-center font-black text-base"
            style={{ backgroundColor: level.color + '22', color: level.color }}
          >
            🎉 ¡Terminaste el Nivel {level.id}! ¡Excelente!
          </motion.div>
        )}
      </div>
    </div>
  );
}
