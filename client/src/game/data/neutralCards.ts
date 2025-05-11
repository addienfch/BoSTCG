import { Card, ActionCard } from './cardTypes';

// Define the neutral card collection
export const neutralCards: Record<string, Card> = {
  // Item cards
  "recruitment_scroll": {
    id: "recruitment_scroll",
    name: "Recruitment Scroll",
    type: "item",
    element: "neutral",
    description: "Discard 1 Avatar card, then search the deck for an Avatar card who has same element with the discarded card.",
    art: "/attached_assets/Non Elemental - Spell_Rec Scroll.png",
    energyCost: ["neutral"],
  },
  
  "jamu_jahe_merah": {
    id: "jamu_jahe_merah",
    name: "Jamu Jahe Merah",
    type: "item",
    subType: "healing",
    element: "neutral",
    description: "Discard a card, then heal 5 damage from target avatar.",
    art: "/attached_assets/Non Elemental - Spell_Merah.png",
    energyCost: ["neutral"],
  },
  
  "jamu_kencur": {
    id: "jamu_kencur",
    name: "Jamu Kencur",
    type: "item",
    subType: "healing",
    element: "neutral",
    description: "Heal 3 damage from target Avatar.",
    art: "/attached_assets/Non Elemental - Spell_Kencur.png",
    energyCost: ["neutral"],
  },
  
  "battle_preparation": {
    id: "battle_preparation",
    name: "Battle Preparation",
    type: "item",
    element: "neutral",
    description: "Discard Hand, and then draw 5 card from deck.",
    art: "/attached_assets/Non Elemental (1)_Battle Preparation.png",
    energyCost: ["neutral", "neutral"],
  },
  
  "energy_dagger": {
    id: "energy_dagger",
    name: "Energy Dagger",
    type: "item",
    subType: "equipment",
    element: "neutral",
    description: "After this card casted, equip it into target Avatar. Target avatar get ability, +1 damage each time you pay extra energy when attacking opponent. Pay 1 to equip into another Avatar.",
    art: "/attached_assets/Non Elemental (1)-15.png",
    energyCost: ["neutral", "neutral", "neutral"],
  },
  
  // Spell cards
  "prize": {
    id: "prize",
    name: "Prize",
    type: "spell",
    element: "neutral",
    description: "Draw 1 card.",
    art: "/attached_assets/Non Elemental (1)_Prize.png",
    energyCost: ["neutral"],
  },
  
  "golden_crates": {
    id: "golden_crates",
    name: "Golden Crates",
    type: "spell",
    element: "neutral",
    description: "Draw 2 card.",
    art: "/attached_assets/Non Elemental (1)_Golden Crates.png",
    energyCost: ["neutral", "neutral"],
  },
  
  // Quick Spell
  "crates": {
    id: "crates",
    name: "Crates",
    type: "quickSpell",
    element: "neutral",
    description: "Draw 1 card.",
    art: "/attached_assets/Non Elemental (1)_Crates.png",
    energyCost: ["neutral", "neutral"],
  }
};

// Export all neutral cards as an array 
export const allNeutralCards = Object.values(neutralCards);