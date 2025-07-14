import type { TranslationMetrics } from './types';

// Metrics collection
export class MetricsCollector {
  private metrics: TranslationMetrics;

  constructor() {
    this.metrics = {
      totalTranslations: 0,
      successfulTranslations: 0,
      failedTranslations: 0,
      tokensUsed: 0,
      estimatedCost: 0,
      averageLatency: 0,
      providerStats: new Map(),
    };
  }

  recordTranslation(
    provider: string,
    success: boolean,
    latency: number,
    tokens = 0
  ): void {
    this.metrics.totalTranslations++;

    if (success) {
      this.metrics.successfulTranslations++;
    } else {
      this.metrics.failedTranslations++;
    }

    this.metrics.tokensUsed += tokens;
    this.updateProviderStats(provider, success, latency, tokens);
    this.calculateAverageLatency();
  }

  private updateProviderStats(
    provider: string,
    success: boolean,
    latency: number,
    tokens: number
  ): void {
    let stats = this.metrics.providerStats.get(provider);
    if (!stats) {
      stats = {
        successCount: 0,
        failureCount: 0,
        averageLatency: 0,
        tokensUsed: 0,
        rateLimitHits: 0,
      };
      this.metrics.providerStats.set(provider, stats);
    }

    if (success) {
      stats.successCount++;
    } else {
      stats.failureCount++;
    }

    stats.tokensUsed += tokens;
    stats.averageLatency = (stats.averageLatency + latency) / 2;
  }

  private calculateAverageLatency(): void {
    if (this.metrics.totalTranslations > 0) {
      const totalLatency = Array.from(
        this.metrics.providerStats.values()
      ).reduce((sum, stats) => sum + stats.averageLatency, 0);
      this.metrics.averageLatency =
        totalLatency / this.metrics.providerStats.size;
    }
  }

  getReport(): string {
    const { metrics } = this;
    const successRate =
      (metrics.successfulTranslations / metrics.totalTranslations) * 100;

    let report = '\n=== Translation Metrics Report ===\n';
    report += `Total Translations: ${metrics.totalTranslations}\n`;
    report += `Success Rate: ${successRate.toFixed(1)}%\n`;
    report += `Average Latency: ${metrics.averageLatency.toFixed(0)}ms\n`;
    report += `Tokens Used: ${metrics.tokensUsed.toLocaleString()}\n`;
    report += `Estimated Cost: $${metrics.estimatedCost.toFixed(4)}\n\n`;

    report += 'Provider Statistics:\n';
    for (const [provider, stats] of metrics.providerStats) {
      const providerSuccess =
        (stats.successCount / (stats.successCount + stats.failureCount)) * 100;
      report += `  ${provider}: ${providerSuccess.toFixed(1)}% success, ${stats.averageLatency.toFixed(0)}ms avg\n`;
    }

    return report;
  }

  getMetrics(): TranslationMetrics {
    return { ...this.metrics };
  }
}
