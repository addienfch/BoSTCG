import { create } from 'zustand';

interface AudioState {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  toggleSfx: () => void;
  toggleMusic: () => void;
  playButton: () => void;
  playCard: () => void;
  playDraw: () => void;
  playHit: () => void;
  playError: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  sfxEnabled: true,
  musicEnabled: true,
  
  toggleSfx: () => set(state => ({ sfxEnabled: !state.sfxEnabled })),
  toggleMusic: () => set(state => ({ musicEnabled: !state.musicEnabled })),
  
  playButton: () => {
    if (get().sfxEnabled) {
      const audio = new Audio('/sounds/button-click.mp3');
      audio.volume = 0.3;
      audio.play();
    }
  },
  
  playCard: () => {
    if (get().sfxEnabled) {
      const audio = new Audio('/sounds/card-play.mp3');
      audio.volume = 0.4;
      audio.play();
    }
  },
  
  playDraw: () => {
    if (get().sfxEnabled) {
      const audio = new Audio('/sounds/card-draw.mp3');
      audio.volume = 0.3;
      audio.play();
    }
  },
  
  playHit: () => {
    if (get().sfxEnabled) {
      const audio = new Audio('/sounds/hit.mp3');
      audio.volume = 0.2;
      audio.play();
    }
  },
  
  playError: () => {
    if (get().sfxEnabled) {
      const audio = new Audio('/sounds/error.mp3');
      audio.volume = 0.2;
      audio.play();
    }
  }
}));