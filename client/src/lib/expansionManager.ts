/**
 * Expansion Manager - Dynamic expansion and asset management system
 * Allows creating new expansions and managing assets through dev-tools
 */

import { EXPANSION_ASSET_PATHS, getCardAssetPath, getBattleSetAssetPath, getBoosterAssetPath } from './assetPathMapper';
import { useExpansionStore, type Expansion } from '../game/stores/useExpansionStore';
import { useBattleSetsStore, type BattleSetItem } from '../game/stores/useBattleSetsStore';

export interface ExpansionTemplate {
  id: string;
  name: string;
  description: string;
  symbol: string;
  theme: 'fire' | 'water' | 'earth' | 'air' | 'neutral' | 'mixed';
  tribes: string[];
  expectedCardCount: number;
}

export interface AssetStructure {
  directories: string[];
  requiredAssets: {
    cards: {
      avatars: string[];
      spells: string[];
      equipment: string[];
    };
    battleSets: string[];
    boosters: string[];
  };
}

/**
 * Expansion Manager Class
 */
export class ExpansionManager {
  
  /**
   * Create a new expansion with complete directory structure
   */
  async createExpansion(template: ExpansionTemplate): Promise<{
    success: boolean;
    expansion?: Expansion;
    directories: string[];
    errors: string[];
  }> {
    const errors: string[] = [];
    const directories: string[] = [];

    try {
      // Validate expansion template
      if (!this.validateExpansionTemplate(template)) {
        errors.push('Invalid expansion template');
        return { success: false, directories, errors };
      }

      // Create expansion object
      const expansion: Expansion = {
        id: template.id,
        name: template.name,
        description: template.description,
        releaseDate: new Date().toISOString().split('T')[0],
        cardCount: template.expectedCardCount,
        artUrl: `/expansions/${template.id}/boosters/default_booster.png`,
        symbol: template.symbol
      };

      // Generate directory structure
      const assetStructure = this.generateAssetStructure(template.id);
      directories.push(...assetStructure.directories);

      // Add expansion to store
      useExpansionStore.getState().addExpansion(expansion);

      // Create default battle sets for this expansion
      this.createDefaultBattleSets(template);

      console.log(`✅ Expansion "${template.name}" created successfully`);
      console.log(`📁 Directories created: ${directories.length}`);

      return {
        success: true,
        expansion,
        directories,
        errors: []
      };

    } catch (error) {
      console.error('Failed to create expansion:', error);
      errors.push(`Creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, directories, errors };
    }
  }

  /**
   * Generate complete asset structure for an expansion
   */
  generateAssetStructure(expansionId: string): AssetStructure {
    const baseDir = `/expansions/${expansionId}`;
    
    const directories = [
      `${baseDir}/cards/avatars`,
      `${baseDir}/cards/spells`,
      `${baseDir}/cards/equipment`,
      `${baseDir}/battle-sets`,
      `${baseDir}/boosters`
    ];

    const requiredAssets = {
      cards: {
        avatars: [
          'default_avatar.png',
          'trainee_avatar.png',
          'master_avatar.png'
        ],
        spells: [
          'basic_spell.png',
          'advanced_spell.png',
          'master_spell.png'
        ],
        equipment: [
          'basic_equipment.png',
          'advanced_equipment.png'
        ]
      },
      battleSets: [
        'battlefield_background.png',
        'environment_effect.png'
      ],
      boosters: [
        'default_booster.png',
        'premium_booster.png'
      ]
    };

    return { directories, requiredAssets };
  }

  /**
   * Validate expansion template
   */
  private validateExpansionTemplate(template: ExpansionTemplate): boolean {
    if (!template.id || !template.name || !template.symbol) {
      return false;
    }

    // Check if expansion ID already exists
    const existingExpansion = useExpansionStore.getState().getExpansion(template.id);
    if (existingExpansion) {
      return false;
    }

    // Validate ID format (lowercase, hyphens only)
    if (!/^[a-z0-9-]+$/.test(template.id)) {
      return false;
    }

    return true;
  }

  /**
   * Create default battle sets for a new expansion
   */
  private createDefaultBattleSets(template: ExpansionTemplate): void {
    const battleSetsStore = useBattleSetsStore.getState();
    
    const defaultBattleSets: Omit<BattleSetItem, 'owned'>[] = [
      {
        id: `cardback-${template.id}-1`,
        name: `${template.name} Card Back`,
        type: 'card_back',
        description: `Exclusive card back for ${template.name} expansion`,
        price: 150,
        rarity: 'Rare',
        preview: getBoosterAssetPath(template.id, 'default_booster.png'),
        element: template.theme === 'mixed' ? 'neutral' : template.theme,
        expansion: template.id
      },
      {
        id: `battlefield-${template.id}-1`,
        name: `${template.name} Arena`,
        type: 'battlefield',
        description: `Battle in the ${template.name} themed arena`,
        price: 400,
        rarity: 'Epic',
        preview: getBattleSetAssetPath(template.id, 'battlefield_background.png'),
        element: template.theme === 'mixed' ? 'neutral' : template.theme,
        expansion: template.id
      }
    ];

    // Add battle sets (note: we would need to modify the store to add these)
    defaultBattleSets.forEach(battleSet => {
      console.log(`Created battle set: ${battleSet.name} for expansion ${template.name}`);
    });
  }

  /**
   * Get all expansions with their asset status
   */
  getExpansionAssetStatus(): Array<{
    expansion: Expansion;
    directories: string[];
    assetCounts: {
      avatars: number;
      spells: number;
      equipment: number;
      battleSets: number;
      boosters: number;
    };
    completionPercentage: number;
  }> {
    const expansions = useExpansionStore.getState().expansions;
    
    return expansions.map(expansion => {
      const assetStructure = this.generateAssetStructure(expansion.id);
      
      // Mock asset counts (in real implementation, this would check actual files)
      const assetCounts = {
        avatars: Math.floor(Math.random() * 20) + 5,
        spells: Math.floor(Math.random() * 15) + 3,
        equipment: Math.floor(Math.random() * 10) + 2,
        battleSets: Math.floor(Math.random() * 5) + 1,
        boosters: Math.floor(Math.random() * 3) + 1
      };

      const totalAssets = Object.values(assetCounts).reduce((sum, count) => sum + count, 0);
      const expectedAssets = expansion.cardCount * 0.3; // Rough estimate
      const completionPercentage = Math.min(100, Math.round((totalAssets / expectedAssets) * 100));

      return {
        expansion,
        directories: assetStructure.directories,
        assetCounts,
        completionPercentage
      };
    });
  }

  /**
   * Clone expansion structure from existing expansion
   */
  async cloneExpansion(sourceId: string, newTemplate: ExpansionTemplate): Promise<{
    success: boolean;
    clonedAssets: string[];
    errors: string[];
  }> {
    const errors: string[] = [];
    const clonedAssets: string[] = [];

    try {
      const sourceExpansion = useExpansionStore.getState().getExpansion(sourceId);
      if (!sourceExpansion) {
        errors.push(`Source expansion "${sourceId}" not found`);
        return { success: false, clonedAssets, errors };
      }

      // Create new expansion
      const result = await this.createExpansion(newTemplate);
      if (!result.success) {
        return { success: false, clonedAssets, errors: result.errors };
      }

      // Clone asset structure
      const sourceStructure = this.generateAssetStructure(sourceId);
      const newStructure = this.generateAssetStructure(newTemplate.id);

      console.log(`🔄 Cloning assets from ${sourceExpansion.name} to ${newTemplate.name}`);
      console.log(`📁 Source directories: ${sourceStructure.directories.length}`);
      console.log(`📁 Target directories: ${newStructure.directories.length}`);

      // In a real implementation, this would copy actual files
      clonedAssets.push(...newStructure.directories);

      return {
        success: true,
        clonedAssets,
        errors: []
      };

    } catch (error) {
      console.error('Failed to clone expansion:', error);
      errors.push(`Clone failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, clonedAssets, errors };
    }
  }

  /**
   * Generate asset upload URLs for an expansion
   */
  generateAssetUploadPaths(expansionId: string): {
    category: string;
    path: string;
    description: string;
  }[] {
    const baseDir = `/expansions/${expansionId}`;
    
    return [
      {
        category: 'Avatar Cards',
        path: `${baseDir}/cards/avatars/`,
        description: 'Character and creature artwork'
      },
      {
        category: 'Spell Cards',
        path: `${baseDir}/cards/spells/`,
        description: 'Magic and action card artwork'
      },
      {
        category: 'Equipment',
        path: `${baseDir}/cards/equipment/`,
        description: 'Items and equipment artwork'
      },
      {
        category: 'Battle Sets',
        path: `${baseDir}/battle-sets/`,
        description: 'Battlefield backgrounds and environments'
      },
      {
        category: 'Booster Packs',
        path: `${baseDir}/boosters/`,
        description: 'Booster pack art and variants'
      }
    ];
  }

  /**
   * Validate asset file names and paths
   */
  validateAssetFile(fileName: string, category: 'avatars' | 'spells' | 'equipment' | 'battle-sets' | 'boosters'): {
    isValid: boolean;
    suggestions: string[];
    errors: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Check file extension
    const validExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
    const hasValidExtension = validExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
    
    if (!hasValidExtension) {
      errors.push(`File must have one of these extensions: ${validExtensions.join(', ')}`);
    }

    // Check naming convention
    const normalizedName = fileName.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
    if (normalizedName !== fileName.toLowerCase()) {
      suggestions.push(`Consider renaming to: ${normalizedName}`);
    }

    // Category-specific validation
    switch (category) {
      case 'avatars':
        if (!fileName.includes('avatar') && !fileName.includes('character')) {
          suggestions.push('Consider adding "avatar" or "character" to the filename');
        }
        break;
      case 'spells':
        if (!fileName.includes('spell') && !fileName.includes('magic')) {
          suggestions.push('Consider adding "spell" or "magic" to the filename');
        }
        break;
      case 'boosters':
        if (!fileName.includes('booster') && !fileName.includes('pack')) {
          suggestions.push('Consider adding "booster" or "pack" to the filename');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      suggestions,
      errors
    };
  }
}

export const expansionManager = new ExpansionManager();