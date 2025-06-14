# Book of Spektrum - Asset Organization

This directory contains all game assets organized in a hierarchical structure for easy management and expansion.

## Directory Structure

```
assets/
├── main/                           # Core game assets
│   ├── logo/                       # Game logos and branding
│   ├── icons/                      # UI icons and symbols
│   ├── ui/                         # UI screenshots and mockups
│   └── *.txt, *.csv               # Documentation and data files
├── expansions/                     # Card expansions
│   └── base_set/                   # Base set expansion
│       ├── cards/                  # Card assets by type and element
│       │   ├── avatar/
│       │   │   ├── fire/           # Fire element avatars
│       │   │   ├── water/          # Water element avatars
│       │   │   ├── ground/         # Ground element avatars
│       │   │   ├── air/            # Air element avatars
│       │   │   └── neutral/        # Neutral element avatars
│       │   ├── spell/              # Spell cards by element
│       │   │   ├── fire/
│       │   │   ├── water/
│       │   │   ├── ground/
│       │   │   ├── air/
│       │   │   └── neutral/
│       │   ├── quickspell/         # Quick spell cards by element
│       │   │   ├── fire/
│       │   │   ├── water/
│       │   │   ├── ground/
│       │   │   ├── air/
│       │   │   └── neutral/
│       │   ├── ritual/             # Ritual armor cards by element
│       │   │   ├── fire/
│       │   │   ├── water/
│       │   │   ├── ground/
│       │   │   ├── air/
│       │   │   └── neutral/
│       │   ├── item/               # Item cards by element
│       │   │   ├── fire/
│       │   │   ├── water/
│       │   │   ├── ground/
│       │   │   ├── air/
│       │   │   └── neutral/
│       │   └── field/              # Field cards by element
│       │       ├── fire/
│       │       ├── water/
│       │       ├── ground/
│       │       ├── air/
│       │       └── neutral/
│       └── cosmetics/              # Visual customization assets
│           ├── card_backs/         # Card back designs
│           ├── deck_covers/        # Deck cover art
│           └── boards/             # Game board backgrounds
```

## Asset Path Examples

### Avatars
- Fire avatars: `/assets/expansions/base_set/cards/avatar/fire/Red Elemental Avatar_Ava - Crimson.png`
- Water avatars: `/assets/expansions/base_set/cards/avatar/water/[filename].png`

### Spells
- Fire spells: `/assets/expansions/base_set/cards/spell/fire/Red Elemental Spell_4 - Falling Fireballs.png`
- Neutral spells: `/assets/expansions/base_set/cards/spell/neutral/Non Elemental - Spell_Kencur.png`

### Main Assets
- UI mockups: `/assets/main/ui/Screenshot 2025-05-03 at 17.20.27.png`
- Documentation: `/assets/main/spektrum_card_template - fire_avatar_cards (1).csv`

## Adding New Assets

1. **New Cards**: Place in appropriate `/assets/expansions/[expansion_name]/cards/[type]/[element]/` directory
2. **New Expansions**: Create new expansion folder under `/assets/expansions/`
3. **Cosmetics**: Add to appropriate cosmetics subfolder
4. **Main Assets**: Place in `/assets/main/[category]/`

## Migration from Old Structure

All assets have been migrated from the old `attached_assets/` directory to this organized structure. The `cardImageFixer.ts` utility handles path corrections automatically for legacy references.