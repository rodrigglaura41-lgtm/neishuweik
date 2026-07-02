import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RutaAprendizaje } from '@/components/RutaAprendizaje';
import { Cosmovision } from '@/components/Cosmovision';
import { Vocabulario } from '@/components/Vocabulario';
import { OnboardingModal } from '@/components/OnboardingModal';
import { Sidebar } from '@/components/Sidebar';

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = 'ruta' | 'vocabulario' | 'cosmovision';

const TABS: { id: Tab; label: string; color: string }[] = [
  { id: 'ruta',        label: 'Ruta',       color: '#1E3A8A' },
  { id: 'vocabulario', label: 'Vocabulario', color: '#10B981' },
  { id: 'cosmovision', label: 'Cosmovisión', color: '#E6007E' },
];

// ─── Home (root layout) ────────────────────────────────────────────────────────

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('ruta');

  // Cargar estado desde localStorage
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    const saved = localStorage.getItem('namuiWam_showOnboarding');
    return saved !== 'false';
  });
  
  const [hearts, setHearts] = useState<number>(() => {
    const saved = localStorage.getItem('namuiWam_hearts');
    return saved ? parseInt(saved, 10) : 3;
  });
  
  const [completedLessons, setCompletedLessons] = useState<number[]>(() => {
    const saved = localStorage.getItem('namuiWam_completedLessons');
    return saved ? JSON.parse(saved) : [];
  });
  
  const TOTAL_LESSONS = 10;
  const progress = Math.round((completedLessons.length / TOTAL_LESSONS) * 100);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('namuiWam_showOnboarding', showOnboarding.toString());
  }, [showOnboarding]);
  
  useEffect(() => {
    localStorage.setItem('namuiWam_hearts', hearts.toString());
  }, [hearts]);

  useEffect(() => {
    localStorage.setItem('namuiWam_completedLessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  const loseHeart = () => setHearts(h => {
    if (h > 1) return h - 1;
    return 3;
  });

  const completeLesson = (id: number) => {
    if (!completedLessons.includes(id)) setCompletedLessons(prev => [...prev, id]);
  };

  const resetProgress = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar todo el progreso?')) {
      setHearts(3);
      setCompletedLessons([]);
      setShowOnboarding(true);
      alert('Progreso reiniciado exitosamente! 🔄');
    }
  };

  return (
    <>
      {/* Onboarding — shown once on first visit */}
      <OnboardingModal visible={showOnboarding} onStart={() => setShowOnboarding(false)} />

      <div className="min-h-[100dvh] w-full bg-background relative">
        {/* Sidebar derecho fijo */}
        <Sidebar 
          progress={progress} 
          hearts={hearts} 
          showProgress={activeTab === 'ruta'} 
          onResetProgress={resetProgress}
        />

        {/* Contenido principal con margen derecho */}
        <div className="mr-20 sm:mr-24 min-h-[100dvh] flex flex-col items-center">
          <div className="w-full max-w-lg flex flex-col flex-1">
            {/* Sticky top tab navigation */}
            <div className="sticky top-0 z-20 w-full px-3 sm:px-4 py-3 bg-background/95 backdrop-blur-sm border-b-2 border-border">
              <div className="flex bg-white rounded-full p-1 border-2 border-foreground shadow-sm gap-0.5">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    data-testid={`tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 px-1 sm:px-3 rounded-full font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-white border-2 border-foreground shadow-sm'
                        : 'text-foreground/70 hover:bg-muted'
                    }`}
                    style={activeTab === tab.id ? { backgroundColor: tab.color } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Animated tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18 }}
                className="w-full flex-1 pb-28"
              >
                {activeTab === 'ruta'        && <RutaAprendizaje 
                                                    completedLessons={completedLessons}
                                                    onCompleteLesson={completeLesson}
                                                    onMistake={loseHeart}
                                                    hearts={hearts}
                                                  />}
                {activeTab === 'vocabulario' && <Vocabulario />}
                {activeTab === 'cosmovision' && <Cosmovision />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
