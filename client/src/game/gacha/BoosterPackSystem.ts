import { Card } from '../data/cardTypes';
import { redElementalCards } from '../data/redElementalCards';
import { allKobarBorahCards } from '../data/kobarBorahCards';
import { allKujanaKuhakaCards } from '../data/kujanaKuhakaCards';
import { allNeutralCards } from '../data/neutralCards';
import { toast } from 'sonner';

// Define different booster pack types
export enum BoosterPackType {
  RANDOM = 'random',
  FIRE = 'fire',
  KOBAR_BORAH = 'kobar_borah',
  KUJANA_KUHAKA = 'kujana_kuhaka',
  NEUTRAL = 'neutral'
}

// Define booster pack information
export interface BoosterPack {
  id: string;
  name: string;
  description: string;
  type: BoosterPackType;
  price: number;
  cardCount: number;
  guaranteedRarity: {
    avatar: number;
    spell: number;
  };
  image?: string;
}

// Define available booster packs
export const availableBoosterPacks: BoosterPack[] = [
  {
    id: 'starter-pack',
    name: 'Starter Booster Pack',
    description: 'A basic booster pack with mixed cards. Contains 5 cards with at least 1 avatar.',
    type: BoosterPackType.RANDOM,
    price: 100,
    cardCount: 5,
    guaranteedRarity: {
      avatar: 1,
      spell: 0
    },
    image: '/textures/cards/booster_pack.png'
  },
  {
    id: 'fire-elemental-pack',
    name: 'Fire Elemental Pack',
    description: 'A pack focused on fire element cards. Contains 5 cards with at least 1 avatar.',
    type: BoosterPackType.FIRE,
    price: 150,
    cardCount: 5,
    guaranteedRarity: {
      avatar: 1,
      spell: 1
    },
    image: '/textures/cards/fire_booster.png'
  },
  {
    id: 'kobar-borah-pack',
    name: 'Kobar-Borah Tribal Pack',
    description: 'A specialized pack with Kobar-Borah tribal cards. Contains 5 cards with at least 2 avatars.',
    type: BoosterPackType.KOBAR_BORAH,
    price: 200,
    cardCount: 5,
    guaranteedRarity: {
      avatar: 2,
      spell: 1
    },
    image: '/textures/cards/kobar_booster.png'
  },
  {
    id: 'kujana-kuhaka-pack',
    name: 'Kujana-Kuhaka Tribal Pack',
    description: 'A specialized pack with Kujana-Kuhaka tribal cards. Contains 5 cards with at least 2 avatars.',
    type: BoosterPackType.KUJANA_KUHAKA,
    price: 200,
    cardCount: 5,
    guaranteedRarity: {
      avatar: 2,
      spell: 1
    },
    image: '/textures/cards/kuhaka_booster.png'
  },
  {
    id: 'neutral-item-pack',
    name: 'Neutral Item Pack',
    description: 'A specialized pack with neutral item cards. Contains 5 cards with a mix of valuable item cards.',
    type: BoosterPackType.NEUTRAL,
    price: 150,
    cardCount: 5,
    guaranteedRarity: {
      avatar: 0,
      spell: 5
    },
    image: '/textures/cards/neutral_booster.png'
  }
];

// Function to get all cards based on booster pack type
const getCardPoolByPackType = (packType: BoosterPackType): Card[] => {
  switch (packType) {
    case BoosterPackType.FIRE:
      return Object.values(redElementalCards);
    case BoosterPackType.KOBAR_BORAH:
      return allKobarBorahCards;
    case BoosterPackType.KUJANA_KUHAKA:
      return allKujanaKuhakaCards;
    case BoosterPackType.NEUTRAL:
      return allNeutralCards;  // Only neutral cards in neutral pack
    case BoosterPackType.RANDOM:
    default:
      // Combine all card pools
      return [
        ...Object.values(redElementalCards),
        ...allKobarBorahCards, 
        ...allKujanaKuhakaCards,
        ...allNeutralCards
      ];
  }
};

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to open a booster pack and get cards (always 5 cards)
export const openBoosterPack = (packType: BoosterPackType, cardCount: number = 5): Card[] => {
  // Enforce exactly 5 cards per pack
  const maxCards = 5;
  // Get all cards for this pack type
  const allCards = getCardPoolByPackType(packType);
  
  // Special handling for neutral pack - include only neutral/item cards
  if (packType === BoosterPackType.NEUTRAL) {
    const itemCards = allCards.filter(card => card.type === 'item');
    const spellCards = allCards.filter(card => (card.type === 'spell' || card.type === 'quickSpell') && card.element === 'neutral');
    
    // Combine and shuffle
    const allNeutralCards = shuffleArray([...itemCards, ...spellCards]);
    
    // Return exactly 5 random neutral cards
    return allNeutralCards.slice(0, maxCards);
  }
  
  // Regular pack processing for other types
  
  // Separate avatars and spells
  const avatarCards = allCards.filter(card => card.type === 'avatar');
  const spellCards = allCards.filter(card => card.type === 'spell' || card.type === 'quickSpell' || card.type === 'item');
  
  // Shuffle the card pools
  const shuffledAvatars = shuffleArray(avatarCards);
  const shuffledSpells = shuffleArray(spellCards);
  
  // Get guarantees based on pack type
  const pack = availableBoosterPacks.find(p => p.type === packType) || availableBoosterPacks[0];
  const guaranteedAvatars = pack.guaranteedRarity.avatar;
  const guaranteedSpells = pack.guaranteedRarity.spell;
  
  // Start building the pack with guaranteed cards
  const packCards: Card[] = [
    ...shuffledAvatars.slice(0, guaranteedAvatars),
    ...shuffledSpells.slice(0, guaranteedSpells)
  ];
  
  // Fill the rest with random cards from combined pool (limit to 5 total)
  const remainingCount = Math.min(maxCards - packCards.length, cardCount - packCards.length);
  if (remainingCount > 0) {
    const remainingPool = shuffleArray([
      ...shuffledAvatars.slice(guaranteedAvatars),
      ...shuffledSpells.slice(guaranteedSpells)
    ]);
    
    packCards.push(...remainingPool.slice(0, remainingCount));
  }
  
  // Ensure exactly 5 cards are returned
  return packCards.slice(0, maxCards);
};

// Function to purchase a booster pack with coins
export const purchaseBoosterPack = (
  packId: string, 
  playerCoins: number,
  updatePlayerCoins: (newAmount: number) => void,
  addCardsToCollection: (cards: Card[]) => void
): boolean => {
  // Find the pack
  const pack = availableBoosterPacks.find(p => p.id === packId);
  if (!pack) {
    toast.error('Booster pack not found!');
    return false;
  }
  
  // Check if player has enough coins
  if (playerCoins < pack.price) {
    toast.error(`Not enough coins! You need ${pack.price} coins.`);
    return false;
  }
  
  // Deduct coins
  const newCoinAmount = playerCoins - pack.price;
  updatePlayerCoins(newCoinAmount);
  
  // Open the pack and get cards
  const cards = openBoosterPack(pack.type, pack.cardCount);
  
  // Add cards to player's collection
  addCardsToCollection(cards);
  
  // Show success message
  toast.success(`Successfully purchased ${pack.name}!`);
  return true;
};