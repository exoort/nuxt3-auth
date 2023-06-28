import { AuthProvider } from '../types';
import { computed, useState } from '#imports';

interface Options {
  providers: AuthProvider[],
  oauthProviders: string[],
}
export function createAuthConfig(options: Options) {
  const providers = useState<Options['providers']>('authProviders', () => ([]));

  providers.value = options.providers;

  const oauthProviders = computed(() => providers.value.filter(({ providerName }) => options.oauthProviders.includes(providerName)));

  function findProvider(neededProviderName: string, providersArr: AuthProvider[]) {
    const provider = providersArr.find(({ providerName }) => providerName === neededProviderName);

    if (!provider) {
      throw new Error(`Unknown auth provider: ${neededProviderName}`);
    }

    return provider;
  }

  function getProvider(neededProviderName: string): AuthProvider {
    return findProvider(neededProviderName, providers.value);
  }

  function getOauthProvider(neededProviderName: string): AuthProvider {
    return findProvider(neededProviderName, oauthProviders.value);
  }

  return {
    oauthProviders,
    getProvider,
    getOauthProvider,
  };
}
