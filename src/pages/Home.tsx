import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RutaAprendizaje } from '@/components/RutaAprendizaje';
import { Cosmovision } from '@/components/Cosmovision';
import { Vocabulario } from '@/components/Vocabulario';
import { OnboardingModal } from '@/components/OnboardingModal';

// ─── Constants ───────────────────────────────────────────────────────────────

type Tab = 'ruta' | 'vocabulario' | 'cosmovision';

const TABS: { id: Tab; label: string; color: string }[] = [
  { id: 'ruta',        label: 'Ruta',       color: '#1E3A8A' },
  { id: 'vocabulario', label: 'Vocabulario', color: '#10B981' },
  { id: 'cosmovision', label: 'Cosmovisión', color: '#E6007E' },
];

// ─── Home (root layout) ───────────────────────────────────────────────────────

export default function Home() {
  const [activeTab,       setActiveTab]       = useState<Tab>('ruta');
  const [showOnboarding,  setShowOnboarding]  = useState(true);

  return (
    <>
      {/* Onboarding — shown once on first visit */}
      <OnboardingModal visible={showOnboarding} onStart={() => setShowOnboarding(false)} />

      <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center">
        <div className="w-full max-w-lg flex flex-col flex-1">

          {/* Sticky top tab navigation */}
          <TabNav activeTab={activeTab} onSelect={setActiveTab} />

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
              {activeTab === 'ruta'        && <RutaAprendizaje />}
              {activeTab === 'vocabulario' && <Vocabulario />}
              {activeTab === 'cosmovision' && <Cosmovision />}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </>
  );
}

// ─── Tab Navigation ───────────────────────────────────────────────────────────

function TabNav({ activeTab, onSelect }: { activeTab: Tab; onSelect: (t: Tab) => void }) {
  return (
    <div className="sticky top-0 z-20 w-full px-3 sm:px-4 py-3 bg-background/95 backdrop-blur-sm border-b-2 border-border">
      <div className="flex bg-white rounded-full p-1 border-2 border-foreground shadow-sm gap-0.5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onClick={() => onSelect(tab.id)}
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
  );
}
