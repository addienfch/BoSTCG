// Player types
export type Player = 'player' | 'opponent';

// Game phases
export type GamePhase = 
  | 'setup'   // Initial avatar placement phase
  | 'refresh' // Refresh energy/counters
  | 'draw'    // Draw a card
  | 'main1'   // First main phase (play cards, activate abilities)
  | 'battle'  // Declare attacks
  | 'damage'  // Resolve combat damage
  | 'main2'   // Second main phase (play cards, activate abilities)
  | 'end';    // End turn, discard to hand limit