import { Card, AvatarCard, ActionCard } from '../data/cardTypes';

// Map of broken image paths to corrected ones
const IMAGE_CORRECTIONS: Record<string, string> = {
  // Fix common path issues
  '/attached_assets/Red Elemental Avatar_Ava - Crimson-02.png': '/attached_assets/Red Elemental Avatar_Ava - Crimson.png',
  '/attached_assets/Red Elemental Avatar_Ava - Banaspati-02.png': '/attached_assets/Red Elemental Avatar_Ava - Banaspati.png',
  '/attached_assets/Red Elemental Avatar_Ava - Banaspati Fem-02.png': '/attached_assets/Red Elemental Avatar_Ava - Banaspati Fem.png',
  '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee A-02.png': '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee A.png',
  '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee B-02.png': '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee B.png',
  '/attached_assets/Red Elemental Spell_1 - Cracking Sword-02.png': '/attached_assets/Red Elemental Spell_1 - Cracking Sword.png',
  '/attached_assets/Red Elemental Spell_1 - Spark-02.png': '/attached_assets/Red Elemental Spell_1 - Spark.png',
  '/attached_assets/Red Elemental Spell_2 - Burning Sight-02.png': '/attached_assets/Red Elemental Spell_2 - Burning Sight.png',
  
  // Missing extension fix
  '/attached_assets/Red Elemental Avatar_Ava - Crimson': '/attached_assets/Red Elemental Avatar_Ava - Crimson.png',
  '/attached_assets/Red Elemental Avatar_Ava - Banaspati': '/attached_assets/Red Elemental Avatar_Ava - Banaspati.png',
  
  // Default fallback images by card type
  'DEFAULT_AVATAR': '/textures/cards/default_avatar.png',
  'DEFAULT_SPELL': '/textures/cards/default_spell.png',
  'DEFAULT_QUICK_SPELL': '/textures/cards/default_quick_spell.png'
};

// Get the correct image path or a fallback
export function getFixedCardImagePath(card: Card): string {
  // If no art field, provide a default based on type
  if (!card.art) {
    if (card.type === 'avatar') {
      return IMAGE_CORRECTIONS['DEFAULT_AVATAR'] || '/textures/cards/card_back.png';
    } else if (card.type === 'quickSpell') {
      return IMAGE_CORRECTIONS['DEFAULT_QUICK_SPELL'] || '/textures/cards/card_back.png';
    } else {
      return IMAGE_CORRECTIONS['DEFAULT_SPELL'] || '/textures/cards/card_back.png';
    }
  }
  
  // Check if the image path needs correction
  if (IMAGE_CORRECTIONS[card.art]) {
    return IMAGE_CORRECTIONS[card.art];
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