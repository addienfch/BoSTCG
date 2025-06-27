# Book of Spektrum - Dev Tools Guide

## Overview
Complete guide for using the Dev Tools to manage cards, expansions, and decks.

## Card Editor Features

### ✅ Working Features
- **Card Database View**: Browse all cards with filtering by name, type, element, rarity
- **Card Editing**: Click "Edit" on any card to modify it - changes save immediately
- **New Card Creation**: Create custom cards that appear in the database
- **Card Deletion**: Remove custom cards (confirmation required)
- **Local State Management**: Changes persist during your session

### Card Creation Process
1. Go to Dev Tools → "Edit Card" tab
2. Fill in all fields (Name, Type, Element, etc.)
3. For Avatar cards: Add Level, Health, and Skills
4. For Action cards: Focus on Description and Energy Cost
5. Click "Save Card" - it will appear in Database tab

### Form Fields Explained
- **Name**: Card display name (required)
- **Type**: Avatar (creatures) or Action (spells/items)
- **Element**: Fire, Water, Ground, Air, or Neutral
- **Art**: Image URL for card artwork
- **Energy Cost**: Click element buttons to add required energy
- **Skills**: Avatar cards can have 2 skills with damage values
- **Rarity**: Common → Uncommon → Rare → Super Rare → Mythic

## Expansion Management Status: ✅ WORKING

### Features
- Create new card expansions with custom names, descriptions, and release dates
- Upload icons for visual identification
- Edit existing expansions with live updates
- Delete expansions with confirmation
- All changes persist during dev session

### How to Use
1. Go to "Expansions" tab
2. Click "Add New Expansion" 
3. Fill in name, description, release date, card count
4. Upload icon (optional)
5. Click "Save" - expansion appears immediately

## Premade Deck Builder Status: ✅ WORKING

### Features
- Create complete starter deck templates
- Assign to expansions and tribes
- Set difficulty levels and pricing
- Edit existing decks
- Delete decks with confirmation
- Live preview of deck templates

### How to Use
1. Go to "Premade Decks" tab
2. Click "New Deck Template"
3. Fill in deck details (name, expansion, tribe, etc.)
4. Click "Save Deck Template"
5. Deck appears in template list with edit/delete options

## Quick Start Guide

### To Edit an Existing Card:
1. Go to Dev Tools
2. Find card in Database tab
3. Click "Edit" button  
4. Modify any field
5. Click "Save Card"
6. Card updates immediately in the database

### To Create a New Card:
1. Go to "Edit Card" tab
2. Start with blank form
3. Fill all required fields
4. Set energy costs by clicking element buttons
5. Click "Save Card"
6. New card appears in Database tab

## Console Debugging
The dev tools include detailed logging:
- Check browser console (F12) for save confirmations
- Look for "Saving card:" messages
- Error messages help identify issues

## Integration
- Cards created here work in deck builder
- Compatible with game engine
- Supports NFT metadata generation
- Cards add to your collection automatically