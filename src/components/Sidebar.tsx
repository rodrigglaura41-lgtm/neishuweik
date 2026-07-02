import React from 'react';
import { MisakShield } from './MisakShield';

interface SidebarProps {
  progress: number;
  hearts: number;
  showProgress: boolean;
  onResetProgress: () => void;
}

export function Sidebar({ progress, hearts, showProgress, onResetProgress }: SidebarProps) {
  return (
    <div className="fixed right-0 top-0 z-30 h-screen w-20 sm:w-24 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-start py-28 gap-4">
      {/* Escudo */}
      <div className="flex-shrink-0">
        <MisakShield size={55} />
      </div>

      {/* Título y subtítulo */}
      <div className="text-center">
        <h1 className="text-sm sm:text-base font-black text-foreground tracking-tight">Namui Wam</h1>
        <p className="font-bold text-[10px] sm:text-xs" style={{ color: '#1E3A8A' }}>Palabra viva 💧</p>
      </div>

      {/* Mostrar vidas y progreso solo en la ruta */}
      {showProgress && (
        <>
          {/* Separador */}
          <div className="w-12 h-0.5 bg-border rounded-full" />

          {/* Corazones verticales */}
          <div className="flex flex-col gap-1 items-center">
            {[3, 2, 1].map(i => (
              <span key={i} className="text-lg sm:text-xl">{i <= hearts ? '❤️' : '🖤'}</span>
            ))}
            <span className="text-[10px] font-bold text-foreground mt-1">Vidas</span>
          </div>

          {/* Separador */}
          <div className="w-12 h-0.5 bg-border rounded-full" />

          {/* Batería vertical */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-foreground">{progress}%</span>
            <div className="w-5 sm:w-6 h-28 sm:h-32 bg-muted rounded-lg border-2 border-foreground overflow-hidden flex flex-col-reverse">
              <div className="w-full transition-all duration-700 ease-out"
                style={{ height: `${progress}%`, background: 'linear-gradient(to top, #E6007E, #1E3A8A)' }} />
            </div>
          </div>

          {/* Botón de restablecer */}
          <div className="mt-auto px-2">
            <button
              onClick={onResetProgress}
              className="text-[10px] sm:text-xs font-bold text-white px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 transition-colors w-full"
              title="Restablecer progreso"
            >
              🔄 Reiniciar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
