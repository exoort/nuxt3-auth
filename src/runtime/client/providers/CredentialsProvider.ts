import { useAuthAPI } from '../api/useAuthAPI';
import { createClientProvider } from '../utils/createClientProvider';

const PROVIDER_NAME = 'credentials';


export const CredentialsProvider = createClientProvider({
  providerName: PROVIDER_NAME,

  setup() {
    return {
      providerName: PROVIDER_NAME,

      createError: (error) => error,

      signIn(credentials) {
        return useAuthAPI().signIn(PROVIDER_NAME, credentials);
      },

      async callback() {
        throw new Error('Not implemented');
      },
    };
  },
});
