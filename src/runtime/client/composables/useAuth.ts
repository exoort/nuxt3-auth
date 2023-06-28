import { computed, useState } from '#imports';
import { AuthProvider } from '../types';
import { useAuthAPI } from '../api/useAuthAPI';

export function useAuth() {
  const api = useAuthAPI();

  // TODO: get type for session from server
  const sessionState = useState<any | null>('__authSessionState__');

  async function refreshSession() {
    sessionState.value = await api.getSession();
  }

  const session = computed(() => (sessionState.value?.accessToken ? sessionState.value : null));

  async function signIn(provider: AuthProvider, args?: any) {
    const result = await provider.signIn(args);

    await refreshSession();

    return result;
  }

  async function signOut() {
    const result = await api.signOut();

    await refreshSession();

    return result;
  }

  return {
    signIn,
    session,
    refreshSession,
    signOut,
  };
}
