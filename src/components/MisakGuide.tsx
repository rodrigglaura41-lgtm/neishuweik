import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type GuideBehavior = 'idle' | 'happy' | 'supportive' | 'reading';

interface MisakGuideProps {
  behavior?: GuideBehavior;
  speech?: string;
  size?: number;
  speechSide?: 'right' | 'left' | 'top';
}

export function MisakGuide({
  behavior = 'idle',
  speech,
  size = 80,
  speechSide = 'right',
}: MisakGuideProps) {
  const h = Math.round(size * 150 / 80);
  const isRow = speechSide !== 'top';
  const reversed = speechSide === 'left';

  return (
    <div className={`flex items-end gap-2 ${isRow ? (reversed ? 'flex-row-reverse' : 'flex-row') : 'flex-col-reverse items-center'}`}>
      {/* Character */}
      <motion.div
        style={{ flexShrink: 0 }}
        animate={
          behavior === 'happy'
            ? { y: [0, -6, 0, -4, 0] }
            : behavior === 'supportive'
            ? { x: [0, -2, 2, -1, 0] }
            : { y: [0, -2, 0] }
        }
        transition={
          behavior === 'happy'
            ? { duration: 0.6, repeat: 1 }
            : behavior === 'supportive'
            ? { duration: 0.5, repeat: 1 }
            : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <MisakCharacterSVG behavior={behavior} width={size} height={h} />
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        {speech && (
          <motion.div
            key={speech}
            initial={{ opacity: 0, scale: 0.8, ...(isRow ? { x: reversed ? 8 : -8 } : { y: 8 }) }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 16, stiffness: 280 }}
            className="relative max-w-[165px] sm:max-w-[210px] bg-white rounded-2xl border-2 border-foreground p-2.5 sm:p-3 shadow-[0_3px_0_0_#111827]"
          >
            <p className="text-[11px] sm:text-xs font-bold text-foreground leading-snug">{speech}</p>
            {/* Tail */}
            {isRow && <BubbleTailSide side={reversed ? 'right' : 'left'} />}
            {!isRow && <BubbleTailBottom />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BubbleTailSide({ side }: { side: 'left' | 'right' }) {
  const pos: React.CSSProperties = { position: 'absolute', bottom: 12 };
  const outer: React.CSSProperties = {
    ...pos,
    [side]: -8,
    width: 0, height: 0,
    borderTop: '7px solid transparent',
    borderBottom: '7px solid transparent',
    [side === 'left' ? 'borderRight' : 'borderLeft']: '8px solid #111827',
  };
  const inner: React.CSSProperties = {
    ...pos,
    [side]: -6,
    width: 0, height: 0,
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    [side === 'left' ? 'borderRight' : 'borderLeft']: '7px solid white',
  };
  return (<><div style={outer} /><div style={inner} /></>);
}

function BubbleTailBottom() {
  return (
    <>
      <div style={{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'8px solid transparent', borderRight:'8px solid transparent', borderTop:'9px solid #111827' }} />
      <div style={{ position:'absolute', top:'calc(100% - 2px)', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderTop:'8px solid white' }} />
    </>
  );
}

// ─── SVG Character ────────────────────────────────────────────────────────────

function MisakCharacterSVG({ behavior, width, height }: { behavior: GuideBehavior; width: number; height: number }) {
  const isHappy     = behavior === 'happy';
  const isSupportive = behavior === 'supportive';
  const isReading   = behavior === 'reading';

  return (
    <svg width={width} height={height} viewBox="0 0 80 150" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* ── HAT (Tambo de paja con cinta roja) ─────────────────────────────── */}
      {/* Brim shadow */}
      <ellipse cx="40" cy="18" rx="27" ry="5.5" fill="#9A7720" opacity="0.3"/>
      {/* Brim top */}
      <ellipse cx="40" cy="16" rx="27" ry="5.5" fill="#D4AA60" stroke="#8B6914" strokeWidth="0.8"/>
      {/* Crown */}
      <rect x="28" y="2" width="24" height="15" rx="4" fill="#D4AA60" stroke="#8B6914" strokeWidth="0.8"/>
      {/* Crown highlight */}
      <rect x="30" y="3" width="8" height="11" rx="3" fill="#E0BB75" opacity="0.55"/>
      {/* Red cinta (band) */}
      <rect x="28" y="12" width="24" height="5" rx="1.5" fill="#CC2200"/>
      {/* Fucsia accent stripe on band */}
      <rect x="28" y="12.5" width="24" height="1.5" fill="#E6007E" opacity="0.75"/>

      {/* ── HEAD ───────────────────────────────────────────────────────────── */}
      {/* Shadow */}
      <circle cx="41" cy="39.5" r="19" fill="#8B5A20" opacity="0.2"/>
      {/* Skin */}
      <circle cx="40" cy="38" r="18.5" fill="#C8854A" stroke="#A06828" strokeWidth="0.8"/>
      {/* Hair */}
      <path d="M23 31 Q28 20 40 22 Q52 20 57 31" fill="#1C0A00" stroke="#1C0A00" strokeWidth="0.4"/>
      <path d="M22 33 Q25 26 28 26" stroke="#1C0A00" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M58 33 Q55 26 52 26" stroke="#1C0A00" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Ears */}
      <ellipse cx="21.5" cy="38" rx="3.2" ry="4.5" fill="#C8854A" stroke="#A06828" strokeWidth="0.7"/>
      <ellipse cx="58.5" cy="38" rx="3.2" ry="4.5" fill="#C8854A" stroke="#A06828" strokeWidth="0.7"/>
      <ellipse cx="21.5" cy="38" rx="1.5" ry="2.8" fill="#B07040" opacity="0.4"/>

      {/* Cheeks (Ghibli rosy) */}
      <ellipse cx="27" cy="43.5" rx="5.5" ry="4" fill="#FF8888" opacity="0.42"/>
      <ellipse cx="53" cy="43.5" rx="5.5" ry="4" fill="#FF8888" opacity="0.42"/>

      {/* ── EYEBROWS ───────────────────────────────────────────────────────── */}
      {isSupportive ? (
        <>
          <path d="M25 30 Q29.5 27 34 30.5" stroke="#2D1000" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
          <path d="M46 30.5 Q50.5 27 55 30" stroke="#2D1000" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        </>
      ) : isHappy ? (
        <>
          <path d="M25 27 Q30 24 35 27" stroke="#2D1000" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
          <path d="M45 27 Q50 24 55 27" stroke="#2D1000" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <path d="M25.5 29.5 Q30 27 34.5 29.5" stroke="#2D1000" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
          <path d="M45.5 29.5 Q50 27 54.5 29.5" stroke="#2D1000" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        </>
      )}

      {/* ── EYES ───────────────────────────────────────────────────────────── */}
      {isHappy ? (
        <>
          {/* Closed happy crescents */}
          <path d="M24.5 37.5 C26 32 34 32 35.5 37.5 C33 35.5 27 35.5 24.5 37.5 Z" fill="#2D1000"/>
          <path d="M44.5 37.5 C46 32 54 32 55.5 37.5 C53 35.5 47 35.5 44.5 37.5 Z" fill="#2D1000"/>
          {/* Sparkle lines */}
          <line x1="27" y1="31" x2="24" y2="29" stroke="#FFD700" strokeWidth="0.9" strokeLinecap="round"/>
          <line x1="33" y1="29.5" x2="36" y2="27" stroke="#FFD700" strokeWidth="0.9" strokeLinecap="round"/>
          <line x1="47" y1="31" x2="44" y2="29" stroke="#FFD700" strokeWidth="0.9" strokeLinecap="round"/>
          <line x1="53" y1="29.5" x2="56" y2="27" stroke="#FFD700" strokeWidth="0.9" strokeLinecap="round"/>
        </>
      ) : isReading ? (
        <>
          {/* Half-lidded eyes, looking down */}
          <ellipse cx="30" cy="37" rx="5.5" ry="5.5" fill="white" stroke="#8B5A2B" strokeWidth="0.5"/>
          <ellipse cx="50" cy="37" rx="5.5" ry="5.5" fill="white" stroke="#8B5A2B" strokeWidth="0.5"/>
          <ellipse cx="30.5" cy="38.5" rx="3.5" ry="3.5" fill="#4A2000"/>
          <ellipse cx="50.5" cy="38.5" rx="3.5" ry="3.5" fill="#4A2000"/>
          <ellipse cx="30.5" cy="38.5" rx="2" ry="2" fill="#1C0A00"/>
          <ellipse cx="50.5" cy="38.5" rx="2" ry="2" fill="#1C0A00"/>
          <ellipse cx="32" cy="36.5" rx="1.3" ry="1.4" fill="white"/>
          <ellipse cx="52" cy="36.5" rx="1.3" ry="1.4" fill="white"/>
          {/* Upper lid overlay */}
          <path d="M24.5 32.5 Q30 29 35.5 32.5 L35.5 36 Q30 32.5 24.5 36 Z" fill="#C8854A"/>
          <path d="M44.5 32.5 Q50 29 55.5 32.5 L55.5 36 Q50 32.5 44.5 36 Z" fill="#C8854A"/>
        </>
      ) : (
        <>
          {/* Normal eyes — slightly worried for supportive */}
          <ellipse cx="30" cy={isSupportive ? 37.5 : 36.5} rx="5.5" ry="6" fill="white" stroke="#8B5A2B" strokeWidth="0.5"/>
          <ellipse cx="50" cy={isSupportive ? 37.5 : 36.5} rx="5.5" ry="6" fill="white" stroke="#8B5A2B" strokeWidth="0.5"/>
          <ellipse cx="30.5" cy={isSupportive ? 38.5 : 37.5} rx="3.5" ry="4.5" fill="#4A2000"/>
          <ellipse cx="50.5" cy={isSupportive ? 38.5 : 37.5} rx="3.5" ry="4.5" fill="#4A2000"/>
          <ellipse cx="30.5" cy={isSupportive ? 38.5 : 37.5} rx="2" ry="2.5" fill="#1C0A00"/>
          <ellipse cx="50.5" cy={isSupportive ? 38.5 : 37.5} rx="2" ry="2.5" fill="#1C0A00"/>
          <ellipse cx="32" cy={isSupportive ? 36.5 : 35.5} rx="1.4" ry="1.6" fill="white"/>
          <ellipse cx="52" cy={isSupportive ? 36.5 : 35.5} rx="1.4" ry="1.6" fill="white"/>
          {/* Teardrop shimmer for supportive */}
          {isSupportive && (
            <ellipse cx="30" cy="44.5" rx="1.8" ry="2.5" fill="#BFE9FF" opacity="0.85"/>
          )}
        </>
      )}

      {/* Sweat drop (supportive - anime style) */}
      {isSupportive && (
        <path d="M58 23 C58 23 55 31.5 55 34 C55 36.2 56.5 37.5 58.5 37.5 C60.5 37.5 62 36.2 62 34 C62 31.5 59 23 58 23 Z"
          fill="#A8D8EA" opacity="0.8" stroke="#87CEEB" strokeWidth="0.5"/>
      )}

      {/* ── NOSE ────────────────────────────────────────────────────────────── */}
      <ellipse cx="40" cy="43.5" rx="1.6" ry="1" fill="#A06030" opacity="0.65"/>

      {/* ── MOUTH ───────────────────────────────────────────────────────────── */}
      {isHappy ? (
        <>
          <path d="M31 49 Q40 56 49 49" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M34 50 Q40 54.5 46 50 Q40 56 34 50 Z" fill="white" opacity="0.75"/>
        </>
      ) : isSupportive ? (
        <path d="M35 50.5 Q40 48.5 45 50.5" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      ) : isReading ? (
        <path d="M35 48 Q40 50 45 48" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      ) : (
        <path d="M34 47.5 Q40 52 46 47.5" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      )}

      {/* ── NECK ────────────────────────────────────────────────────────────── */}
      <rect x="36" y="55" width="8" height="8" fill="#C8854A"/>

      {/* ── SCARF (bufanda lana roja/naranja) ──────────────────────────────── */}
      <ellipse cx="40" cy="62" rx="14.5" ry="9.5" fill="#D94010"/>
      <ellipse cx="35.5" cy="59.5" rx="5.5" ry="4.5" fill="#E05520" opacity="0.6"/>
      <ellipse cx="45.5" cy="64.5" rx="5.5" ry="3.5" fill="#C03010" opacity="0.4"/>
      {/* Tassel */}
      <rect x="52" y="62" width="3.5" height="9" rx="1.8" fill="#D94010"/>
      <ellipse cx="53.5" cy="72" rx="2.5" ry="2.5" fill="#C03010"/>

      {/* ── SHIRT SLEEVES (manga azul claro) ───────────────────────────────── */}
      {isHappy ? (
        <>
          {/* Left sleeve normal */}
          <rect x="6" y="80" width="13" height="26" rx="5" fill="#87CEEB" stroke="#6BB8D9" strokeWidth="0.6"/>
          {/* Right sleeve raised — waving */}
          <path d="M60 78 C62 70 65 58 67 54" stroke="#87CEEB" strokeWidth="12" strokeLinecap="round" fill="none"/>
          {/* Waving hand */}
          <ellipse cx="68" cy="51" rx="5" ry="4" fill="#C8854A" stroke="#A06828" strokeWidth="0.6"/>
          <path d="M66 48 L64 44" stroke="#C8854A" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M69 47 L69 43" stroke="#C8854A" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M72 48 L74 45" stroke="#C8854A" strokeWidth="2.5" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <rect x="6" y="80" width="13" height="26" rx="5" fill="#87CEEB" stroke="#6BB8D9" strokeWidth="0.6"/>
          <rect x="61" y="80" width="13" height="26" rx="5" fill="#87CEEB" stroke="#6BB8D9" strokeWidth="0.6"/>
        </>
      )}

      {/* ── RUANA / KAPIZAYO (poncho gris oscuro) ──────────────────────────── */}
      <path d="M8 70 L40 64 L72 70 L74 120 L40 124 L6 120 Z" fill="#2A2A2A" stroke="#1A1A1A" strokeWidth="0.7"/>
      {/* V-neck opening (scarf visible) */}
      <polygon points="33,70 40,83 47,70" fill="#D94010"/>
      {/* Texture lines */}
      <path d="M10 72 L9 118" stroke="#1A1A1A" strokeWidth="0.5" opacity="0.45"/>
      <path d="M70 72 L71 118" stroke="#1A1A1A" strokeWidth="0.5" opacity="0.45"/>
      {/* Shoulder highlight */}
      <path d="M8 70 L40 64 L72 70" stroke="#3D3D3D" strokeWidth="1.2" fill="none"/>

      {/* Fucsia/rosadas stripes near bottom edge of ruana */}
      <rect x="8" y="108" width="64" height="4" rx="1.5" fill="#E6007E"/>
      <rect x="9" y="114" width="62" height="2.2" rx="1" fill="#E6007E" opacity="0.55"/>

      {/* ── HANDS ───────────────────────────────────────────────────────────── */}
      {isReading ? (
        <>
          {/* Envelope / carta */}
          <rect x="26" y="100" width="28" height="18" rx="3" fill="#FFFDE7" stroke="#8B6914" strokeWidth="0.9"/>
          <polygon points="26,100 40,111 54,100" fill="#FFF9C4" stroke="#8B6914" strokeWidth="0.6"/>
          {/* Sparkles */}
          <circle cx="22" cy="98" r="1.5" fill="#FFD700" opacity="0.8"/>
          <circle cx="58" cy="98" r="1.5" fill="#FFD700" opacity="0.8"/>
          <circle cx="60" cy="108" r="1" fill="#E6007E" opacity="0.6"/>
          {/* Hands peeking */}
          <ellipse cx="30" cy="116" rx="6" ry="4" fill="#C8854A" stroke="#A06828" strokeWidth="0.5"/>
          <ellipse cx="50" cy="117" rx="6" ry="4" fill="#C8854A" stroke="#A06828" strokeWidth="0.5"/>
        </>
      ) : isHappy ? (
        <>
          {/* Left hand only (right is waving) */}
          <ellipse cx="13" cy="104" rx="5.5" ry="4" fill="#C8854A" stroke="#A06828" strokeWidth="0.5"/>
        </>
      ) : (
        <>
          {/* Clasped hands (idle/supportive) */}
          <ellipse cx="37" cy="106" rx="7.5" ry="5" fill="#C8854A" stroke="#A06828" strokeWidth="0.5"/>
          <ellipse cx="45.5" cy="108" rx="7" ry="5" fill="#C8854A" stroke="#A06828" strokeWidth="0.5"/>
        </>
      )}

      {/* ── ANACO (falda azul/morado) ───────────────────────────────────────── */}
      <rect x="22" y="116" width="36" height="30" rx="3" fill="#4A1D96" stroke="#3B1678" strokeWidth="0.6"/>
      <rect x="23" y="117" width="10" height="28" rx="2" fill="#5B2EB0" opacity="0.38"/>

      {/* ── SHOES ───────────────────────────────────────────────────────────── */}
      <ellipse cx="32" cy="149" rx="10" ry="5.5" fill="#1C1C1C"/>
      <ellipse cx="32" cy="147" rx="8.5" ry="4" fill="#2D2D2D"/>
      <ellipse cx="50" cy="149" rx="10" ry="5.5" fill="#1C1C1C"/>
      <ellipse cx="50" cy="147" rx="8.5" ry="4" fill="#2D2D2D"/>

      {/* ── BEHAVIOR EXTRAS ─────────────────────────────────────────────────── */}
      {isHappy && (
        <>
          <circle cx="10" cy="62" r="2.2" fill="#FFD700" opacity="0.8"/>
          <circle cx="70" cy="57" r="1.8" fill="#FFD700" opacity="0.7"/>
          <circle cx="14" cy="48" r="1.3" fill="#FFD700" opacity="0.65"/>
          <circle cx="67" cy="45" r="1.8" fill="#E6007E" opacity="0.55"/>
          <circle cx="9"  cy="75" r="1.2" fill="#10B981" opacity="0.55"/>
        </>
      )}
    </svg>
  );
}
