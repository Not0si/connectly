import { deleteSync } from 'del'
import fs from 'fs'
import { glob } from 'glob'
import path from 'path'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

function getDirectories(srcPath: string) {
  return fs
    .readdirSync(srcPath)
    .map((file) => path.join(srcPath, file))
    .filter((file) => fs.statSync(file).isDirectory())
}

const directoriesInsidePublic = getDirectories(
  path.resolve(__dirname, 'public'),
)

export default defineConfig((env) => {
  return {
    define:
      env.command === 'serve' ?
        {}
      : {
          'import.meta.env.VITE_API_URL': JSON.stringify(''),
        },
    root: path.resolve(__dirname),
    server: {
      open: '/templates/',
      port: 3000,
    },
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, './src/app'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@enums': path.resolve(__dirname, './src/enums'),
        '@interfaces': path.resolve(__dirname, './src/interfaces'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@services': path.resolve(__dirname, './src/services'),
        '@components': path.resolve(__dirname, './src/components'),
      },
    },
    build: {
      outDir: path.resolve(__dirname, '../src/main/resources'),
      emptyOutDir: false,
      copyPublicDir: false,
      assetsDir: 'static',
      rollupOptions: {
        input: glob.sync(path.resolve(__dirname, 'templates', '*.html')),
        output: {
          format: 'esm',
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.names?.[0]?.split('.').pop()
            if (extType === 'css') {
              return 'static/css/[name]-[hash][extname]' // CSS files
            }

            return 'static/assets/[name]-[hash][extname]' // Other assets (images, fonts, etc.)
          },
          chunkFileNames: 'static/js/[name]-[hash].js', // JavaScript chunks
          entryFileNames: 'static/js/[name]-[hash].js', // JavaScript entry
        },

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
            generateBundle(_options, bundle) {
              for (const fileName in bundle) {
                if (fileName.endsWith('.html')) {
                  const htmlFile = bundle[fileName]
                  if (htmlFile.type === 'asset') {
                    htmlFile.source = htmlFile.source
                      .toString()
                      .replace(/src="\/static\/js/g, 'src="/js')
                      .replace(/href="\/static\/js/g, 'href="/js')
                      .replace(/href="\/static\/css/g, 'href="/css')
                  }
                }
              }
            },
          },
        ],

        //----------------------------------
      },
    },
    publicDir: 'public',
    plugins: [
      viteStaticCopy({
        targets: directoriesInsidePublic.map((dir) => ({
          src: dir,
          dest: path.resolve(__dirname, '../src/main/resources/static'),
        })),
      }),
    ],
  }
})
