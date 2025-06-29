/**
 * Expansion Management System
 * Comprehensive expansion lifecycle management with creation, cloning, and validation
 */

import { Expansion } from '../game/stores/useExpansionStore';
import { assetValidator } from './assetValidation';
import { getExpansionImageWithFallback } from './imageResolver';

export interface ExpansionCreateOptions {
  name: string;
  symbol: string;
  description: string;
  artUrl?: string;
  totalCards?: number;
  baseFrom?: string; // ID of expansion to clone from
}

export interface ExpansionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface ExpansionAssetPaths {
  cards: {
    avatars: string;
    spells: string;
    equipment: string;
  };
  battleSets: string;
  boosters: string;
  expansionIcon: string;
}

/**
 * Comprehensive expansion manager with full lifecycle support
 */
export class ExpansionManager {
  private static instance: ExpansionManager;

  static getInstance(): ExpansionManager {
    if (!ExpansionManager.instance) {
      ExpansionManager.instance = new ExpansionManager();
    }
    return ExpansionManager.instance;
  }

  /**
   * Create a new expansion with proper directory structure
   */
  async createExpansion(options: ExpansionCreateOptions): Promise<Expansion> {
    const validation = this.validateExpansionData(options);
    
    if (!validation.valid) {
      throw new Error(`Cannot create expansion: ${validation.errors.join(', ')}`);
    }

    const expansionId = this.generateExpansionId(options.name);
    
    const newExpansion: Expansion = {
      id: expansionId,
      name: options.name,
      symbol: options.symbol,
      description: options.description,
      artUrl: options.artUrl || getExpansionImageWithFallback({ 
        id: expansionId, 
        name: options.name, 
        symbol: options.symbol 
      }),
      totalCards: options.totalCards || 100,
      releaseDate: new Date().toISOString().split('T')[0]
    };

    // Generate asset directory structure
    const assetPaths = this.generateAssetPaths(expansionId);
    
    // If cloning from another expansion, copy its structure
    if (options.baseFrom) {
      await this.cloneExpansionStructure(options.baseFrom, expansionId);
    }

    return newExpansion;
  }

  /**
   * Clone an existing expansion with new metadata
   */
  async cloneExpansion(sourceId: string, options: Partial<ExpansionCreateOptions>): Promise<Expansion> {
    if (!options.name) {
      throw new Error('Name is required when cloning an expansion');
    }

    const cloneOptions: ExpansionCreateOptions = {
      name: options.name,
      symbol: options.symbol || '🔄',
      description: options.description || `Cloned from ${sourceId}`,
      artUrl: options.artUrl,
      totalCards: options.totalCards,
      baseFrom: sourceId
    };

    return await this.createExpansion(cloneOptions);
  }

  /**
   * Validate expansion data for creation
   */
  validateExpansionData(options: ExpansionCreateOptions): ExpansionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Required field validation
    if (!options.name || options.name.trim().length === 0) {
      errors.push('Expansion name is required');
    }

    if (!options.symbol || options.symbol.trim().length === 0) {
      errors.push('Expansion symbol is required');
    }

    if (!options.description || options.description.trim().length === 0) {
      warnings.push('Expansion description is empty');
    }

    // Name validation
    if (options.name && options.name.length < 3) {
      errors.push('Expansion name must be at least 3 characters long');
    }

    if (options.name && options.name.length > 50) {
      errors.push('Expansion name must be less than 50 characters');
    }

    // Symbol validation
    if (options.symbol && options.symbol.length > 5) {
      warnings.push('Expansion symbol is quite long, consider shortening it');
    }

    // Description validation
    if (options.description && options.description.length > 200) {
      warnings.push('Expansion description is very long, consider shortening it');
    }

    // Art URL validation
    if (options.artUrl) {
      if (!this.isValidImageUrl(options.artUrl)) {
        warnings.push('Art URL may not be a valid image format');
      }
    } else {
      recommendations.push('Consider adding custom artwork for better visual appeal');
    }

    // Total cards validation
    if (options.totalCards && options.totalCards < 20) {
      warnings.push('Expansions with fewer than 20 cards may feel limited');
    }

    if (options.totalCards && options.totalCards > 500) {
      warnings.push('Very large expansions may be overwhelming for players');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  /**
   * Generate asset directory paths for an expansion
   */
  generateAssetPaths(expansionId: string): ExpansionAssetPaths {
    const basePath = `/images/expansions/${expansionId}`;
    
    return {
      cards: {
        avatars: `${basePath}/cards/avatars/`,
        spells: `${basePath}/cards/spells/`,
        equipment: `${basePath}/cards/equipment/`
      },
      battleSets: `${basePath}/battle-sets/`,
      boosters: `${basePath}/boosters/`,
      expansionIcon: `${basePath}/icon.png`
    };
  }

  /**
   * Clone expansion structure from source to target
   */
  private async cloneExpansionStructure(sourceId: string, targetId: string): Promise<void> {
    const sourcePaths = this.generateAssetPaths(sourceId);
    const targetPaths = this.generateAssetPaths(targetId);

    // In a real implementation, this would copy files from source to target
    // For now, we log the intended operations
    console.log(`Cloning expansion structure:`);
    console.log(`Source: ${sourcePaths.cards.avatars}`);
    console.log(`Target: ${targetPaths.cards.avatars}`);
    
    // This would be implemented with actual file operations in a full system
    return Promise.resolve();
  }

  /**
   * Generate a unique expansion ID from name
   */
  private generateExpansionId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Validate if a URL looks like a valid image
   */
  private isValidImageUrl(url: string): boolean {
    if (url.startsWith('data:image/')) return true;
    
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'];
    const lowercaseUrl = url.toLowerCase();
    
    return imageExtensions.some(ext => lowercaseUrl.includes(ext));
  }

  /**
   * Get recommended asset upload paths for an expansion
   */
  getUploadPaths(expansionId: string): Record<string, string> {
    const paths = this.generateAssetPaths(expansionId);
    
    return {
      'Avatar Cards': paths.cards.avatars,
      'Spell Cards': paths.cards.spells,
      'Equipment Cards': paths.cards.equipment,
      'Battle Set Backgrounds': paths.battleSets,
      'Booster Pack Art': paths.boosters,
      'Expansion Icon': paths.expansionIcon
    };
  }

  /**
   * Validate an existing expansion for completeness
   */
  async validateExpansion(expansion: Expansion): Promise<ExpansionValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Basic data validation
    const dataValidation = this.validateExpansionData({
      name: expansion.name,
      symbol: expansion.symbol,
      description: expansion.description,
      artUrl: expansion.artUrl,
      totalCards: expansion.totalCards
    });

    errors.push(...dataValidation.errors);
    warnings.push(...dataValidation.warnings);
    recommendations.push(...dataValidation.recommendations);

    // Asset validation
    if (expansion.artUrl) {
      try {
        const assetResult = await assetValidator.validateImage(expansion.artUrl);
        if (!assetResult.valid) {
          warnings.push(`Expansion artwork issue: ${assetResult.error}`);
        }
      } catch (error) {
        warnings.push('Could not validate expansion artwork');
      }
    }

    // Asset structure validation
    const paths = this.generateAssetPaths(expansion.id);
    const uploadPaths = this.getUploadPaths(expansion.id);
    
    if (Object.keys(uploadPaths).length > 0) {
      recommendations.push('Consider organizing assets using the recommended directory structure');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  /**
   * Get expansion statistics and health metrics
   */
  getExpansionMetrics(expansion: Expansion): {
    health: 'excellent' | 'good' | 'fair' | 'poor';
    completeness: number; // percentage
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let completeness = 0;
    
    // Basic data completeness (40% weight)
    if (expansion.name && expansion.name.length >= 3) completeness += 10;
    if (expansion.symbol && expansion.symbol.length > 0) completeness += 10;
    if (expansion.description && expansion.description.length >= 20) completeness += 10;
    if (expansion.releaseDate) completeness += 10;

    // Asset completeness (30% weight)
    if (expansion.artUrl) completeness += 15;
    if (expansion.totalCards && expansion.totalCards >= 40) completeness += 15;

    // Advanced features (30% weight)
    // This would check for associated cards, battle sets, etc.
    // For now, we give partial credit
    completeness += 20;

    // Determine health based on completeness
    let health: 'excellent' | 'good' | 'fair' | 'poor';
    if (completeness >= 90) health = 'excellent';
    else if (completeness >= 75) health = 'good';
    else if (completeness >= 50) health = 'fair';
    else health = 'poor';

    // Generate recommendations
    if (completeness < 100) {
      if (!expansion.artUrl) recommendations.push('Add custom artwork');
      if (!expansion.description || expansion.description.length < 20) {
        recommendations.push('Add detailed description');
      }
      if (!expansion.totalCards || expansion.totalCards < 40) {
        recommendations.push('Ensure adequate card count for gameplay');
      }
    }

    return {
      health,
      completeness,
      recommendations
    };
  }
}

// Export singleton instance
export const expansionManager = ExpansionManager.getInstance();

// Convenience functions
export const createExpansion = (options: ExpansionCreateOptions) => 
  expansionManager.createExpansion(options);

export const cloneExpansion = (sourceId: string, options: Partial<ExpansionCreateOptions>) => 
  expansionManager.cloneExpansion(sourceId, options);

export const validateExpansionData = (options: ExpansionCreateOptions) => 
  expansionManager.validateExpansionData(options);

export const generateExpansionAssetPaths = (expansionId: string) => 
  expansionManager.generateAssetPaths(expansionId);

export const getExpansionUploadPaths = (expansionId: string) => 
  expansionManager.getUploadPaths(expansionId);