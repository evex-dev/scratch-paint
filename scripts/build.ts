import { build } from 'bun'
import * as url from 'node:url'
import { bundleAsync } from 'lightningcss'
import * as path from 'node:path'

let css = ''

const built = await Bun.build({
  entrypoints: ['./src/index.js'],
  target: 'browser',
  format: 'esm',
  outdir: 'dist',
  external: ['react'],
  plugins: [
    {
      name: 'bun-plugin-asset-as-base64',
      setup(build) {

      },
    },
    {
      name: 'bun-plugin-module-css',
      setup(build) {
        build.onResolve({ filter: /\.css$/ }, (args) => {
          return {
            path: import.meta.resolve(args.path, args.importer),
            namespace: 'css'
          }
        })
        build.onLoad({ filter: /./, namespace: 'css' }, async (args) => {
          const cssPath = url.fileURLToPath(args.path)
          const bundled = await bundleAsync({
            filename: cssPath,
            cssModules: true,
            resolver: {
              async read(file) {
                const code = await Bun.file(file).text()
                const replaced = code
                  .replaceAll('$form-radius', 'calc($space / 2)')
                  .replaceAll('$space', '0.5rem')
                  .replaceAll('$grid-unit', '.25rem')
                  .replaceAll('$sprited-per-row', '5')
                  .replaceAll('$menu-bar-height', '3rem')
                  .replaceAll('$sprite-info-height', '6rem')
                  .replaceAll('$stage-menu-height', '2.75rem')
                  .replaceAll('$library-header-height', '4.375rem')
                  .replaceAll('$full-size-paint', '1256px')
                  .replaceAll('$full-size', '1095px')
                  .replaceAll('$scrollbar-size', '8px')
                  .replaceAll('$scrollbar-padding', '4px')
                  .replaceAll('$arrow-border-width', '14px')

                  .replaceAll('$ui-pane-border', '#D9D9D9')
                  .replaceAll('$ui-pane-gray', '#F9F9F9')
                  .replaceAll('$ui-background-blue', '#e8edf1')
                  .replaceAll('$text-primary', '#575e75')
                  .replaceAll('$looks-secondary', '#855CD6')
                  .replaceAll('$looks-transparent', 'hsla(260, 60%, 60%, 0.35)')
                  .replaceAll('$red-primary', '#FF661A')
                  .replaceAll('$red-tertiary', '#E64D00')
                  .replaceAll('$sound-primary', '#CF63CF')
                  .replaceAll('$sound-tertiary', '#A63FA6')
                  .replaceAll('$control-primary', '#FFAB19')
                  .replaceAll('$data-primary', '#FF8C1A')
                  .replaceAll('$form-border', '#E9EEF2')

                  .replaceAll('$border-radius', '0.25rem')
                return replaced
              },
            }
          })
          css += bundled.code
          return {
            contents: JSON.stringify(bundled.exports, null, 2),
            loader: 'json'
          }
        })
      },
    }
  ]
})
if (!built.success) {
  throw built.logs[0]
}
await Bun.write('dist/index.css', css)
