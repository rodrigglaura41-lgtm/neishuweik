import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MisakShield } from './MisakShield';
import { MisakGuide } from './MisakGuide';

const HOW_TO_PLAY = [
  { icon: '🗺️', text: 'Recorrerás 10 niveles secuenciales, del más fácil al más difícil.' },
  { icon: '❤️', text: 'Como Nei Ishuk Misak, tendrás 3 vidas y corazones infinitos para seguir jugando sin límites!' },
  { icon: '🎯', text: 'Superarás desafíos dinámicos: selección múltiple, emparejamiento, verdad/mentira y constructor de palabras.' },
  { icon: '📚', text: 'Explora el vocabulario completo (125 palabras) y la cosmovisión del pueblo Misak.' },
  { icon: '🎁', text: 'Al completar los 10 niveles, desbloquearás un Cofre Secreto con un mensaje especial.' },
];

interface OnboardingModalProps {
  visible: boolean;
  onStart: () => void;
}

export function OnboardingModal({ visible, onStart }: OnboardingModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ background: 'linear-gradient(160deg, #1E3A8A 0%, #0F2460 60%, #111827 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20" style={{ backgroundColor: '#E6007E' }} />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: '#38BDF8' }} />
            <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: '#10B981' }} />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 py-8 sm:py-12">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.45, type: 'spring', damping: 22 }}
              className="w-full max-w-sm"
            >
              {/* Guide character + intro speech */}
              <div className="flex justify-center mb-6">
                <MisakGuide
                  behavior="idle"
                  speech="¡Hola! Soy JDAC tu guía en esta aventura por nuestro territorio Misak. Te acompañaré a tejer el saber del Namui Wam... 😎"
                  size={90}
                  speechSide="right"
                />
              </div>

              {/* Shield + Badge */}
              <div className="flex flex-col items-center mb-5">
                <div className="w-px h-4 bg-white/20 mb-3" />
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/30 flex items-center justify-center bg-white/10 shadow-[0_0_30px_rgba(230,0,126,0.25)]">
                  <MisakShield size={72} />
                </div>
                <div className="mt-3 px-3 py-1 rounded-full border border-white/30 bg-white/10">
                  <span className="text-xs font-black tracking-widest text-white/80 uppercase">Namui Wam Kusremik</span>
                </div>
              </div>

              {/* Main title */}
              <div className="text-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Bienvenid@<br />
                  <span style={{ color: '#38BDF8' }}>YampusrƟ AmƟ</span>
                </h1>
                <p className="mt-3 font-bold text-white/80 text-sm sm:text-base leading-relaxed">
                  Un regalo interactivo Ñui asik 🫶 — aprenderas mas cositas en este portal{' '}
                  <strong className="text-white">Namtrik</strong> de nuestro {' '}
                  <strong className="text-white">Idioma</strong> y un premio secreto al final.
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Cómo funciona</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* How to play */}
              <div className="space-y-2.5 mb-7">
                {HOW_TO_PLAY.map((item, i) => (
                  <motion.div key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className="flex items-start gap-3 bg-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-white/15"
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-xs sm:text-sm font-semibold text-white/90 leading-snug">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: 'spring', damping: 14, stiffness: 200 }}
              >
                <motion.button
                  onClick={onStart}
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl text-white border-4 border-white/30 shadow-[0_0_30px_rgba(230,0,126,0.45)] tracking-wide"
                  style={{ background: 'linear-gradient(135deg, #E6007E 0%, #BE185D 100%)' }}
                >
                  Iniciar a aprender Namui Wam 🤜🤛
                </motion.button>
                <p className="text-center text-white/40 text-xs font-semibold mt-3">
                  ¡Un regalito, ya que presencialmente no se pudo jajaja! Pero bueno, despacito también se aprende 😏✨
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
