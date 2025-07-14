// Enhanced rate limiting with adaptive delays
export class RateLimiter {
  private lastCallTime = 0;
  private consecutiveFailures = 0;
  private baseDelay: number;

  constructor(baseDelay: number) {
    this.baseDelay = baseDelay;
  }

  async waitForNext(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    // Adaptive delay based on failures
    const adaptiveDelay = this.baseDelay * 1.5 ** this.consecutiveFailures;
    const maxDelay = 10000; // 10 seconds max
    const finalDelay = Math.min(adaptiveDelay, maxDelay);

    if (timeSinceLastCall < finalDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, finalDelay - timeSinceLastCall)
      );
    }

    this.lastCallTime = Date.now();
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
  }

  recordFailure(): void {
    this.consecutiveFailures++;
  }
}
