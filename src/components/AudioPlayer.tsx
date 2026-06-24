import React, { useState, useEffect, useRef } from 'react';

const PENTATONIC_SCALE = [392, 440, 523, 587, 659, 587, 523, 440]; // G4, A4, C5, D5, E5

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    
    if (isPlaying && !audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (isPlaying) {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      playMelody();
    } else {
      if (audioCtxRef.current?.state === 'running') {
        audioCtxRef.current.suspend();
      }
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [isPlaying]);

  const playMelody = () => {
    if (!audioCtxRef.current || !isPlayingRef.current) return;
    
    const ctx = audioCtxRef.current;
    let time = ctx.currentTime + 0.1;
    
    const playNote = (freq: number, startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    };

    const scheduleSequence = () => {
      if (!isPlayingRef.current) return;
      
      const now = ctx.currentTime;
      let nextTime = now + 0.1;
      
      PENTATONIC_SCALE.forEach((freq) => {
        playNote(freq, nextTime);
        nextTime += 0.45; // 0.4s duration + 0.05s gap
      });
      
      setTimeout(scheduleSequence, PENTATONIC_SCALE.length * 450);
    };
    
    scheduleSequence();
  };

  return (
    <button
      onClick={() => setIsPlaying(!isPlaying)}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-2xl
        border-2 border-foreground shadow-[0px_4px_0px_0px_#111827] active:translate-y-[4px] active:shadow-none transition-all
        ${isPlaying ? 'bg-primary text-white animate-pulse' : 'bg-white text-foreground'}`}
    >
      {isPlaying ? '🎶' : '🎵'}
    </button>
  );
}
