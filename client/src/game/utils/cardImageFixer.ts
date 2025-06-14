import { Card, AvatarCard, ActionCard } from '../data/cardTypes';

// Map of broken image paths to corrected ones
const IMAGE_CORRECTIONS: Record<string, string> = {
  // Avatar cards - map to actual files in /textures/cards/
  '/attached_assets/Red Elemental Avatar_Ava - Crimson.png': '/textures/cards/crimson.png',
  '/attached_assets/Red Elemental Avatar_Ava - Banaspati.png': '/textures/cards/banaspati.png',
  '/attached_assets/Red Elemental Avatar_Ava - Banaspati Fem.png': '/textures/cards/banaspati-fem.png',
  '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee A.png': '/textures/cards/borah-trainee-a.png',
  '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee B.png': '/textures/cards/borah-trainee-b.png',
  '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee C.png': '/textures/cards/borah-trainee.png',
  '/attached_assets/Red Elemental Avatar_Ava - Kobar Trainee A.png': '/textures/cards/kobar-trainee-a.png',
  '/attached_assets/Red Elemental Avatar_Ava - Kobar Trainee B.png': '/textures/cards/kobar-trainee-b.png',
  '/attached_assets/Red Elemental Avatar_Ava - Kobar Trainee C.png': '/textures/cards/kobar-trainee-c.png',
  '/attached_assets/Red Elemental Avatar_Ava - Radja.png': '/textures/cards/radja.png',
  '/attached_assets/Red Elemental Avatar_Ava - Scarlet.png': '/textures/cards/scarlet.png',
  '/attached_assets/Red Elemental Avatar_Ava - Daisy.png': '/textures/cards/daisy.png',
  '/attached_assets/Red Elemental Avatar_Ava - Boar Berserker.png': '/textures/cards/boar-berserker.png',
  '/attached_assets/Red Elemental Avatar_Ava - Boar Witch.png': '/textures/cards/boar-witch.png',
  '/attached_assets/Red Elemental Avatar_Ava - Repo Girl.png': '/textures/cards/repo-girl.png',
  '/attached_assets/Red Elemental Avatar_Ava - Shaman A.png': '/textures/cards/shaman-a.png',
  '/attached_assets/Red Elemental Avatar_Ava - Shaman B.png': '/textures/cards/shaman-b.png',
  '/attached_assets/Red Elemental Avatar_Ava - Thug A.png': '/textures/cards/thug.png',
  '/attached_assets/Red Elemental Avatar_Ava - Witch Trainee.png': '/textures/cards/witch-trainee.png',
  
  // Fire spells
  '/attached_assets/Red Elemental Spell_1 - Cracking Sword.png': '/textures/cards/cracking-sword.png',
  '/attached_assets/Red Elemental Spell_1 - Spark.png': '/textures/cards/spark.png',
  '/attached_assets/Red Elemental Spell_2 - After Burn.png': '/textures/cards/after-burn.png',
  '/attached_assets/Red Elemental Spell_2 - Burn Ball.png': '/textures/cards/burn-ball.png',
  '/attached_assets/Red Elemental Spell_2 - Burning Sight.png': '/textures/cards/burning-sight.png',
  '/attached_assets/Red Elemental Spell_3 - Burning Up!.png': '/textures/cards/burning-up.png',
  '/attached_assets/Red Elemental Spell_3 - Flaming Body.png': '/textures/cards/flaming-body.png',
  '/attached_assets/Red Elemental Spell_3 - Lighting Spark.png': '/textures/cards/lighting-spark.png',
  '/attached_assets/Red Elemental Spell_4 - Burning Armor.png': '/textures/cards/burning-armor.png',
  '/attached_assets/Red Elemental Spell_4 - Double Bomb.png': '/textures/cards/double-bomb.png',
  '/attached_assets/Red Elemental Spell_4 - Falling Fireballs.png': '/textures/cards/falling-fireball.png',
  
  // Neutral spells
  '/attached_assets/Non Elemental - Spell_Kencur.png': '/textures/cards/kencur.png',
  '/attached_assets/Non Elemental - Spell_Merah.png': '/textures/cards/merah.png',
  '/attached_assets/Non Elemental - Spell_Rec Scroll.png': '/textures/cards/rec_scroll.png',
  
  // UI assets
  '/attached_assets/Non Elemental (1)-15.png': '/textures/cards/neutral/Non Elemental (1)-15.png',
  '/attached_assets/Non Elemental (1)_Battle Preparation.png': '/textures/cards/battle_preparation.png',
  '/attached_assets/Non Elemental (1)_Crates.png': '/textures/cards/crates.png',
  '/attached_assets/Non Elemental (1)_Golden Crates.png': '/textures/cards/neutral/Non Elemental (1)_Golden Crates.png',
  '/attached_assets/Non Elemental (1)_Prize.png': '/textures/cards/prize.png',
  
  // Default fallback images by card type
  'DEFAULT_AVATAR': '/textures/cards/default_avatar.svg',
  'DEFAULT_SPELL': '/textures/cards/default_avatar.svg',
  'DEFAULT_QUICK_SPELL': '/textures/cards/default_avatar.svg'
};

// Get the correct image path or a fallback
export function getFixedCardImagePath(card: Card): string {
  // If no art field, provide a default based on type
  if (!card.art) {
    return '/textures/cards/default_avatar.svg';
  }
  
  // Check if the image path needs correction
  if (IMAGE_CORRECTIONS[card.art]) {
    return IMAGE_CORRECTIONS[card.art];
  }
  
  // If art starts with /textures/cards/, use as-is
  if (card.art.startsWith('/textures/cards/')) {
    return card.art;
  }
  
  return card.art;
}

// Fix card image path in place
export function fixCardImagePath(card: Card): Card {
  if (!card.art) {
    return card; // No change needed
  }
  
  // Check if this path has a known correction
  if (IMAGE_CORRECTIONS[card.art]) {
    return {
      ...card,
      art: IMAGE_CORRECTIONS[card.art]
    };
  }
  
  return card;
}

// Fix a collection of cards
export function fixCardImagePaths(cards: Card[]): Card[] {
  return cards.map(card => fixCardImagePath(card));
}

// Implementation of a card image error handler that can be used with onError event
export function handleCardImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>, 
  card: Card
): void {
  const target = event.currentTarget;
  
  // Try to find a correction
  if (card.art && IMAGE_CORRECTIONS[card.art]) {
    target.src = IMAGE_CORRECTIONS[card.art];
  }
  // If still no art or correction didn't work, use a type-based default
  else if (card.type === 'avatar') {
    target.src = IMAGE_CORRECTIONS['DEFAULT_AVATAR'] || '/textures/cards/card_back.png';
  } 
  else if (card.type === 'quickSpell') {
    target.src = IMAGE_CORRECTIONS['DEFAULT_QUICK_SPELL'] || '/textures/cards/card_back.png';
  }
  else {
    target.src = IMAGE_CORRECTIONS['DEFAULT_SPELL'] || '/textures/cards/card_back.png';
  }
  
  // Stop propagation of further errors to prevent infinite loops
  target.onerror = null;
}