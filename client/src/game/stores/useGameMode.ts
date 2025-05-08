import { create } from 'zustand';

export type GameMode = 'playerVsAI' | 'playerVsPlayer' | 'singlePlayer';

interface GameModeState {
  mode: GameMode;
  isOnline: boolean;
  isWaitingForOpponent: boolean;
  roomCode: string | null;
  playerName: string;
  opponentName: string | null;
  
  // Actions
  setMode: (mode: GameMode) => void;
  setIsOnline: (isOnline: boolean) => void;
  setWaitingForOpponent: (isWaiting: boolean) => void;
  setRoomCode: (roomCode: string | null) => void;
  setPlayerName: (name: string) => void;
  setOpponentName: (name: string | null) => void;
  
  // Game setup helpers
  createRoom: () => void;
  joinRoom: (roomCode: string) => void;
  startSinglePlayer: () => void;
  startAIGame: () => void;
  
  // Reset state
  resetState: () => void;
}

export const useGameMode = create<GameModeState>((set, get) => ({
  mode: 'singlePlayer',
  isOnline: false,
  isWaitingForOpponent: false,
  roomCode: null,
  playerName: 'Player',
  opponentName: null,
  
  setMode: (mode) => set({ mode }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setWaitingForOpponent: (isWaiting) => set({ isWaitingForOpponent: isWaiting }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setPlayerName: (name) => set({ playerName: name }),
  setOpponentName: (name) => set({ opponentName: name }),
  
  // Game setup helpers
  createRoom: () => {
    // Generate a random 6-character room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    set({ 
      mode: 'playerVsPlayer', 
      isOnline: true,
      isWaitingForOpponent: true,
      roomCode 
    });
    
    // In a real implementation, this would connect to a server
    console.log(`Created room with code: ${roomCode}`);
  },
  
  joinRoom: (roomCode) => {
    set({ 
      mode: 'playerVsPlayer', 
      isOnline: true,
      isWaitingForOpponent: false,
      roomCode,
      opponentName: 'Opponent' // This would come from the server in a real implementation
    });
    
    // In a real implementation, this would connect to a server
    console.log(`Joined room with code: ${roomCode}`);
  },
  
  startSinglePlayer: () => {
    set({ 
      mode: 'singlePlayer', 
      isOnline: false,
      isWaitingForOpponent: false,
      roomCode: null,
      opponentName: null
    });
    
    console.log('Starting single player game');
  },
  
  startAIGame: () => {
    set({ 
      mode: 'playerVsAI', 
      isOnline: false,
      isWaitingForOpponent: false,
      roomCode: null,
      opponentName: 'AI Opponent'
    });
    
    console.log('Starting game against AI');
  },
  
  resetState: () => {
    set({
      mode: 'singlePlayer',
      isOnline: false,
      isWaitingForOpponent: false,
      roomCode: null,
      opponentName: null
    });
  }
}));