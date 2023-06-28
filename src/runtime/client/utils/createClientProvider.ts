import type { AuthProviderConfig } from '../types';

export function createClientProvider<Configuration = any>(data: AuthProviderConfig<Configuration>): AuthProviderConfig<Configuration> {
  return data;
}
