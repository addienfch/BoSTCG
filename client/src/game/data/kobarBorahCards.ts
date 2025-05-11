import { AvatarCard, ActionCard, ElementType } from './cardTypes';
import {
  // Level 1 Avatars
  kobarTraineeA,
  kobarTraineeB,
  kobarTraineeC,
  borahTraineeA,
  borahTraineeB,
  borahTraineeC,
  // Level 2 Avatars
  radja,
  crimson,
  daisy,
  scarlet,
  banaspati,
  banaspatiFemale,
  boarBerserker,
  boarWitch,
  // Spell Cards
  afterBurn,
  burnBall,
  fallingFireball,
  doubleBomb,
  burningArmor,
  crackingSword,
  // Collections
  redElementalLevel1AvatarCards,
  redElementalLevel2AvatarCards,
  redElementalSpellCards,
  redElementalCards
} from './redElementalCards';

// Helper function to create energy cost arrays (keeping for compatibility)
const createEnergyCost = (fire: number = 0, neutral: number = 0): ElementType[] => {
  const energyCost: ElementType[] = [];
  
  // Add fire energy
  for (let i = 0; i < fire; i++) {
    energyCost.push('fire');
  }
  
  // Add neutral energy
  for (let i = 0; i < neutral; i++) {
    energyCost.push('neutral');
  }
  
  return energyCost;
};

// Define borahTrainee which is not directly in redElementalCards.ts
export const borahTrainee: AvatarCard = {
  id: 'borah-001',
  name: 'Borah Trainee C',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'borah',
  health: 6,
  art: '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee C.png',
  skill1: {
    name: 'Explosion',
    energyCost: createEnergyCost(2),
    damage: 2,
    effect: 'If the defending avatar has Bleed counter, this attack gets +1 damage.'
  }
};

// All Kobar-Borah Cards Arrays
export const kobarBorahAvatarCards: AvatarCard[] = [
  kobarTraineeA,
  kobarTraineeB, 
  kobarTraineeC,
  borahTrainee,
  borahTraineeA,
  borahTraineeB,
  radja,
  daisy,
  crimson,
  scarlet
];

// Kujana-Kuhaka Avatar Cards
export const kujanaKuhakaAvatarCards: AvatarCard[] = [
  banaspati,
  banaspatiFemale,
  boarBerserker,
  boarWitch
];

export const kobarBorahActionCards: ActionCard[] = [
  afterBurn,
  burnBall,
  fallingFireball,
  doubleBomb,
  burningArmor,
  crackingSword
];

// Combined card collections
export const allKobarBorahCards = [...kobarBorahAvatarCards, ...kobarBorahActionCards];
export const allKujanaKuhakaCards = [...kujanaKuhakaAvatarCards];
export const allFireCards = [...kobarBorahAvatarCards, ...kujanaKuhakaAvatarCards, ...kobarBorahActionCards];