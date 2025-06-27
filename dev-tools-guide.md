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

## Expansion Management Status: 🔄 FIXING

### Current Issue
- Expansion creation form exists but save function needs implementation
- Icon upload works but expansion list doesn't update

### Intended Functionality
- Create new card sets/expansions
- Upload custom icons for each expansion
- Track which cards belong to which expansion

## Premade Deck Builder Status: 🔄 FIXING

### Current Issue
- Interface exists but deck creation doesn't save properly
- Need to implement deck generation logic

### Intended Functionality  
- Create complete 40-60 card starter decks
- Assign to specific tribes and expansions
- Set difficulty levels and strategies

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