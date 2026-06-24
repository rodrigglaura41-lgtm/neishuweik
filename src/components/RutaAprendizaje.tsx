import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lesson1 } from './Lessons/Lesson1';
import { Lesson2 } from './Lessons/Lesson2';
import { DynamicChallenge } from './DynamicChallenge';
import { MisakShield } from './MisakShield';
import { MisakGuide } from './MisakGuide';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { vocabulario } from '@/data/vocabulario';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_LESSONS = 7;

const NODES = [
  { id: 1, title: 'Números',     subtitle: 'Kampawam',         icon: '🔢', offset: '-translate-x-10 sm:-translate-x-16' },
  { id: 2, title: '4 Estaciones del año',  subtitle: 'Pip UtƟmera Pilayu',     icon: '🌿', offset: 'translate-x-10 sm:translate-x-16'   },
  { id: 3, title: 'El Cuerpo',   subtitle: 'Nei Asr',         icon: '🧍', offset: '-translate-x-10 sm:-translate-x-16' },
  { id: 4, title: 'El Hogar',    subtitle: 'Yampu PonstrapelƟ', icon: '🏠', offset: 'translate-x-10 sm:translate-x-16'   },
  { id: 5, title: 'Tecnología',  subtitle: 'Wamsrup',         icon: '💻', offset: '-translate-x-10 sm:-translate-x-16' },
  { id: 6, title: 'Matemáticas', subtitle: 'NemarƟp',         icon: '📐', offset: 'translate-x-10 sm:translate-x-16'   },
  { id: 7, title: 'Sociedad',    subtitle: 'MukƟpen',       icon: '🌍', offset: '-translate-x-10 sm:-translate-x-16' },
] as const;

const VOCAB_MAP: Record<number, number> = { 3: 0, 4: 1, 5: 2, 6: 3, 7: 4 };

const FINAL_MESSAGE = `Aprendiste los números, las estaciones, el cuerpo, los objetos del hogar, la tecnología, las matemáticas y los conceptos de la sociedad Misak.`;

// ─── Root Component ───────────────────────────────────────────────────────────

export function RutaAprendizaje() {
  const [hearts,             setHearts]             = useState(3);
  const [completedLessons,   setCompletedLessons]   = useState<number[]>([]);
  const [activeLesson,       setActiveLesson]       = useState<number | null>(null);
  const [showInfiniteHearts, setShowInfiniteHearts] = useState(false);
  const [showFinalPrize,     setShowFinalPrize]     = useState(false);

  const progress = Math.round((completedLessons.length / TOTAL_LESSONS) * 100);

  const loseHeart = () => setHearts(h => {
    if (h > 1) return h - 1;
    setShowInfiniteHearts(true);
    return 3;
  });

  const completeLesson = (id: number) => {
    if (!completedLessons.includes(id)) setCompletedLessons(prev => [...prev, id]);
    setActiveLesson(null);
  };

  const isUnlocked = (id: number) => id === 1 || completedLessons.includes(id - 1);

  // Determine the guide speech on the map
  const nextNodeId = NODES.find(n => !completedLessons.includes(n.id))?.id ?? null;
  const mapSpeech = nextNodeId
    ? `¡Toca el nodo "${NODES[nextNodeId - 1].title}" para continuar! 🌿`
    : '¡Has completado todo el camino! 🎉 Abre el cofre secreto.';

  return (
    <div className="w-full flex flex-col items-center">
      <HeroHeader progress={progress} hearts={hearts} />

      {/* Node Map */}
      {!activeLesson && (
        <NodeMap
          nodes={NODES}
          completedLessons={completedLessons}
          isUnlocked={isUnlocked}
          onNodeClick={setActiveLesson}
          onOpenPrize={() => setShowFinalPrize(true)}
          progress={progress}
          mapSpeech={mapSpeech}
        />
      )}

      {/* Active Lesson */}
      <AnimatePresence mode="wait">
        {activeLesson && (
          <motion.div
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full px-3 sm:px-4"
          >
            <button onClick={() => setActiveLesson(null)}
              className="mb-3 flex items-center gap-1 font-bold text-sm text-foreground/60 hover:text-foreground transition-colors">
              ← Volver al mapa
            </button>
            {activeLesson === 1 && <Lesson1 onComplete={() => completeLesson(1)} onMistake={loseHeart} />}
            {activeLesson === 2 && <Lesson2 onComplete={() => completeLesson(2)} onMistake={loseHeart} />}
            {activeLesson >= 3 && activeLesson <= 7 && (
              <DynamicChallenge
                level={vocabulario[VOCAB_MAP[activeLesson]]}
                onComplete={() => completeLesson(activeLesson)}
                onMistake={loseHeart}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Infinite Hearts Modal */}
      <InfiniteHeartsModal open={showInfiniteHearts} onClose={() => setShowInfiniteHearts(false)} />

      {/* Final Prize Modal */}
      <FinalPrizeModal open={showFinalPrize} message={FINAL_MESSAGE} onClose={() => setShowFinalPrize(false)} />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroHeader({ progress, hearts }: { progress: number; hearts: number }) {
  return (
    <div className="w-full px-4 pt-5 pb-4 text-center">
      <div className="flex justify-center mb-3">
        <MisakShield size={80} />
      </div>
      <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">Namui Wam</h1>
      <p className="font-bold text-base mt-1" style={{ color: '#1E3A8A' }}>Palabra viva 💧</p>

      <div className="flex justify-between items-center mt-5 mb-2">
        <div className="flex space-x-1">
          {[1, 2, 3].map(i => (
            <span key={i} className="text-xl">{i <= hearts ? '❤️' : '🖤'}</span>
          ))}
        </div>
        <span className="font-bold text-foreground text-sm">{progress}%</span>
      </div>
      <div className="w-full h-4 bg-muted rounded-full border-2 border-foreground overflow-hidden">
        <div className="h-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%`, background: 'linear-gradient(to right, #E6007E, #1E3A8A)' }} />
      </div>
    </div>
  );
}

function NodeMap({ nodes, completedLessons, isUnlocked, onNodeClick, onOpenPrize, progress, mapSpeech }: {
  nodes: typeof NODES;
  completedLessons: number[];
  isUnlocked: (id: number) => boolean;
  onNodeClick: (id: number) => void;
  onOpenPrize: () => void;
  progress: number;
  mapSpeech: string;
}) {
  return (
    <div className="w-full flex flex-col items-center gap-8 py-6 px-4 relative">
      {/* Guide at top of map */}
      <div className="w-full flex justify-center">
        <MisakGuide behavior="idle" speech={mapSpeech} size={72} speechSide="right" />
      </div>

      <div className="absolute top-0 bottom-0 w-1 bg-muted-foreground/20 left-1/2 -translate-x-1/2 -z-10 rounded-full" />

      {nodes.map(node => (
        <LessonNodeButton
          key={node.id}
          id={node.id}
          title={node.title}
          subtitle={node.subtitle}
          icon={node.icon}
          offset={node.offset}
          isUnlocked={isUnlocked(node.id)}
          isCompleted={completedLessons.includes(node.id)}
          onClick={() => onNodeClick(node.id)}
        />
      ))}

      {progress === 100 && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.95 }}
          onClick={onOpenPrize} data-testid="golden-chest"
          className="mt-4 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-600 border-4 border-foreground shadow-[0_6px_0_0_#111827] flex items-center justify-center text-4xl chest-glow relative z-10">
          🎁
        </motion.button>
      )}
    </div>
  );
}

function LessonNodeButton({ id, title, subtitle, icon, offset, isUnlocked, isCompleted, onClick }: {
  id: number; title: string; subtitle: string; icon: string; offset: string;
  isUnlocked: boolean; isCompleted: boolean; onClick: () => void;
}) {
  const bgStyle   = isUnlocked && !isCompleted ? { backgroundColor: '#1E3A8A' } : {};
  const bgClass   = isCompleted ? 'bg-yellow-400' : !isUnlocked ? 'bg-gray-300' : '';
  const borderCls = isCompleted ? 'border-[#F59E0B]' : 'border-foreground';

  return (
    <div className={`relative flex flex-col items-center ${offset}`} data-testid={`lesson-node-${id}`}>
      <button disabled={!isUnlocked} onClick={onClick} style={bgStyle}
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 ${borderCls}
          flex items-center justify-center text-2xl sm:text-3xl transition-all
          ${isUnlocked
            ? 'shadow-[0_6px_0_0_#111827] active:translate-y-[4px] active:shadow-[0_2px_0_0_#111827]'
            : 'opacity-60 cursor-not-allowed'} ${bgClass}`}>
        {isCompleted ? '⭐' : !isUnlocked ? '🔒' : icon}
      </button>
      <div className="mt-2 flex flex-col items-center">
        <div className="font-bold text-foreground text-xs sm:text-sm bg-white px-2 sm:px-3 py-1 rounded-full border-2 border-foreground shadow-sm whitespace-nowrap">
          {title}
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
}

function InfiniteHeartsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md text-center p-6 sm:p-8 bg-card border-4 border-foreground rounded-3xl shadow-[0_8px_0_0_#111827]">
        <div className="flex justify-center mb-4">
          <MisakGuide
            behavior="happy"
            speech="¡Vidas Infinitas porque eres mi persona favorita! 💖 ¡Sanemos tus corazones!"
            size={80}
            speechSide="right"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-black mb-4">¡Vidas Infinitas!</h2>
        <p className="font-bold text-base sm:text-lg text-foreground/80 mb-6">
          Tus corazones se restauraron al instante. ¡Continúa aprendiendo! 💖
        </p>
        <button className="duo-button-primary w-full py-3 sm:py-4 text-lg sm:text-xl" onClick={onClose}>
          Continuar
        </button>
      </DialogContent>
    </Dialog>
  );
}

function FinalPrizeModal({ open, message, onClose }: { open: boolean; message: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="fixed text-xl sm:text-2xl animate-heart-rain z-0 pointer-events-none"
          style={{ left:`${Math.random()*100}%`, bottom:0,
            animationDelay:`${Math.random()*2}s`, animationDuration:`${3+Math.random()*2}s` }}>
          {Math.random()>0.5?'❤️':'💖'}
        </div>
      ))}
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-sm sm:max-w-md bg-white border-4 border-[#F59E0B] rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.5)] my-auto">
        {/* Guide with letter */}
        <div className="flex justify-center mb-5">
          <MisakGuide
            behavior="reading"
            speech="¡Excelente! 🌟 Continúa aprendiendo, ÑI. 💌"
            size={90}
            speechSide="right"
          />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-5">NEI ISHUK MISAK 🥳</h2>
        <div className="space-y-3 font-bold text-base sm:text-lg text-foreground/80 text-center leading-relaxed">
          <p>{message}</p>
          {/* <p>Ahora sabes decir en Namui Wam lo que yo siento cada día:</p> */}
          <p className="text-2xl sm:text-3xl font-black py-3" style={{ color: '#1E3A8A' }}>KualӨm mӨrӨk kusremik.</p>
          <p>Gracias por llegar hasta aquí. Cada palabra aprendida es una forma de mantener viva la memoria, la identidad y la belleza del pueblo Misak. 🌿💙❤️</p>
          <p className="pt-3 font-black" style={{ color: '#353535' }}>Más allá de las palabras, valoro tu interés por aprender tu curiosidad, tu esfuerzo y el tiempo que dedicaste a este camino. ✨</p>
          <p className="pt-3 font-black" style={{ color: '#0f3b8b' }}>Este pequeño regalo fue creado pensando en ti. Espero que este detalle te acompañe y te saque una sonrisa cada vez que vuelvas a él. ✨</p>
        </div>
        <button className="mt-6 duo-button w-full py-3 sm:py-4 text-lg sm:text-xl"
          style={{ backgroundColor:'#F59E0B', color:'white', borderColor:'#111827' }}
          onClick={onClose}>Cerrar</button>
      </motion.div>
    </div>
  );
}
