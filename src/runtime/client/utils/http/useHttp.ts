import type { H3Event } from 'h3';
import type { PatchedUseFetchOptions } from './types';
import {useHttpConfiguration} from "./useHttpConfig";

export function useHttp<DataT>(
  event: H3Event,
  url: string,
  config: PatchedUseFetchOptions<DataT> = {},
) {
  const configurated = useHttpConfiguration({
    url,
    config,
    event,
  });

  return {
    request() {
      return $fetch<DataT>(configurated.requestURL, configurated.requestOptions as never);
    },
  };
}
