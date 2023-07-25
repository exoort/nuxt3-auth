import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addImports,
  addTemplate, addComponent
} from '@nuxt/kit'
import { fileURLToPath } from 'url'
import { defu } from "defu";


// Module options TypeScript interface definition
export interface ModuleOptions {}


export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt3-auth',
    configKey: 'nuxt3Auth',
    compatibility: {
      nuxt: '^3.0.0',
      bridge: true,
    }
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup (options, nuxt) {
    // @ts-ignore
    const { resolve } = createResolver(import.meta.url);

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolve(runtimeDir, 'plugin'));

    // 5. Create virtual imports for server-side
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {};

      // Inline module runtime in Nitro bundle
      // @ts-ignore
      nitroConfig.externals = defu(typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {}, {
        inline: [
          // Inline module runtime in Nitro bundle
          resolve('./runtime')
        ]
      })

      nitroConfig.alias['#auth/server'] = resolve(runtimeDir, 'server');
    });

    const runtimeServerDirPath = `import('${resolve(runtimeDir, "server/index")}')`;

    addTemplate({
      filename: 'types/auth.d.ts',
      getContents: () => [
        'declare module "#auth/server" {',
        `  const JWT: typeof ${runtimeServerDirPath}.JWT`,
        `  const defineProvider: typeof ${runtimeServerDirPath}.defineProvider`,
        `  const AuthCookieHandlers: typeof ${runtimeServerDirPath}.AuthCookieHandlers`,
        `  type IJwt = typeof ${runtimeServerDirPath}.IJwt`,
        `  type ISignInConfigure = typeof ${runtimeServerDirPath}.ISignInConfigure`,
        `  type ISignInProviderSetup = typeof ${runtimeServerDirPath}.ISignInProviderSetup`,
        `  type ISignInProvider = typeof ${runtimeServerDirPath}.ISignInProvider`,
        `  const signOutRouteHandler: typeof ${runtimeServerDirPath}.signOutRouteHandler`,
        `  const signInRouteHandler: typeof ${runtimeServerDirPath}.signInRouteHandler`,
        `  const sessionRouteHandler:typeof ${runtimeServerDirPath}.sessionRouteHandler`,
        `  const CredentialsProvider: typeof ${runtimeServerDirPath}.CredentialsProvider`,
        `  const FacebookOauthProvider: typeof ${runtimeServerDirPath}.FacebookOauthProvider`,
        `  const GoogleOauthProvider: typeof ${runtimeServerDirPath}.GoogleOauthProvider`,
        '}'
      ].join('\n')
    });

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: resolve(nuxt.options.buildDir, 'types/auth.d.ts') })
    });


    const clientLib = resolve(runtimeDir, 'client/index');
    // Add imports
    const imports = [
      {
        name: "CredentialsProvider",
        path: clientLib,
      },
      {
        name: "FacebookOauthProvider",
        path: clientLib,
      },
      {
        name: "FacebookOauthProviderError",
        path: clientLib,
      },
      {
        name: "GoogleOauthProvider",
        path: clientLib,
      },
      {
        name: "GoogleOauthProviderError",
        path: clientLib,
      },
      {
        name: "createSessionMiddleware",
        as: "createAuthSessionMiddleware",
        path: clientLib,
      },
      {
        name: "AuthProvider",
        as: "AuthProvider",
        path: clientLib,
      },
      {
        name: "AuthProviderConfig",
        as: "AuthProviderConfig",
        path: clientLib,
      },
    ];
    for (const toImport of imports) {
      addImports({ name: toImport.name, as: toImport.name, from: toImport.path });
    }

    addComponent({
      name: 'OauthCallback',
      filePath: resolve(runtimeDir, 'client/components/OauthCallback.vue'),
    });
  }
})
