/**
 * Asset Validation System
 * Comprehensive validation for all game assets including images, models, and audio
 */

export interface AssetValidationResult {
  valid: boolean;
  error?: string;
  fallback?: string;
  assetType: 'image' | 'model' | 'audio' | 'data';
}

export interface AssetValidationOptions {
  allowFallback?: boolean;
  maxFileSize?: number; // bytes
  allowedExtensions?: string[];
  requireSecure?: boolean;
}

/**
 * Comprehensive asset validator with security checks
 */
export class AssetValidator {
  private static instance: AssetValidator;
  private validatedAssets = new Map<string, AssetValidationResult>();

  static getInstance(): AssetValidator {
    if (!AssetValidator.instance) {
      AssetValidator.instance = new AssetValidator();
    }
    return AssetValidator.instance;
  }

  /**
   * Validate image asset with security checks
   */
  async validateImage(src: string, options: AssetValidationOptions = {}): Promise<AssetValidationResult> {
    const cacheKey = `image:${src}`;
    
    if (this.validatedAssets.has(cacheKey)) {
      return this.validatedAssets.get(cacheKey)!;
    }

    const result = await this.performImageValidation(src, options);
    this.validatedAssets.set(cacheKey, result);
    return result;
  }

  private async performImageValidation(src: string, options: AssetValidationOptions): Promise<AssetValidationResult> {
    try {
      // Security check: Prevent path traversal
      if (src.includes('..') || src.includes('\\')) {
        return {
          valid: false,
          error: 'Invalid path: Path traversal detected',
          assetType: 'image'
        };
      }

      // Check for allowed extensions
      const allowedExtensions = options.allowedExtensions || ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
      const extension = src.toLowerCase().substring(src.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `Invalid file type: ${extension} not allowed`,
          assetType: 'image'
        };
      }

      // For data URIs (base64 images)
      if (src.startsWith('data:image/')) {
        return {
          valid: true,
          assetType: 'image'
        };
      }

      // For external URLs in production
      if (src.startsWith('http')) {
        if (options.requireSecure && !src.startsWith('https://')) {
          return {
            valid: false,
            error: 'Insecure URL: HTTPS required',
            assetType: 'image'
          };
        }
        return {
          valid: true,
          assetType: 'image'
        };
      }

      // For local assets
      if (src.startsWith('/') || src.startsWith('./')) {
        return {
          valid: true,
          assetType: 'image'
        };
      }

      return {
        valid: false,
        error: 'Invalid image source format',
        assetType: 'image'
      };

    } catch (error) {
      return {
        valid: false,
        error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        assetType: 'image'
      };
    }
  }

  /**
   * Validate 3D model asset
   */
  async validateModel(src: string, options: AssetValidationOptions = {}): Promise<AssetValidationResult> {
    const cacheKey = `model:${src}`;
    
    if (this.validatedAssets.has(cacheKey)) {
      return this.validatedAssets.get(cacheKey)!;
    }

    const result = await this.performModelValidation(src, options);
    this.validatedAssets.set(cacheKey, result);
    return result;
  }

  private async performModelValidation(src: string, options: AssetValidationOptions): Promise<AssetValidationResult> {
    try {
      // Security check: Prevent path traversal
      if (src.includes('..') || src.includes('\\')) {
        return {
          valid: false,
          error: 'Invalid path: Path traversal detected',
          assetType: 'model'
        };
      }

      // Check for allowed 3D model extensions
      const allowedExtensions = options.allowedExtensions || ['.glb', '.gltf', '.fbx', '.obj'];
      const extension = src.toLowerCase().substring(src.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `Invalid model type: ${extension} not supported`,
          assetType: 'model'
        };
      }

      return {
        valid: true,
        assetType: 'model'
      };

    } catch (error) {
      return {
        valid: false,
        error: `Model validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        assetType: 'model'
      };
    }
  }

  /**
   * Validate audio asset
   */
  async validateAudio(src: string, options: AssetValidationOptions = {}): Promise<AssetValidationResult> {
    const cacheKey = `audio:${src}`;
    
    if (this.validatedAssets.has(cacheKey)) {
      return this.validatedAssets.get(cacheKey)!;
    }

    const result = await this.performAudioValidation(src, options);
    this.validatedAssets.set(cacheKey, result);
    return result;
  }

  private async performAudioValidation(src: string, options: AssetValidationOptions): Promise<AssetValidationResult> {
    try {
      // Security check: Prevent path traversal
      if (src.includes('..') || src.includes('\\')) {
        return {
          valid: false,
          error: 'Invalid path: Path traversal detected',
          assetType: 'audio'
        };
      }

      // Check for allowed audio extensions
      const allowedExtensions = options.allowedExtensions || ['.mp3', '.wav', '.ogg', '.m4a'];
      const extension = src.toLowerCase().substring(src.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `Invalid audio type: ${extension} not supported`,
          assetType: 'audio'
        };
      }

      return {
        valid: true,
        assetType: 'audio'
      };

    } catch (error) {
      return {
        valid: false,
        error: `Audio validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        assetType: 'audio'
      };
    }
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.validatedAssets.clear();
  }

  /**
   * Get validation statistics
   */
  getValidationStats(): { total: number; valid: number; invalid: number } {
    const total = this.validatedAssets.size;
    let valid = 0;
    let invalid = 0;

    this.validatedAssets.forEach((result) => {
      if (result.valid) {
        valid++;
      } else {
        invalid++;
      }
    });

    return { total, valid, invalid };
  }
}

// Export singleton instance
export const assetValidator = AssetValidator.getInstance();

/**
 * Quick validation helpers
 */
export const validateImageAsset = (src: string, options?: AssetValidationOptions) => 
  assetValidator.validateImage(src, options);

export const validateModelAsset = (src: string, options?: AssetValidationOptions) => 
  assetValidator.validateModel(src, options);

export const validateAudioAsset = (src: string, options?: AssetValidationOptions) => 
  assetValidator.validateAudio(src, options);

/**
 * Legacy function name for card image validation
 * Maintains backward compatibility
 */
export const validateCardImage = async (src: string): Promise<string> => {
  const result = await assetValidator.validateImage(src);
  
  if (result.valid) {
    return src;
  }
  
  // Return fallback SVG for invalid images
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="100" height="140" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="140" fill="#374151" stroke="#6B7280" stroke-width="2" rx="8"/>
      <text x="50" y="70" font-family="Arial" font-size="12" fill="#9CA3AF" text-anchor="middle">
        Card
      </text>
      <text x="50" y="85" font-family="Arial" font-size="10" fill="#6B7280" text-anchor="middle">
        Image
      </text>
    </svg>
  `)}`;
};

/**
 * Batch validation for multiple assets
 */
export const validateAssetBatch = async (
  assets: Array<{ src: string; type: 'image' | 'model' | 'audio'; options?: AssetValidationOptions }>
): Promise<AssetValidationResult[]> => {
  const results = await Promise.all(
    assets.map(asset => {
      switch (asset.type) {
        case 'image':
          return assetValidator.validateImage(asset.src, asset.options);
        case 'model':
          return assetValidator.validateModel(asset.src, asset.options);
        case 'audio':
          return assetValidator.validateAudio(asset.src, asset.options);
        default:
          return Promise.resolve({
            valid: false,
            error: `Unknown asset type: ${asset.type}`,
            assetType: asset.type as any
          });
      }
    })
  );

  return results;
};