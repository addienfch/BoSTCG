# Book of Spektrum - 3D Trading Card Game

## Overview

Book of Spektrum is a full-stack 3D trading card game built for the web, featuring immersive Three.js graphics, blockchain integration via Solana, and modern React architecture. The game combines traditional trading card mechanics with innovative 3D visualization and NFT functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **3D Graphics**: Three.js with React Three Fiber (@react-three/fiber)
- **UI Components**: Radix UI with Tailwind CSS for styling
- **State Management**: Zustand for global state
- **Build Tool**: Vite with custom configuration for 3D assets
- **Routing**: React Router for navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Development Server**: Vite middleware integration
- **File Structure**: Monorepo with shared types and schemas

### 3D Game Engine
- **Rendering**: React Three Fiber with Drei helpers
- **Post-processing**: React Three Postprocessing
- **Asset Support**: GLTF/GLB models, GLSL shaders
- **Camera Controls**: Custom 3D card game perspective

## Key Components

### Game Systems
1. **Card Game Engine** (`/game/stores/useGameStore.ts`)
   - Turn-based gameplay with multiple phases (refresh, draw, main1, battle, damage, main2, end)
   - Avatar and action card mechanics
   - Energy system with elemental types (fire, water, ground, air, neutral)
   - Counter system for status effects (bleed, burn, freeze, poison, stun, shield)

2. **Deck Management** (`/game/stores/useDeckStore.ts`)
   - Deck builder with card filtering and validation
   - Card collection management
   - Integration with blockchain NFTs (cNFTs)

3. **AI System** 
   - Simple AI opponent for single-player mode
   - Conditional damage calculation system
   - Skill trigger checking and effect processing

### Blockchain Integration
- **Platform**: Solana blockchain
- **NFT Standard**: Compressed NFTs (cNFTs) for scalability
- **Wallet**: Phantom wallet integration
- **Services**: Card minting, trading, and ownership verification

### Card Types and Elements
- **Avatar Cards**: Creatures with health, skills, and tribal affiliations
- **Action Cards**: Spells, equipment, and utility cards
- **Elements**: Fire, Water, Ground, Air, Neutral
- **Tribes**: Kobar, Borah, Kuhaka, Kujana, Kuku

### Data Management
- **Card Data**: Comprehensive card database with metadata
- **Image Assets**: Organized texture system with fallback handling
- **Conditional Effects**: Advanced damage calculation with triggers
- **Booster Packs**: Gacha system for card acquisition

## Data Flow

1. **Game Initialization**: Load player deck, shuffle cards, set initial game state
2. **Turn Management**: Phase progression with automated AI responses
3. **Card Actions**: Drag-and-drop interface for card placement and targeting
4. **Effect Resolution**: Skill triggers, damage calculation, and status updates
5. **State Synchronization**: Real-time updates across game components

## External Dependencies

### Core Libraries
- React ecosystem (React, React-DOM, React Router)
- Three.js ecosystem (Three, React Three Fiber, Drei)
- Zustand for state management
- Drizzle ORM with PostgreSQL
- Tailwind CSS with Radix UI components

### Blockchain & Payment
- Solana web3.js for blockchain interaction
- PayPal SDK for payment processing
- Phantom wallet adapter

### Development Tools
- TypeScript for type safety
- Vite for fast development and building
- ESBuild for server bundling
- GLSL plugin for shader support

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20
- **Database**: Neon PostgreSQL (serverless)
- **Port Configuration**: 5000 (local) → 80 (external)
- **Hot Reloading**: Vite HMR with error overlay

### Production Deployment
- **Target**: Google Cloud Run
- **Build Process**: Client and server bundling with asset optimization
- **Database Migrations**: Drizzle Kit for schema management
- **Environment Variables**: DATABASE_URL for PostgreSQL connection

### Asset Management
- 3D models and textures served statically
- Card images with progressive loading and error handling
- Audio files for game effects and music

## Changelog

- June 27, 2025. Initial setup
- December 27, 2024. UI improvements and discard mechanics:
  - Made dev-tools UI more compact while preserving all functionality
  - Updated all navigation icons to simple lineart style (SVG)
  - Added discard confirmation popup for cards with "you may discard" mechanics
  - Implemented card rarity system with 5 tiers (Common, Uncommon, Rare, Super Rare, Mythic)
  - Added card rarity variants system for same cards with different artwork

## User Preferences

Preferred communication style: Simple, everyday language.
Preferred icon style: Simple lineart style icons (SVG-based)
Preferred UI density: Compact layouts with preserved functionality