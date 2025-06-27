import { Card } from '../game/data/cardTypes';
import { getFixedCardImagePath } from '../game/utils/cardImageFixer';
import { validateAssetPath } from './assetValidation';

export interface ImageAuditResult {
  path: string;
  exists: boolean;
  source: string;
  cardName?: string;
}

/**
 * Comprehensive image audit for the entire game
 */
export class ImageAuditor {
  private results: ImageAuditResult[] = [];

  async auditAllImages(): Promise<ImageAuditResult[]> {
    this.results = [];

    await this.auditCriticalAssets();
    await this.auditUIAssets();

    return this.results;
  }

  private async checkImage(path: string, source: string, cardName?: string): Promise<void> {
    const exists = await validateAssetPath(path);
    this.results.push({
      path,
      exists,
      source,
      cardName
    });
  }

  private async auditCriticalAssets(): Promise<void> {
    const criticalAssets = [
      '/textures/cards/default_avatar.svg',
      '/textures/cards/placeholder.svg',
      '/textures/asphalt.png',
      '/textures/grass.png',
      '/textures/sand.jpg',
      '/textures/sky.png',
      '/textures/wood.jpg',
      '/sounds/background.mp3',
      '/sounds/hit.mp3',
      '/sounds/success.mp3'
    ];

    for (const asset of criticalAssets) {
      await this.checkImage(asset, 'Critical Assets');
    }
  }

  private async auditUIAssets(): Promise<void> {
    const uiAssets = [
      '/images/advanced-pack.svg',
      '/images/beginner-pack.svg',
      '/textures/cards/booster_pack.png',
      '/textures/cards/fire_booster.png',
      '/textures/cards/kobar_booster.png',
      '/textures/cards/kuhaka_booster.png',
      '/textures/cards/neutral_booster.png'
    ];

    for (const asset of uiAssets) {
      await this.checkImage(asset, 'UI Assets');
    }
  }

  getMissingImages(): ImageAuditResult[] {
    return this.results.filter(result => !result.exists);
  }

  getValidImages(): ImageAuditResult[] {
    return this.results.filter(result => result.exists);
  }

  generateReport(): string {
    const missing = this.getMissingImages();
    const valid = this.getValidImages();
    
    let report = `IMAGE AUDIT REPORT\n`;
    report += `==================\n`;
    report += `Total Images Checked: ${this.results.length}\n`;
    report += `Valid Images: ${valid.length}\n`;
    report += `Missing Images: ${missing.length}\n\n`;

    if (missing.length > 0) {
      report += `MISSING IMAGES:\n`;
      report += `---------------\n`;
      missing.forEach(result => {
        report += `MISSING: ${result.path}`;
        if (result.cardName) report += ` (Card: ${result.cardName})`;
        report += ` - Source: ${result.source}\n`;
      });
      report += `\n`;
    }

    return report;
  }
}