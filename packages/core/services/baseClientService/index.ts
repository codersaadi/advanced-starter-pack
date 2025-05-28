const FALLBACK_CLIENT_DB_USER_ID = "DEFAULT_ORG_DB_USER";

export class BaseClientService {
  protected readonly userId: string;

  constructor(userId?: string) {
    this.userId = userId || FALLBACK_CLIENT_DB_USER_ID;
  }
}
