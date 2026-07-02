import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VocabLevel, VocabEntry } from '@/data/vocabulario';
import {
  shuffle, randomSample, tokenizeNamtrik, generateQuestions,
} from '@/utils/challengeUtils';
import { MisakGuide, GuideBehavior } from './MisakGuide';

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export function DynamicChallenge({ level, onComplete, onMistake }: {
  level: VocabLevel;
  onComplete: () => void;
  onMistake: () => void;
}) {
  const questions = useMemo(() => generateQuestions(level), [level]);
  const [currentQ, setCurrentQ] = useState(0);

  // Guide reactive state
  const [guideBehavior, setGuideBehavior] = useState<GuideBehavior>('idle');
  const [guideSpeech,   setGuideSpeech]   = useState<string | undefined>(
    '¡Tú puedes! Cada palabra te acerca al corazón del Namui Wam. 💚'
  );

  const words = level.palabras;

  const handleSuccess = useCallback(() => {
    setGuideBehavior('happy');
    setGuideSpeech('¡Өyampesi sӨl lӨtan payiwan Ñishik! (¡Excelente!) 🌟');
    const next = currentQ + 1;
    setTimeout(() => {
      setGuideBehavior('idle');
      setGuideSpeech(undefined);
    }, 2400);
    if (next >= 5) onComplete();
    else setCurrentQ(next);
  }, [currentQ, onComplete]);

  const handleMistake = useCallback(() => {
    setGuideBehavior('supportive');
    setGuideSpeech('¡No te preocupes! El tejido del saber toma tiempo. ¡Sigue adelante! ✨');
    onMistake();
    setTimeout(() => {
      setGuideBehavior('idle');
      setGuideSpeech(undefined);
    }, 2600);
  }, [onMistake]);

  const current = questions[currentQ];

  return (
    <div className="w-full flex flex-col items-center px-3 sm:px-4">
      {/* Level header */}
      <div className="w-full mb-4 text-center">
        <h2 className="text-lg sm:text-xl font-black" style={{ color: level.color }}>
          {level.titulo}
        </h2>
        <p className="text-xs text-muted-foreground font-semibold">Desafío · 5 preguntas</p>
      </div>

      {/* Progress steps */}
      <div className="w-full flex gap-1.5 mb-4">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 h-3 rounded-full border border-foreground/20 transition-all duration-400"
            style={{ backgroundColor: i < currentQ ? '#10B981' : i === currentQ ? level.color : '#E5E7EB' }}
          />
        ))}
      </div>

      {/* Guide banner */}
      <div className="w-full mb-4 flex justify-center">
        <MisakGuide
          behavior={guideBehavior}
          speech={guideSpeech}
          size={64}
          speechSide="right"
        />
      </div>

      {/* Current mini-game */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ}
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}
          className="w-full"
        >
          {current.type === 'multiple-choice' && (
            <MultipleChoiceGame word={words[current.wordIndices[0]]} allWords={words}
              color={level.color} onSuccess={handleSuccess} onMistake={handleMistake} />
          )}
          {current.type === 'matching' && (
            <MatchingGame words={current.wordIndices.map(i => words[i])}
              color={level.color} onSuccess={handleSuccess} onMistake={handleMistake} />
          )}
          {current.type === 'true-false' && (
            <TrueFalseGame
              word={words[current.wordIndices[0]]}
              shownEmoji={current.isCorrect
                ? words[current.wordIndices[0]].emoji
                : words[current.wrongEmojiIdx!].emoji}
              isCorrect={current.isCorrect!}
              color={level.color} onSuccess={handleSuccess} onMistake={handleMistake} />
          )}
          {current.type === 'word-builder' && (
            <WordBuilderGame word={words[current.wordIndices[0]]}
              color={level.color} onSuccess={handleSuccess} onMistake={handleMistake} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Mini-game 1: ¿Quién es quién? ───────────────────────────────────────────

function MultipleChoiceGame({ word, allWords, color, onSuccess, onMistake }: {
  word: VocabEntry; allWords: VocabEntry[]; color: string;
  onSuccess: () => void; onMistake: () => void;
}) {
  const options = useMemo(() =>
    shuffle([word, ...shuffle(allWords.filter(w => w.namtrik !== word.namtrik)).slice(0, 3)]),
    [word, allWords]);
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus]     = useState<'idle' | 'correct' | 'wrong'>('idle');

  const handleSelect = (idx: number) => {
    if (status !== 'idle') return;
    setSelected(idx);
    if (options[idx].namtrik === word.namtrik) {
      setStatus('correct'); setTimeout(onSuccess, 1100);
    } else {
      setStatus('wrong'); onMistake();
      setTimeout(() => { setSelected(null); setStatus('idle'); }, 1000);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border-4 border-foreground shadow-[0_8px_0_0_#111827] overflow-hidden">
      <div className="p-4 sm:p-5 border-b-4 border-foreground" style={{ backgroundColor: color }}>
        <p className="text-xs font-black text-white/80 uppercase tracking-widest mb-3">🎯 ¿Quién es quién?</p>
        <div className="flex items-center gap-3 bg-white/20 rounded-2xl p-3 sm:p-4">
          <span className="text-4xl sm:text-5xl flex-shrink-0">{word.emoji}</span>
          <div>
            <p className="text-xs font-bold text-white/70 uppercase">Español</p>
            <p className="text-xl sm:text-2xl font-black text-white leading-tight">{word.es}</p>
          </div>
        </div>
        <p className="text-center text-white/90 font-bold text-xs sm:text-sm mt-3">¿Cómo se dice en Namtrik?</p>
      </div>
      <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
        {options.map((opt, idx) => {
          let style: React.CSSProperties = {};
          let cls = 'bg-white hover:bg-muted text-foreground border-border';
          if (selected === idx) {
            if (status === 'correct') { style = { backgroundColor:'#10B981',color:'#fff',borderColor:'#059669' }; cls=''; }
            else if (status === 'wrong') { style = { backgroundColor:'#E6007E',color:'#fff',borderColor:'#BE185D' }; cls='animate-shake'; }
          } else if (status === 'correct' && opt.namtrik === word.namtrik) {
            style = { backgroundColor:'#10B981',color:'#fff',borderColor:'#059669' }; cls='';
          }
          return (
            <button key={idx} onClick={() => handleSelect(idx)} style={style}
              className={`p-3 sm:p-4 rounded-xl font-bold text-xs sm:text-sm border-2 shadow-[0_3px_0_0_#111827] active:translate-y-[2px] active:shadow-none transition-all min-h-[48px] text-left break-words ${cls}`}>
              {opt.namtrik}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div initial={{ y:10, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ opacity:0 }}
            className="px-4 pb-4 font-bold text-center text-sm sm:text-base"
            style={{ color: status==='correct'?'#10B981':'#E6007E' }}>
            {status==='correct' ? '¡Correcto! ✨' : '¡Uy! Inténtalo de nuevo 💔'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mini-game 2: Emparejamiento Relámpago ────────────────────────────────────

function MatchingGame({ words, color, onSuccess, onMistake }: {
  words: VocabEntry[]; color: string; onSuccess:()=>void; onMistake:()=>void;
}) {
  const leftOrder  = useMemo(() => shuffle([0,1,2]), []);
  const rightOrder = useMemo(() => shuffle([0,1,2]), []);
  const [selectedLeft, setSelectedLeft] = useState<number|null>(null);
  const [matched, setMatched]           = useState<Set<number>>(new Set());
  const [shakePair, setShakePair]       = useState(false);

  const handleLeft = (pos: number) => {
    if (matched.has(leftOrder[pos])) return;
    setSelectedLeft(p => p === pos ? null : pos);
  };
  const handleRight = (pos: number) => {
    const wIdx = rightOrder[pos];
    if (matched.has(wIdx) || selectedLeft === null) return;
    if (leftOrder[selectedLeft] === wIdx) {
      const next = new Set(matched); next.add(wIdx); setMatched(next);
      setSelectedLeft(null);
      if (next.size === 3) setTimeout(onSuccess, 600);
    } else {
      setShakePair(true); onMistake();
      setTimeout(() => { setSelectedLeft(null); setShakePair(false); }, 700);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border-4 border-foreground shadow-[0_8px_0_0_#111827] p-4 sm:p-5">
      <div className="mb-4 text-center">
        <p className="font-black text-sm sm:text-base" style={{ color }}>⚡ Emparejamiento Relámpago</p>
        <p className="text-xs text-muted-foreground font-semibold mt-0.5">
          {selectedLeft===null ? 'Selecciona una palabra en Español' : 'Ahora toca su traducción en Namtrik'}
        </p>
      </div>
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-1 flex flex-col gap-2">
          {leftOrder.map((wIdx, lPos) => {
            const w=words[wIdx]; const isM=matched.has(wIdx); const isSel=selectedLeft===lPos;
            return (
              <button key={lPos} disabled={isM} onClick={() => handleLeft(lPos)}
                className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl border-2 font-bold text-xs transition-all min-h-[54px]
                  ${isM?'opacity-20 border-transparent cursor-default':isSel?'text-white border-foreground shadow-[0_3px_0_0_#111827]':'bg-white border-border hover:bg-muted shadow-[0_3px_0_0_#111827] active:translate-y-[2px] active:shadow-none'}`}
                style={isSel&&!isM?{backgroundColor:color}:{}}>
                <span className="text-xl sm:text-2xl flex-shrink-0">{w.emoji}</span>
                <span className="truncate text-left">{w.es}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          {rightOrder.map((wIdx, rPos) => {
            const w=words[wIdx]; const isM=matched.has(wIdx);
            let rightCls = 'flex items-center justify-center p-2 sm:p-3 rounded-xl border-2 font-bold text-xs transition-all min-h-[54px] text-center ';
            if (isM) rightCls += 'opacity-20 border-transparent cursor-default';
            else if (selectedLeft !== null) rightCls += 'border-foreground bg-muted hover:bg-muted/70 shadow-[0_3px_0_0_#111827] active:translate-y-[2px] active:shadow-none ' + (shakePair ? 'animate-shake' : '');
            else rightCls += 'bg-white border-border opacity-50 cursor-default';
            return (
              <button key={rPos} disabled={isM||selectedLeft===null} onClick={() => handleRight(rPos)} className={rightCls}>
                <span className="leading-tight break-words">{w.namtrik}</span>
              </button>
            );
          })}
        </div>
      </div>
      {matched.size===3 && (
        <motion.p initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}
          className="text-center font-black text-sm mt-3" style={{color:'#10B981'}}>
          ¡Todas emparejadas! 🎉
        </motion.p>
      )}
    </div>
  );
}

// ─── Mini-game 3: ¿Verdad o Mentira? ─────────────────────────────────────────

function TrueFalseGame({ word, shownEmoji, isCorrect, color, onSuccess, onMistake }: {
  word:VocabEntry; shownEmoji:string; isCorrect:boolean; color:string;
  onSuccess:()=>void; onMistake:()=>void;
}) {
  const [status, setStatus] = useState<'idle'|'correct'|'wrong'>('idle');
  const handleAnswer = (userSaysCorrect: boolean) => {
    if (status!=='idle') return;
    if (userSaysCorrect===isCorrect) { setStatus('correct'); setTimeout(onSuccess,1000); }
    else { setStatus('wrong'); onMistake(); setTimeout(()=>setStatus('idle'),1000); }
  };
  return (
    <div className="w-full bg-white rounded-3xl border-4 border-foreground shadow-[0_8px_0_0_#111827] p-4 sm:p-5">
      <p className="text-center font-black text-sm sm:text-base mb-1" style={{color}}>🃏 ¿Verdad o Mentira?</p>
      <p className="text-center text-xs font-semibold text-muted-foreground mb-4">¿El emoji corresponde a la palabra?</p>
      <div className="flex flex-col items-center gap-3 bg-muted/30 rounded-2xl p-4 sm:p-5 border-2 border-border mb-5">
        <span className="text-5xl sm:text-6xl">{shownEmoji}</span>
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Español</p>
          <p className="text-xl sm:text-2xl font-black mt-1">{word.es}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={()=>handleAnswer(true)} disabled={status!=='idle'}
          className="flex-1 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg text-white border-2 border-foreground shadow-[0_4px_0_0_#111827] active:translate-y-[2px] active:shadow-[0_2px_0_0_#111827] transition-all disabled:opacity-70"
          style={{backgroundColor:'#10B981'}}>✅ Correcto</button>
        <button onClick={()=>handleAnswer(false)} disabled={status!=='idle'}
          className="flex-1 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg text-white border-2 border-foreground shadow-[0_4px_0_0_#111827] active:translate-y-[2px] active:shadow-[0_2px_0_0_#111827] transition-all disabled:opacity-70"
          style={{backgroundColor:'#E6007E'}}>❌ Incorrecto</button>
      </div>
      <AnimatePresence>
        {status!=='idle' && (
          <motion.p initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className="text-center font-black text-sm sm:text-base mt-3"
            style={{color:status==='correct'?'#10B981':'#E6007E'}}>
            {status==='correct' ? '¡Exacto! 🎉' : `Era ${isCorrect?'Correcto ✅':'Incorrecto ❌'} 💔`}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mini-game 4: Constructor de Palabras ────────────────────────────────────

function WordBuilderGame({ word, color, onSuccess, onMistake }: {
  word:VocabEntry; color:string; onSuccess:()=>void; onMistake:()=>void;
}) {
  const tokens       = useMemo(()=>tokenizeNamtrik(word.namtrik),[word]);
  const shuffledInit = useMemo(()=>shuffle([...tokens]),[tokens]);
  const [available,setAvailable] = useState<string[]>(()=>shuffledInit);
  const [built,    setBuilt]     = useState<string[]>([]);
  const [status,   setStatus]    = useState<'idle'|'correct'|'wrong'>('idle');
  const sep = word.namtrik.includes(' ')?' ':'';

  const addToken = (token:string, i:number) => {
    if (status!=='idle') return;
    const newA=available.filter((_,j)=>j!==i), newB=[...built,token];
    setAvailable(newA); setBuilt(newB);
    if (newB.length===tokens.length) {
      if (newB.join(sep)===word.namtrik) { setStatus('correct'); setTimeout(onSuccess,1000); }
      else { setStatus('wrong'); onMistake(); setTimeout(()=>{setAvailable(shuffledInit);setBuilt([]);setStatus('idle');},1100); }
    }
  };
  const removeToken=(i:number)=>{
    if (status!=='idle') return;
    const t=built[i]; setBuilt(b=>b.filter((_,j)=>j!==i)); setAvailable(a=>[...a,t]);
  };

  return (
    <div className="w-full bg-white rounded-3xl border-4 border-foreground shadow-[0_8px_0_0_#111827] p-4 sm:p-5">
      <p className="text-center font-black text-sm sm:text-base mb-1" style={{color}}>🔤 Constructor de Palabras</p>
      <p className="text-center text-xs font-semibold text-muted-foreground mb-4">Ordena las piezas para escribir la traducción en Namtrik</p>
      <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-3 border-2 border-border mb-4">
        <span className="text-4xl sm:text-5xl flex-shrink-0">{word.emoji}</span>
        <div>
          <p className="text-xs text-muted-foreground font-black uppercase tracking-wider">Español</p>
          <p className="text-lg sm:text-xl font-black leading-tight">{word.es}</p>
        </div>
      </div>
      <div className="min-h-[56px] border-2 border-dashed rounded-xl p-2 mb-4 flex flex-wrap gap-2 items-center transition-colors"
        style={{borderColor:status==='correct'?'#10B981':status==='wrong'?'#E6007E':color+'77'}}>
        {built.length===0
          ? <span className="text-xs text-muted-foreground font-semibold px-2 self-center">Toca las piezas en orden...</span>
          : built.map((t,i)=>(
              <button key={i} onClick={()=>removeToken(i)}
                className="px-2 sm:px-3 py-1.5 rounded-lg border-2 border-foreground font-black text-xs sm:text-sm text-white shadow-[0_2px_0_0_#111827] active:translate-y-[1px] active:shadow-none transition-all"
                style={{backgroundColor:color}}>{t}</button>
            ))
        }
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {available.map((t,i)=>(
          <button key={`${t}-${i}`} onClick={()=>addToken(t,i)}
            className="px-2 sm:px-3 py-2 rounded-xl border-2 border-foreground bg-white font-black text-xs sm:text-sm shadow-[0_3px_0_0_#111827] active:translate-y-[2px] active:shadow-[0_1px_0_0_#111827] transition-all hover:bg-muted min-h-[44px]">
            {t}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {status!=='idle' && (
          <motion.p initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className="text-center font-black text-sm sm:text-base mt-4 break-words"
            style={{color:status==='correct'?'#10B981':'#E6007E'}}>
            {status==='correct' ? '¡Perfecto! ✨' : '¡Orden incorrecto! Intenta de nuevo 💔'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
