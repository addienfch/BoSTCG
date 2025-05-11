import { AvatarCard, ActionCard, ElementType } from './cardTypes';
import {
  // Level 1 Avatars
  witchTrainee,
  shamanKuhaka,
  shamanKujana,
  thug,
  repoGirl,
  // Level 2 Avatars
  banaspati,
  banaspatiFemale,
  boarBerserker,
  boarWitch,
  // Arrays
  redElementalLevel1AvatarCards,
  redElementalLevel2AvatarCards
} from './redElementalCards';

// Helper function to create energy cost arrays (kept for compatibility)
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

// KUJANA-KUHAKA TRIBE CARDS

// Arrays of cards for different collections
export const kujanaKuhakaLevel1Cards: AvatarCard[] = [
  witchTrainee,
  shamanKuhaka,
  shamanKujana,
  thug,
  repoGirl
];

export const kujanaKuhakaLevel2Cards: AvatarCard[] = [
  banaspati,
  banaspatiFemale,
  boarBerserker,
  boarWitch
];

export const kujanaKuhakaAvatarCards: AvatarCard[] = [
  ...kujanaKuhakaLevel1Cards,
  ...kujanaKuhakaLevel2Cards
];

// Combined card collections
export const allKujanaKuhakaCards = [...kujanaKuhakaAvatarCards];