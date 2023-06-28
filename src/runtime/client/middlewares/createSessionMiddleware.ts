import { defineNuxtRouteMiddleware } from '#imports';
import { useAuth } from '../composables/useAuth';
import { RouteLocationNormalized } from 'vue-router';

export const createSessionMiddleware = (options?: {
  onSessionRefreshed?: (session: any, to: RouteLocationNormalized, from: RouteLocationNormalized) => Promise<void>;
  onError?: (error: Error) => void;
}) => defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();

  try {
    if (
      process.server
        || (process.client && from.fullPath !== to.fullPath)
    ) {
      await auth.refreshSession();
      if (options?.onSessionRefreshed) {
        await options.onSessionRefreshed(auth.session.value, to, from);
      }
    }
  } catch (error: any) {
    if (options?.onError) {
      options.onError(error);
    }
  }
});
