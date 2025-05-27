import { auth, currentUser, getAuth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

export class ClerkAuth {
  private devUserId: string | null = null;
  private prodUserId: string | null = null;

  constructor() {
    this.parseUserIdMapping();
  }
  getAuthFromRequest(request: NextRequest) {
    const clerkAuth = getAuth(request);
    const userId = this.getMappedUserId(clerkAuth.userId);

    return { clerkAuth, userId };
  }

  async getAuth() {
    const clerkAuth = await auth();
    const userId = this.getMappedUserId(clerkAuth.userId);

    return { clerkAuth, userId };
  }

  async getCurrentUser() {
    const user = await currentUser();

    if (!user) return null;

    const userId = this.getMappedUserId(user.id) as string;

    return { ...user, id: userId };
  }
  private getMappedUserId(originalUserId: string | null): string | null {
    if (!originalUserId) return null;
    if (
      process.env.NODE_ENV === 'development' &&
      this.devUserId &&
      this.prodUserId &&
      originalUserId === this.devUserId
    ) {
      return this.prodUserId;
    }

    return originalUserId;
  }
  private parseUserIdMapping(): void {
    const mappingStr = process.env.CLERK_DEV_IMPERSONATE_USER || '';

    if (!mappingStr) return;

    const [dev, prod] = mappingStr.split('=');
    if (dev && prod) {
      this.devUserId = dev.trim();
      this.prodUserId = prod.trim();
    }
  }
}

export type IClerkAuth = ReturnType<typeof getAuth>;

export const clerkAuth = new ClerkAuth();
