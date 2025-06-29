# Asset Organization Guide - Book of Spektrum

## New Organized Directory Structure

The asset directory has been completely reorganized to support easy expansion management and scalability. All assets are now organized by expansion with clear separation of concerns.

### Directory Structure

```
client/public/expansions/
├── kobar-borah/                 # Fire & Earth tribes expansion
│   ├── cards/
│   │   ├── avatars/            # Avatar character art
│   │   ├── spells/             # Spell and action card art
│   │   └── equipment/          # Equipment and item art
│   ├── battle-sets/            # Battle set backgrounds, effects
│   └── boosters/               # Booster pack art and variants
│
├── kujana-kuhaka/              # Water & Air tribes expansion
│   ├── cards/
│   │   ├── avatars/            # Avatar character art
│   │   ├── spells/             # Spell and action card art
│   │   └── equipment/          # Equipment and item art
│   ├── battle-sets/            # Battle set backgrounds, effects
│   └── boosters/               # Booster pack art and variants
│
├── neutral-spells/             # Universal magic expansion
│   ├── cards/
│   │   ├── spells/             # Neutral spell art
│   │   └── equipment/          # Universal equipment
│   ├── battle-sets/            # Neutral battle environments
│   └── boosters/               # Neutral booster pack art
│
└── shared/                     # Common assets across expansions
    ├── boosters/               # Default booster templates
    ├── ui/                     # UI elements, icons
    └── backgrounds/            # Shared backgrounds
```

## Asset Path Mapping

The `assetPathMapper.ts` utility provides:

### 1. Expansion-Specific Paths
```typescript
// Get card art for specific expansion
getCardAssetPath('kobar-borah', 'avatar', 'crimson.png')
// Returns: '/expansions/kobar-borah/cards/avatars/crimson.png'

// Get battle set assets
getBattleSetAssetPath('neutral-spells', 'battle_preparation.png')
// Returns: '/expansions/neutral-spells/battle-sets/battle_preparation.png'

// Get booster pack art
getBoosterAssetPath('kobar-borah', 'fire_booster.png')
// Returns: '/expansions/kobar-borah/boosters/fire_booster.png'
```

### 2. Legacy Path Conversion
```typescript
// Automatically converts old paths to new structure
convertLegacyPath('/textures/cards/crimson.png')
// Returns: '/expansions/kobar-borah/cards/avatars/crimson.png'
```

### 3. Dynamic Card Art Lookup
```typescript
// Smart card art detection based on name and expansion
getCardArt('Crimson Fire Avatar', 'kobar-borah')
// Returns: '/expansions/kobar-borah/cards/avatars/crimson-fire-avatar.png'
```

## Expansion Assets Breakdown

### Kobar & Borah (Fire & Earth) 🔥
**Location:** `/expansions/kobar-borah/`

**Avatars:** banaspati-fem.png, banaspati.png, crimson.png, daisy.png, radja.png, scarlet.png, boar-berserker.png, boar-witch.png, borah-trainee-a.png, borah-trainee-b.png, borah-trainee.png, kobar-trainee-a.png, kobar-trainee-b.png, kobar-trainee-c.png, shaman-a.png, shaman-b.png, thug.png, witch-trainee.png, repo-girl.png

**Spells:** after-burn.png, burn-ball.png, burning-armor.png, burning-sight.png, burning-up.png, cracking-sword.png, double-bomb.png, falling-fireball.png, flaming-body.png, lighting-spark.png, spark.png

**Boosters:** fire_booster.png, kobar_booster.png

### Kujana & Kuhaka (Water & Air) 💧
**Location:** `/expansions/kujana-kuhaka/`

**Boosters:** kuhaka_booster.png

*Note: Avatar and spell assets for this expansion should be added here as they're created*

### Neutral Spells (Universal) ⚡
**Location:** `/expansions/neutral-spells/`

**Spells:** kencur.png, merah.png, rec_scroll.png, plus all assets from the neutral/ subdirectory

**Battle Sets:** battle_preparation.png, crates.png, prize.png

**Boosters:** neutral_booster.png

### Shared Assets 🔄
**Location:** `/expansions/shared/`

**Boosters:** booster_pack.png, default_avatar.svg, placeholder.svg

## Adding New Expansions

To add a new expansion, follow this structure:

1. **Create Directory Structure:**
```bash
mkdir -p "client/public/expansions/new-expansion-name/cards/avatars"
mkdir -p "client/public/expansions/new-expansion-name/cards/spells"
mkdir -p "client/public/expansions/new-expansion-name/cards/equipment"
mkdir -p "client/public/expansions/new-expansion-name/battle-sets"
mkdir -p "client/public/expansions/new-expansion-name/boosters"
```

2. **Update Asset Path Mapper:**
Add the new expansion to `EXPANSION_ASSET_PATHS` in `assetPathMapper.ts`

3. **Update Expansion Store:**
Add the new expansion data to `useExpansionStore.ts`

## Benefits of New Structure

### ✅ **Scalability**
- Easy to add new expansions without conflicts
- Clear separation of expansion-specific content
- Organized asset discovery and management

### ✅ **Maintainability**
- Logical grouping by expansion and asset type
- Clear file naming conventions
- Automatic path resolution and fallbacks

### ✅ **Performance**
- Efficient asset loading per expansion
- Better caching strategies possible
- Reduced asset bundle sizes

### ✅ **Development Experience**
- Easy to locate and modify expansion assets
- Clear asset ownership and responsibility
- Automated path mapping and validation

## Migration Notes

All existing asset references have been mapped to the new structure. The `assetPathMapper.ts` utility provides backward compatibility while gradually migrating to the new organized structure.

**Legacy paths are automatically converted**, so existing code continues to work while new code should use the organized path functions for better maintainability.