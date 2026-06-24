import React, { useState } from 'react';

export function Lesson1({ onComplete, onMistake }: { onComplete: () => void; onMistake: () => void }) {
  const pairs = [
    { id: 1, wam: 'KAN', es: '1' },
    { id: 2, wam: 'PA', es: '2' },
    { id: 3, wam: 'PƟN', es: '3' },
    { id: 4, wam: 'PIP', es: '4' },
    { id: 5, wam: 'TRATTRƟ', es: '5' }
  ];

  const [wamWords] = useState(() => [...pairs].sort(() => Math.random() - 0.5));
  const [esWords] = useState(() => [...pairs].sort(() => Math.random() - 0.5));

  const [selectedWam, setSelectedWam] = useState<number | null>(null);
  const [selectedEs, setSelectedEs] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [shake, setShake] = useState(false);

  const handleWamClick = (id: number) => {
    if (matchedPairs.includes(id)) return;
    const newWam = selectedWam === id ? null : id;
    setSelectedWam(newWam);
    if (newWam !== null && selectedEs !== null) checkMatch(newWam, selectedEs);
  };

  const handleEsClick = (id: number) => {
    if (matchedPairs.includes(id)) return;
    const newEs = selectedEs === id ? null : id;
    setSelectedEs(newEs);
    if (selectedWam !== null && newEs !== null) checkMatch(selectedWam, newEs);
  };

  const checkMatch = (wamId: number, esId: number) => {
    if (wamId === esId) {
      const newMatched = [...matchedPairs, wamId];
      setMatchedPairs(newMatched);
      setSelectedWam(null);
      setSelectedEs(null);
      if (newMatched.length === pairs.length) setTimeout(onComplete, 800);
    } else {
      setShake(true);
      onMistake();
      setTimeout(() => {
        setShake(false);
        setSelectedWam(null);
        setSelectedEs(null);
      }, 500);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border-4 border-foreground shadow-[0_8px_0_0_#111827] p-4 sm:p-6 flex flex-col">
      <h2 className="text-xl sm:text-2xl font-black text-center mb-2">Empareja los números</h2>
      <p className="text-center text-xs sm:text-sm text-muted-foreground font-semibold mb-4">
        Toca una palabra en Namui Wam y luego su número
      </p>

      <div className={`flex justify-between gap-2 sm:gap-4 ${shake ? 'animate-shake' : ''}`}>
        {/* Namui Wam column */}
        <div className="flex flex-col gap-2 sm:gap-3 flex-1">
          <p className="text-center text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">Namui Wam</p>
          {wamWords.map(word => {
            const isMatched = matchedPairs.includes(word.id);
            const isSelected = selectedWam === word.id;
            return (
              <button
                key={`wam-${word.id}`}
                disabled={isMatched}
                onClick={() => handleWamClick(word.id)}
                className={`py-3 sm:py-4 px-1 sm:px-2 rounded-xl font-bold text-xs sm:text-sm border-2 transition-all min-h-[48px]
                  ${isMatched
                    ? 'bg-green-100 border-green-500 text-green-700 opacity-60'
                    : isSelected
                    ? 'border-[#1E3A8A] text-white'
                    : 'bg-card border-border hover:bg-muted text-foreground'
                  }
                  ${!isMatched && 'shadow-[0_4px_0_0_#111827] active:translate-y-[2px] active:shadow-[0_2px_0_0_#111827]'}
                `}
                style={isSelected && !isMatched ? { backgroundColor: '#1E3A8A' } : {}}
              >
                {word.wam}
              </button>
            );
          })}
        </div>

        {/* Spanish column */}
        <div className="flex flex-col gap-2 sm:gap-3 flex-1">
          <p className="text-center text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">Número</p>
          {esWords.map(word => {
            const isMatched = matchedPairs.includes(word.id);
            const isSelected = selectedEs === word.id;
            return (
              <button
                key={`es-${word.id}`}
                disabled={isMatched}
                onClick={() => handleEsClick(word.id)}
                className={`py-3 sm:py-4 px-1 sm:px-2 rounded-xl font-black text-xl sm:text-2xl border-2 transition-all min-h-[48px]
                  ${isMatched
                    ? 'bg-green-100 border-green-500 text-green-700 opacity-60'
                    : isSelected
                    ? 'border-[#E6007E] text-white'
                    : 'bg-card border-border hover:bg-muted text-foreground'
                  }
                  ${!isMatched && 'shadow-[0_4px_0_0_#111827] active:translate-y-[2px] active:shadow-[0_2px_0_0_#111827]'}
                `}
                style={isSelected && !isMatched ? { backgroundColor: '#E6007E' } : {}}
              >
                {word.es}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 text-center text-sm font-bold text-muted-foreground">
        {matchedPairs.length} / {pairs.length} emparejados
      </div>
    </div>
  );
}
