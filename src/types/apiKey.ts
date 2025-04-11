export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
}

export interface ApiKeyFull extends ApiKey {
  key: string;
}

export interface ApiKeyCreateParams {
  name: string;
  scopes?: string[];
}
