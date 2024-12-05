import { deleteSync } from 'del'
import { glob } from 'glob'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  server: {
    open: '/templates/',
    port: 3000,
    proxy: { '/js': '/static/js' },
  },
  resolve: {
    alias: {
      '@styles': path.resolve(__dirname, './src/styles'),
      '@app': path.resolve(__dirname, './src/app'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  build: {
    outDir: './../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: glob.sync(path.resolve(__dirname, 'src/templates', '*.html')),
      output: [
        {
          format: 'esm',
          dir: 'dist',
          assetFileNames: (assetInfo) => {
            if (assetInfo.names?.[0]?.endsWith('.css')) {
              return 'static/css/[name].[hash][extname]'
            }

            if (assetInfo.names?.[0]?.endsWith('.js')) {
              return 'static/js/[name].[hash][extname]'
            }

            return 'static/assets/[name].[hash][extname]'
          },
          chunkFileNames: 'static/js/[name].[hash].js',
          entryFileNames: 'static/js/[name].[hash].js',
        },
        {
          format: 'esm',
          dir: 'dist/../../src/main/resources',
          assetFileNames: (assetInfo) => {
            if (assetInfo.names?.[0]?.endsWith('.css')) {
              return 'static/css/[name].[hash][extname]'
            }

            if (assetInfo.names?.[0]?.endsWith('.js')) {
              return 'static/js/[name].[hash][extname]'
            }

            return 'static/assets/[name].[hash][extname]'
          },
          chunkFileNames: 'static/js/[name].[hash].js',
          entryFileNames: 'static/js/[name].[hash].js',
        },
      ],
      plugins: [
        {
          name: 'clear-specific-folder',
          buildStart() {
            deleteSync(
              [
                'dist/assets',
                'dist/static',
                'dist/templates',
                'dist/../../src/main/resources/assets',
                'dist/../../src/main/resources/static',
                'dist/../../src/main/resources/templates',
              ],
              { force: true },
            )
          },
        },
        {
          name: 'modify-html-plugin',
          generateBundle(options, bundle) {
            // console.log({ options })
            if (options.dir === 'dist/../../src/main/resources') {
              for (const fileName in bundle) {
                if (fileName.endsWith('.html')) {
                  const htmlFile = bundle[fileName]
                  if (htmlFile.type === 'asset') {
                    htmlFile.source = htmlFile.source
                      .toString()
                      .replace('src="/static/js', 'src="/js')
                      .replace('href="/static/js', 'href="/js')
                      .replace('href="/static/css', 'href="/css')
                  }
                }
              }
            }
          },
        },
      ],

      //----------------------------------
    },
  },
})
