import type { LocationQuery } from 'vue-router';

export interface AuthProvider {
  providerName: string,
  signIn: (args?: any) => Promise<any>,
  callback: (queryParams?: LocationQuery) => Promise<any>
  createError: (error: any, queryParams?: LocationQuery) => any,
}

export interface AuthProviderConfig<Configuration> {
  providerName: AuthProvider['providerName'],
  setup(options?: Configuration): AuthProvider
}
