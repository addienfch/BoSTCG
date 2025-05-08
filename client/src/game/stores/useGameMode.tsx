import { create } from 'zustand';

// Game mode types
export type GameMode = 'practice' | 'vs-ai' | 'online' | 'none';

// Game mode state interface
interface GameModeState {
  // State properties
  mode: GameMode;
  playerName: string;
  roomCode: string | null;
  isWaitingForOpponent: boolean;
  isGameStarted: boolean;
  opponentName: string | null;
  opponentId: string | null;
  
  // Actions
  setPlayerName: (name: string) => void;
  startSinglePlayer: () => void;
  startAIGame: () => void;
  createRoom: () => void;
  joinRoom: (roomCode: string) => void;
  setOpponent: (name: string, id: string) => void;
  resetState: () => void;
}

// Create the store
export const useGameMode = create<GameModeState>((set) => ({
  // Initial state
  mode: 'none',
  playerName: 'Player',
  roomCode: null,
  isWaitingForOpponent: false,
  isGameStarted: false,
  opponentName: null,
  opponentId: null,
  
  // Set player name
  setPlayerName: (name: string) => set(() => ({ 
    playerName: name || 'Player'
  })),
  
  // Start single player (practice) mode
  startSinglePlayer: () => set(() => ({
    mode: 'practice',
    isGameStarted: true,
    opponentName: 'Practice Opponent',
    opponentId: 'practice-bot',
    isWaitingForOpponent: false,
  })),
  
  // Start game against AI
  startAIGame: () => set(() => {
    console.log('Starting game against AI');
    return {
      mode: 'vs-ai',
      isGameStarted: true,
      opponentName: 'AI Opponent',
      opponentId: 'ai-bot',
      isWaitingForOpponent: false,
    };
  }),
  
  // Create a new room for online play
  createRoom: () => set(() => {
    // Generate a random 6-character room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return {
      mode: 'online',
      roomCode,
      isWaitingForOpponent: true,
      isGameStarted: false,
      opponentName: null,
      opponentId: null,
    };
  }),
  
  // Join an existing room
  joinRoom: (roomCode: string) => set(() => ({
    mode: 'online',
    roomCode,
    isWaitingForOpponent: false,
    isGameStarted: true,
    // In a real implementation, we would get these from the server
    opponentName: 'Opponent',
    opponentId: 'opponent-id',
  })),
  
  // Set opponent information
  setOpponent: (name: string, id: string) => set(() => ({
    opponentName: name,
    opponentId: id,
    isWaitingForOpponent: false,
    isGameStarted: true,
  })),
  
  // Reset state (for going back to menu)
  resetState: () => set(() => ({
    mode: 'none',
    roomCode: null,
    isWaitingForOpponent: false,
    isGameStarted: false,
    opponentName: null,
    opponentId: null,
  })),
}));

export default useGameMode;