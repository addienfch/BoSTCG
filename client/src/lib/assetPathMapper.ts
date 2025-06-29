/**
 * Asset Path Mapper for Organized Expansion Structure
 * Maps card assets to their new organized directory structure
 */

export interface AssetPaths {
  cards: {
    avatars: string;
    spells: string;
    equipment: string;
  };
  battleSets: string;
  boosters: string;
}

/**
 * Asset path mapping for each expansion
 */
export const EXPANSION_ASSET_PATHS: Record<string, AssetPaths> = {
  'kobar-borah': {
    cards: {
      avatars: '/expansions/kobar-borah/cards/avatars',
      spells: '/expansions/kobar-borah/cards/spells',
      equipment: '/expansions/kobar-borah/cards/equipment'
    },
    battleSets: '/expansions/kobar-borah/battle-sets',
    boosters: '/expansions/kobar-borah/boosters'
  },
  'kujana-kuhaka': {
    cards: {
      avatars: '/expansions/kujana-kuhaka/cards/avatars',
      spells: '/expansions/kujana-kuhaka/cards/spells',
      equipment: '/expansions/kujana-kuhaka/cards/equipment'
    },
    battleSets: '/expansions/kujana-kuhaka/battle-sets',
    boosters: '/expansions/kujana-kuhaka/boosters'
  },
  'neutral-spells': {
    cards: {
      avatars: '/expansions/shared/boosters', // Neutrals don't have avatars
      spells: '/expansions/neutral-spells/cards/spells',
      equipment: '/expansions/neutral-spells/cards/equipment'
    },
    battleSets: '/expansions/neutral-spells/battle-sets',
    boosters: '/expansions/neutral-spells/boosters'
  }
};

/**
 * Shared asset paths for common resources
 */
export const SHARED_ASSET_PATHS = {
  boosters: '/expansions/shared/boosters',
  ui: '/expansions/shared/ui',
  backgrounds: '/expansions/shared/backgrounds'
};

/**
 * Legacy path mappings for backward compatibility
 */
export const LEGACY_PATH_MAPPINGS: Record<string, string> = {
  // Kobar & Borah avatars
  '/textures/cards/banaspati-fem.png': '/expansions/kobar-borah/cards/avatars/banaspati-fem.png',
  '/textures/cards/banaspati.png': '/expansions/kobar-borah/cards/avatars/banaspati.png',
  '/textures/cards/crimson.png': '/expansions/kobar-borah/cards/avatars/crimson.png',
  '/textures/cards/daisy.png': '/expansions/kobar-borah/cards/avatars/daisy.png',
  '/textures/cards/radja.png': '/expansions/kobar-borah/cards/avatars/radja.png',
  '/textures/cards/scarlet.png': '/expansions/kobar-borah/cards/avatars/scarlet.png',
  '/textures/cards/boar-berserker.png': '/expansions/kobar-borah/cards/avatars/boar-berserker.png',
  '/textures/cards/boar-witch.png': '/expansions/kobar-borah/cards/avatars/boar-witch.png',
  '/textures/cards/borah-trainee-a.png': '/expansions/kobar-borah/cards/avatars/borah-trainee-a.png',
  '/textures/cards/borah-trainee-b.png': '/expansions/kobar-borah/cards/avatars/borah-trainee-b.png',
  '/textures/cards/borah-trainee.png': '/expansions/kobar-borah/cards/avatars/borah-trainee.png',
  '/textures/cards/kobar-trainee-a.png': '/expansions/kobar-borah/cards/avatars/kobar-trainee-a.png',
  '/textures/cards/kobar-trainee-b.png': '/expansions/kobar-borah/cards/avatars/kobar-trainee-b.png',
  '/textures/cards/kobar-trainee-c.png': '/expansions/kobar-borah/cards/avatars/kobar-trainee-c.png',
  '/textures/cards/shaman-a.png': '/expansions/kobar-borah/cards/avatars/shaman-a.png',
  '/textures/cards/shaman-b.png': '/expansions/kobar-borah/cards/avatars/shaman-b.png',
  '/textures/cards/thug.png': '/expansions/kobar-borah/cards/avatars/thug.png',
  '/textures/cards/witch-trainee.png': '/expansions/kobar-borah/cards/avatars/witch-trainee.png',
  '/textures/cards/repo-girl.png': '/expansions/kobar-borah/cards/avatars/repo-girl.png',

  // Kobar & Borah spells
  '/textures/cards/after-burn.png': '/expansions/kobar-borah/cards/spells/after-burn.png',
  '/textures/cards/burn-ball.png': '/expansions/kobar-borah/cards/spells/burn-ball.png',
  '/textures/cards/burning-armor.png': '/expansions/kobar-borah/cards/spells/burning-armor.png',
  '/textures/cards/burning-sight.png': '/expansions/kobar-borah/cards/spells/burning-sight.png',
  '/textures/cards/burning-up.png': '/expansions/kobar-borah/cards/spells/burning-up.png',
  '/textures/cards/cracking-sword.png': '/expansions/kobar-borah/cards/spells/cracking-sword.png',
  '/textures/cards/double-bomb.png': '/expansions/kobar-borah/cards/spells/double-bomb.png',
  '/textures/cards/falling-fireball.png': '/expansions/kobar-borah/cards/spells/falling-fireball.png',
  '/textures/cards/flaming-body.png': '/expansions/kobar-borah/cards/spells/flaming-body.png',
  '/textures/cards/lighting-spark.png': '/expansions/kobar-borah/cards/spells/lighting-spark.png',
  '/textures/cards/spark.png': '/expansions/kobar-borah/cards/spells/spark.png',

  // Neutral spells
  '/textures/cards/kencur.png': '/expansions/neutral-spells/cards/spells/kencur.png',
  '/textures/cards/merah.png': '/expansions/neutral-spells/cards/spells/merah.png',
  '/textures/cards/rec_scroll.png': '/expansions/neutral-spells/cards/spells/rec_scroll.png',

  // Battle sets
  '/textures/cards/battle_preparation.png': '/expansions/neutral-spells/battle-sets/battle_preparation.png',
  '/textures/cards/crates.png': '/expansions/neutral-spells/battle-sets/crates.png',
  '/textures/cards/prize.png': '/expansions/neutral-spells/battle-sets/prize.png',

  // Boosters
  '/textures/cards/fire_booster.png': '/expansions/kobar-borah/boosters/fire_booster.png',
  '/textures/cards/kobar_booster.png': '/expansions/kobar-borah/boosters/kobar_booster.png',
  '/textures/cards/kuhaka_booster.png': '/expansions/kujana-kuhaka/boosters/kuhaka_booster.png',
  '/textures/cards/neutral_booster.png': '/expansions/neutral-spells/boosters/neutral_booster.png',
  '/textures/cards/booster_pack.png': '/expansions/shared/boosters/booster_pack.png',
  '/textures/cards/default_avatar.svg': '/expansions/shared/boosters/default_avatar.svg',
  '/textures/cards/placeholder.svg': '/expansions/shared/boosters/placeholder.svg'
};

/**
 * Get the asset path for a card based on its expansion and type
 */
export const getCardAssetPath = (
  expansionId: string, 
  cardType: 'avatar' | 'spell' | 'equipment', 
  fileName: string
): string => {
  const expansionPaths = EXPANSION_ASSET_PATHS[expansionId];
  if (!expansionPaths) {
    return `${SHARED_ASSET_PATHS.boosters}/${fileName}`;
  }

  const cardTypeMap = {
    avatar: expansionPaths.cards.avatars,
    spell: expansionPaths.cards.spells,
    equipment: expansionPaths.cards.equipment
  };

  return `${cardTypeMap[cardType]}/${fileName}`;
};

/**
 * Get battle set asset path for an expansion
 */
export const getBattleSetAssetPath = (expansionId: string, fileName: string): string => {
  const expansionPaths = EXPANSION_ASSET_PATHS[expansionId];
  if (!expansionPaths) {
    return `${SHARED_ASSET_PATHS.ui}/${fileName}`;
  }
  return `${expansionPaths.battleSets}/${fileName}`;
};

/**
 * Get booster asset path for an expansion
 */
export const getBoosterAssetPath = (expansionId: string, fileName: string): string => {
  const expansionPaths = EXPANSION_ASSET_PATHS[expansionId];
  if (!expansionPaths) {
    return `${SHARED_ASSET_PATHS.boosters}/${fileName}`;
  }
  return `${expansionPaths.boosters}/${fileName}`;
};

/**
 * Convert legacy path to new organized path
 */
export const convertLegacyPath = (legacyPath: string): string => {
  return LEGACY_PATH_MAPPINGS[legacyPath] || legacyPath;
};

/**
 * Get all asset paths for an expansion (useful for preloading)
 */
export const getAllExpansionAssets = (expansionId: string): string[] => {
  const paths = EXPANSION_ASSET_PATHS[expansionId];
  if (!paths) return [];

  return [
    paths.cards.avatars,
    paths.cards.spells,
    paths.cards.equipment,
    paths.battleSets,
    paths.boosters
  ];
};

/**
 * Validate if an asset path follows the new organization structure
 */
export const isOrganizedAssetPath = (path: string): boolean => {
  return path.startsWith('/expansions/');
};

/**
 * Asset path helper for specific card art lookups
 */
export const getCardArt = (cardName: string, expansion: string): string => {
  // Convert card name to file name format
  const fileName = cardName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '') + '.png';

  // Determine card type based on name patterns
  let cardType: 'avatar' | 'spell' | 'equipment' = 'avatar';
  if (cardName.toLowerCase().includes('spell') || 
      cardName.toLowerCase().includes('burn') ||
      cardName.toLowerCase().includes('spark')) {
    cardType = 'spell';
  }

  return getCardAssetPath(expansion, cardType, fileName);
};