import fs from 'node:fs/promises';
import type { TranslationProgress } from './types';

// Progress tracking and resumability
export class ProgressTracker {
  private progressFile: string;
  private progress: TranslationProgress;

  constructor(progressFile: string) {
    this.progressFile = progressFile;
    this.progress = this.loadProgressSync();
  }

  private loadProgressSync(): TranslationProgress {
    try {
      const data = require('node:fs').readFileSync(this.progressFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {
        currentNamespace: '',
        completedNamespaces: [],
        currentLocale: '',
        completedLocales: [],
        startTime: Date.now(),
      };
    }
  }

  async saveProgress(): Promise<void> {
    await fs.writeFile(
      this.progressFile,
      JSON.stringify(this.progress, null, 2)
    );
  }

  async updateProgress(
    namespace: string,
    locale: string,
    completed: boolean
  ): Promise<void> {
    this.progress.currentNamespace = namespace;
    this.progress.currentLocale = locale;

    if (completed) {
      const completedKey = `${namespace}:${locale}`;
      if (!this.progress.completedLocales.includes(completedKey)) {
        this.progress.completedLocales.push(completedKey);
      }
    }

    await this.saveProgress();
  }

  isCompleted(namespace: string, locale: string): boolean {
    return this.progress.completedLocales.includes(`${namespace}:${locale}`);
  }

  getEstimatedCompletion(totalWork: number, completedWork: number): number {
    if (completedWork === 0) return 0;

    const elapsed = Date.now() - this.progress.startTime;
    const rate = completedWork / elapsed;
    const remaining = totalWork - completedWork;

    return Date.now() + remaining / rate;
  }
}
