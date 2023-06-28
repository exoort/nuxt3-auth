import { useHttp } from '../utils/http/useHttp';
import { useRequestEvent } from '#imports';

export function useAuthAPI() {
  function getSession() {
    return useHttp(useRequestEvent(), '/bff/auth/session', {}).request();
  }

  function signIn(provider: string, credentials: Record<string, any>) {
    return useHttp(useRequestEvent(), `/bff/auth/signIn/${provider}`, {
      body: credentials,
      method: 'POST',
    }).request();
  }

  function signOut() {
    return useHttp(useRequestEvent(), '/bff/auth/signOut', {
      method: 'POST',
    }).request();
  }

  return {
    getSession, signIn, signOut,
  };
}
