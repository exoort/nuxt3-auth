import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addComponent,
  addImports,
  addImportsDir,
  addTemplate
} from '@nuxt/kit'
import { fileURLToPath } from 'url'
import defu from "defu";
import { genInterface } from 'knitwork'


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
      nitroConfig.alias = nitroConfig.alias || {}

      // Inline module runtime in Nitro bundle
      nitroConfig.externals = defu(typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {}, {
        inline: [resolve('./runtime')]
      })
      nitroConfig.alias['#auth/client'] = resolve('./runtime/client')
      nitroConfig.alias['#auth/server'] = resolve('./runtime/server')
    });

    addTemplate({
      filename: 'types/auth.d.ts',
      getContents: () => [
        'declare module \'#auth/client\' {',
        `  const getServerSession: typeof import('${resolve('./runtime/server/services')}').getServerSession`,
        `  const getToken: typeof import('${resolve('./runtime/server/services')}').getToken`,
        `  const NuxtAuthHandler: typeof import('${resolve('./runtime/server/services')}').NuxtAuthHandler`,
        '}'
      ].join('\n')
    })

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: resolve(nuxt.options.buildDir, 'types/auth.d.ts') })
    });

    // Add imports
    // const imports = [
    //   {
    //     name: "forClient",
    //     path: resolver.resolve(runtimeDir, 'client/index')
    //   },
    //
    //   {
    //     name: "forServer",
    //     path: resolver.resolve(runtimeDir, 'server/index')
    //   },
    // ];
    // for (const toImport of imports) {
    //   addImports({ name: toImport.name, as: toImport.name, from: toImport.path });
    // }
  }
})
