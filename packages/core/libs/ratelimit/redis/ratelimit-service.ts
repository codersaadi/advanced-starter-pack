import env from '@repo/env/app';
import { initializeAllLimiters } from './index';

// Create a singleton to ensure one-time initialization
class RateLimiterService {
  private static instance: RateLimiterService;
  initialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance() {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService();
    }
    return RateLimiterService.instance;
  }

  async init() {
    if (this.initialized || !env.IN_APP_RATE_LIMIT) {
      return;
    }

    if (!this.initPromise) {
      this.initPromise = initializeAllLimiters()
        .then(() => {
          this.initialized = true;
        })
        .catch((err) => {
          throw err;
        });
    }

    return this.initPromise;
  }
}

export const rateLimitersIntializeService = RateLimiterService.getInstance();
