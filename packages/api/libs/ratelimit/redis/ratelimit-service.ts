import { initializeAllLimiters } from './index';

// Create a singleton to ensure one-time initialization
class RateLimiterService {
  private static instance: RateLimiterService;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance() {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService();
    }
    return RateLimiterService.instance;
  }

  async init() {
    if (this.initialized) {
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
