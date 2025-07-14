import type { QualityCheck } from './types';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class QualityAssurance {
  static checkTranslationQuality(
    original: string,
    translated: string,
    format: 'json' | 'text' | 'array'
  ): QualityCheck {
    const check: QualityCheck = {
      hasValidJson: true,
      placeholdersPreserved: true,
      noUntranslatedContent: true,
      structureIntact: true,
      score: 0,
    };

    // JSON validation
    if (format === 'json') {
      try {
        const originalObj = JSON.parse(original);
        const translatedObj = JSON.parse(translated);
        check.structureIntact = QualityAssurance.compareStructure(
          originalObj,
          translatedObj
        );
      } catch {
        check.hasValidJson = false;
      }
    }

    // Placeholder preservation
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    const originalPlaceholders = this.extractPlaceholders(original);
    const translatedPlaceholders =
      QualityAssurance.extractPlaceholders(translated);
    check.placeholdersPreserved = QualityAssurance.arraysEqual(
      originalPlaceholders,
      translatedPlaceholders
    );

    // Calculate score
    let score = 0;
    if (check.hasValidJson) score += 30;
    if (check.placeholdersPreserved) score += 40;
    if (check.noUntranslatedContent) score += 20;
    if (check.structureIntact) score += 10;

    check.score = score;
    return check;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private static compareStructure(obj1: any, obj2: any): boolean {
    if (typeof obj1 !== typeof obj2) return false;

    if (Array.isArray(obj1)) {
      return Array.isArray(obj2) && obj1.length === obj2.length;
    }

    if (typeof obj1 === 'object' && obj1 !== null) {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      return keys1.length === keys2.length && keys1.every((key) => key in obj2);
    }

    return true;
  }

  private static extractPlaceholders(text: string): string[] {
    const placeholders: string[] = [];
    const patterns = [/\{\{[^}]+\}\}/g, /<[^>]+>/g, /\$\{[^}]+\}/g, /%[^%]+%/g];

    // biome-ignore lint/complexity/noForEach: <explanation>
    patterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        placeholders.push(...matches);
      }
    });

    return placeholders.sort();
  }

  private static arraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, index) => val === arr2[index]);
  }
}
