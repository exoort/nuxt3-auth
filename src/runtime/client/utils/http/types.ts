import type { UseFetchOptions } from '#app';
import type { FetchOptions } from 'ofetch';
import { H3Event } from 'h3';

export type PatchedUseFetchOptions<T> = (UseFetchOptions<T> | FetchOptions) & {
  event?: H3Event,
};
