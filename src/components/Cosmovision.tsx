import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function Cosmovision() {
  const [activeFlagSection, setActiveFlagSection] = useState<number | null>(null);
  const [showHymnModal, setShowHymnModal] = useState(false);

  const flagSections = [
    {
      id: 1,
      color: '#E6007E',
      textColor: '#FFFFFF',
      name: 'Fucsia',
      desc: "🩸 La sangre de nuestros ancestros. Representa las luchas históricas del pueblo Misak por defender su territorio y su identidad. Es la fuerza que nos da raíz y nos conecta con quienes lucharon antes que nosotros.",
    },
    {
      id: 2,
      color: '#1E3A8A',
      textColor: '#FFFFFF',
      name: 'Azul Oscuro',
      desc: "💧 El agua sagrada y profunda. Los Misak somos 'hijos del agua' — el agua es vida, espíritu y origen. El río Piendamó es nuestra madre. Este azul profundo representa la sabiduría ancestral que fluye como el río eterno.",
    },
    {
      id: 3,
      color: '#FFFFFF',
      textColor: '#111827',
      name: 'Blanco',
      desc: "🕊️ La pureza del pensamiento. La armonía con el territorio, el conocimiento ancestral y la claridad del espíritu Misak. El blanco es la paz entre los seres y la naturaleza.",
    },
    {
      id: 4,
      color: '#111827',
      textColor: '#FFFFFF',
      name: 'Negro',
      desc: "🌱 La Madre Tierra — Pachamama. El territorio sagrado que nos sostiene, nos alimenta y al que un día regresaremos. La tierra negra es vida, fertilidad y memoria colectiva.",
    },
  ];

  const hymnVerses = [
    {
      title: "I",
      lines: [
        "Metrap namui nu pirau, metrap tap warap urás,",
        "kan palátө kuallá map, kan palátө waara өrөp,",
        "mayankucha tap, lincha warapelө kөn tan,",
        "mupákucha kuayamik, chi kaakөpik kөn tan,",
        "metrapelөpe, lus utrapelө, metrapelөpe, palө ichipelө."
      ]
    },
    {
      title: "II",
      lines: [
        "Metrap chikucha isumө, chikucha palөmөpen,",
        "mөkele kuari maren, ishumpur pasrik pasren,",
        "maya nu misakwan, alá kuallipelө kөn,",
        "mayankucha tap, lincha pailapelө kөn tan,",
        "metrapelөpe, kuari marөpelө,",
        "trú uras srөnkutre, linchá kuallipelө."
      ]
    },
    {
      title: "III",
      lines: [
        "Metrappe pөshik muchip, mөilata pena kөmө,",
        "mayaelө purá kuallá, truikwan nená mapelө,",
        "Pirө kөtsөyú, nená mapelө kөpik kөn,",
        "pөshikwan kalíyu, muchipelө kөpik kөn,",
        "kitsik srukyupe, purá kichipelө,",
        "truikwan mapíkpe, chi kuantrө kaik kөpik."
      ]
    },
    {
      title: "IV",
      lines: [
        "Mөík kөpen kuantrө kөpen, masө pusrtrap ampөpelө,",
        "kuamөntrai isuá mөra, yamai mөrөpik peran,",
        "kepasrөp mentáppe, kuantrap kaik kөncha mөrán,",
        "kuantraptíkwanе, yantө mөmarám kaik kөn tan,",
        "kan kualөm palán, kape patru palán,",
        "Truikwan isupén, yantө kuámik nepún."
      ]
    },
    {
      title: "V",
      lines: [
        "Nam misakmera kuapen, múkucha purukuntrún,",
        "mavaelө mámik srua ampá, lincha kualmapelө kөn,",
        "өsik amөñáma, linchá amөnaikwan isuá,",
        "chí uras kөpen, nakucha өyawei kuámik kөn cha",
        "na kuapenkuchá, mukөpen linchai,",
        "ñi kuapenkuchá, mayaelө linchai."
      ]
    },
    {
      title: "VI",
      lines: [
        "Sөríntulyu muta puá, miikmatап putrapelө,",
        "manakúcha asamik kaik, kásrөmai intrap ipen,",
        "kánsrө mantrap intreinchá, chíkөpen pusrá sөrán,",
        "mú kөtrөmisrөpikpe, pipík pөnsrөpelө,",
        "namui musíkpe, palaí mөrөpelө",
        "metrap elөpe, pusrá sөrapelө."
      ]
    },
    {
      title: "VII",
      lines: [
        "Mөisrө misakmerapé, truíkwan chikucha isumөn,",
        "chí kuikwan wamínchene, ka intsátө mөrөpelө,",
        "puleelө wamintíktө, tap kөtanmap treintan,",
        "namuy kəlliele, wamintíkwan mөrmuá treintan,",
        "mayaelө isukún, chí tápik kөpíkwan,",
        "namui kөllielө wamintíkwanе."
      ]
    },
    {
      title: "VIII",
      lines: [
        "Mayaelan kasraaranөp, chí patsíkwan isumө,",
        "namui luspa palөpa, kisámtik wantrínkucha,",
        "katө isuá kusrentrap, kөllielan waminchikun,",
        "pirө latawei, namuintөwi kөpik kөn tan,",
        "chi̱wántөkucha, wetөtrapén kөntrun,",
        "chiwántөkucha, pesárnnamúmik kөn."
      ]
    }
  ];

  return (
    <React.Fragment>
      <div className="w-full flex flex-col items-center px-3 sm:px-4 py-4 space-y-10">
        {/* Header */}
        <div className="text-center pt-2">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">Cosmovisión Misak</h2>
          <p className="font-bold text-muted-foreground mt-1 text-sm sm:text-base">La forma de ver el mundo</p>
        </div>

        {/* Interactive Flag — 4 horizontal stripes */}
        <section className="w-full max-w-sm mx-auto">
          <h3 className="text-lg sm:text-xl font-bold mb-2 text-center">La Bandera</h3>
          <p className="text-center text-xs sm:text-sm text-muted-foreground mb-3 font-semibold">
            Toca cada franja para conocer su significado
          </p>

          <div className="w-full rounded-2xl overflow-hidden border-4 border-foreground shadow-[0_6px_0_0_#111827] flex flex-col">
            {flagSections.map((section) => (
              <button
                key={section.id}
                data-testid={`flag-section-${section.id}`}
                onClick={() => setActiveFlagSection(activeFlagSection === section.id ? null : section.id)}
                className="relative flex items-center justify-between px-4 py-4 sm:py-5 transition-all duration-200 hover:brightness-110 active:brightness-95"
                style={{
                  backgroundColor: section.color,
                  borderBottom: section.id < 4 ? '2px solid #111827' : 'none'
                }}
              >
                <span className="font-black text-sm sm:text-base tracking-wide" style={{ color: section.textColor }}>
                  {section.name}
                </span>
                <span className="text-xs sm:text-sm font-bold opacity-70" style={{ color: section.textColor }}>
                  {activeFlagSection === section.id ? '▲' : '▼'}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeFlagSection && (
              <motion.div
                key={activeFlagSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-3 p-4 bg-white rounded-xl border-2 border-foreground shadow-[0_4px_0_0_#111827] relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 w-3 h-full rounded-l-xl"
                  style={{ backgroundColor: flagSections[activeFlagSection - 1].color }}
                />
                <p className="font-bold text-foreground pl-4 sm:pl-5 text-sm sm:text-base leading-relaxed">
                  {flagSections[activeFlagSection - 1].desc}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* El Chumbe Section */}
        <section className="w-full max-w-sm mx-auto">
          <h3 className="text-lg sm:text-xl font-bold mb-5 text-center">El Chumbe</h3>

          {/* Chumbe Spiral */}
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 sm:w-36 sm:h-36">
              <svg viewBox="0 0 120 120" fill="none" className="animate-[spin_25s_linear_infinite] w-full h-full">
                <circle cx="60" cy="60" r="54" stroke="#111827" strokeWidth="10" fill="none" strokeDasharray="28 8" />
                <circle cx="60" cy="60" r="42" stroke="#E6007E" strokeWidth="10" fill="none" strokeDasharray="22 6" />
                <circle cx="60" cy="60" r="30" stroke="#1E3A8A" strokeWidth="10" fill="none" strokeDasharray="16 6" />
                <circle cx="60" cy="60" r="18" stroke="#38BDF8" strokeWidth="10" fill="none" strokeDasharray="10 4" />
                <circle cx="60" cy="60" r="7" fill="#10B981" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <AccordionCard
              color="#E6007E"
              title="🌀 El Espiral del Tiempo"
              content="El Chumbe representa los meses del año en forma de espiral. Cada vuelta es un ciclo de la naturaleza, recordándonos que el tiempo es circular, no lineal."
            />
            <AccordionCard
              color="#E6007E"
              title="🌸 La Matriz Femenina"
              content="El tejido del Chumbe es sagrado porque viene de las manos de las mujeres Misak. Representa la matriz, la fertilidad y el poder creador femenino."
            />
            <AccordionCard
              color="#10B981"
              title="🌿 La Conexión con la Naturaleza"
              content="Cada color y cada hilo del Chumbe tiene un significado. Es un mapa del territorio, una historia tejida que une al ser con la Pachamama."
            />
            <AccordionCard
              color="#1E3A8A"
              title="☯️ Dualidad y Equilibrio"
              content="La cosmovisión Misak se basa en pares complementarios: masculino/femenino, frío/caliente, día/noche, arriba/abajo. El Chumbe los teje en armonía perfecta."
            />
          </div>
        </section>

        {/* Dualidad Section */}
        <section className="w-full max-w-sm mx-auto">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">Dualidad y Equilibrio</h3>
          <div className="grid grid-cols-1 gap-3">
            <DualCard left="☀️ Día" right="🌙 Noche" accentColor="#1E3A8A" />
            <DualCard left="🔥 Caliente" right="❄️ Frío" accentColor="#E6007E" />
            <DualCard left="🌊 Masculino" right="🌸 Femenino" accentColor="#38BDF8" />
            <DualCard left="⬆️ Arriba" right="⬇️ Abajo" accentColor="#10B981" />
          </div>
        </section>

        {/* Himno Guambiano Section */}
        <section className="w-full max-w-sm mx-auto pb-4">
          <button
            onClick={() => setShowHymnModal(true)}
            className="w-full py-4 rounded-xl font-black text-base text-white border-2 border-foreground shadow-[0_4px_0_0_#111827] active:translate-y-[3px] active:shadow-[0_1px_0_0_#111827] transition-all"
            style={{ backgroundColor: '#1E3A8A' }}
          >
            🎵 KƟLLIELEI WAM (Himno Guambiano)
          </button>
        </section>

      </div>

      {/* Hymn Modal */}
      <HymnModal
        open={showHymnModal}
        onClose={() => setShowHymnModal(false)}
        hymnVerses={hymnVerses}
      />
    </React.Fragment>
  );
}

function HymnModal({ open, onClose, hymnVerses }: { open: boolean; onClose: () => void; hymnVerses: Array<{ title: string; lines: string[] }> }) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-[#FFF0F7] via-[#EFF6FF] to-[#F0FDF4] border-4 border-foreground rounded-3xl shadow-[0_8px_0_0_#111827]">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2">KƟLLIELEI WAM</h2>
          <p className="font-bold text-muted-foreground text-sm sm:text-base">Himno Guambiano</p>
        </div>

        {/* YouTube Video */}
        <div className="mb-6 w-full max-w-md mx-auto rounded-xl border-4 border-foreground overflow-hidden shadow-[0_4px_0_0_#111827]">
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/llTWw_P4PJY?start=2&modestbranding=1&rel=0&color=white"
              title="Himno Guambiano"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Hymn Lyrics with Karaoke Effect */}
        <div 
          className="space-y-6 select-none"
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          {hymnVerses.map((verse, verseIdx) => (
            <div 
              key={verseIdx} 
              className="bg-white rounded-xl border-2 border-foreground shadow-[0_4px_0_0_#111827] p-4 sm:p-5 select-none"
            >
              <h3 className="text-xl font-black text-foreground mb-3" style={{ color: '#E6007E' }}>
                {verse.title}
              </h3>
              <div className="space-y-2">
                {verse.lines.map((line, lineIdx) => (
                  <motion.p
                    key={lineIdx}
                    className="font-bold text-sm sm:text-base text-foreground text-center leading-relaxed select-none"
                    initial={{ opacity: 0.6, scale: 0.98 }}
                    whileHover={{ opacity: 1, scale: 1, color: '#1E3A8A' }}
                    transition={{ duration: 0.3 }}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AccordionCard({ title, content, color }: { title: string; content: string; color: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border-2 border-foreground shadow-[0_4px_0_0_#111827] overflow-hidden">
      <button
        className="w-full p-3 sm:p-4 flex justify-between items-center text-left font-bold text-sm sm:text-base"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: color }} />
          {title}
        </span>
        <span className="text-lg ml-2 flex-shrink-0">{isOpen ? '−' : '+'}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 sm:p-4 pt-0 text-foreground/80 font-semibold text-sm sm:text-base border-t-2 border-border bg-muted/30">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DualCard({ left, right, accentColor }: { left: string; right: string; accentColor: string }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border-2 border-foreground shadow-[0_4px_0_0_#111827] p-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: accentColor }} />
      <div className="flex-1 text-center font-bold text-sm sm:text-base pt-1">{left}</div>
      <div className="px-2 sm:px-3 text-lg sm:text-xl text-muted-foreground">⚖️</div>
      <div className="flex-1 text-center font-bold text-sm sm:text-base pt-1">{right}</div>
    </div>
  );
}
