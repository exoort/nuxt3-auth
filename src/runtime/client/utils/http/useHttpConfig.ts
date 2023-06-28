import {
  useRequestHeaders,
} from '#imports';
import {appendResponseHeader, H3Event} from 'h3';
import { PatchedUseFetchOptions } from './types';

interface Params<T> {
  event: H3Event,
  config: PatchedUseFetchOptions<T>,
  url: string,
}
export function useHttpConfiguration<T>({ event, config, url } : Params<T>) {
  const baseURL = '';

  const requestURL = url;

  // We must get only essential headers because using all headers in the request will proceed slow request. Add headers to the request by keys if needed, DON'T include all
  const reqHeaders = useRequestHeaders(['cookie']);

  const headers = {
    ...reqHeaders,
    ...(config.headers || {}),
    accept: 'application/json',
  } as HeadersInit;

  const requestOptions: PatchedUseFetchOptions<T> = {
    ...config,
    baseURL,
    query: undefined,
    headers,
    onResponse({ response }) {
      if (process.server) {
        if (response.headers.has('set-cookie') && event) {
          const setCookie = String(response.headers.get('set-cookie'));
          const cookies = (setCookie || '').split(',');

          // eslint-disable-next-line no-restricted-syntax
          for (const cookie of cookies) {
            appendResponseHeader(event, 'set-cookie', cookie);
          }
        }
      }
    },
  };

  return {
    requestURL,
    requestOptions,
  };
}
