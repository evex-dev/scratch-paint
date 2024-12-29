import * as url from 'node:url'
import { bundleAsync } from 'lightningcss'
import * as esbuild from 'esbuild'

export const build = async () => {
  let css = ''

  const built = await esbuild.build({
    entryPoints: ['./src/index.js'],
    platform: 'browser',
    format: 'esm',
    outdir: 'dist',
    bundle: true,
    external: ['react', 'redux', 'react-dom', 'react-redux', 'react-popover', 'react-responsive', 'react-intl', 'react-intl-redux'],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    plugins: [
      {
        name: 'bun-plugin-asset-as-base64',
        setup(build) {
          build.onResolve({ filter: /\.(png|svg)$/ }, (args) => {
            return {
              path: import.meta.resolve(args.path, args.importer),
              namespace: 'asset'
            }
          })
          build.onLoad({ filter: /./, namespace: 'asset' }, async (args) => {
            const assetPath = url.fileURLToPath(args.path)
            const file = Bun.file(assetPath)
            const mimeType = file.type
            const buffer = await file.arrayBuffer()
            const base64 = Buffer.from(buffer).toString('base64')
            const dataUrl = `data:${mimeType};base64,${base64}`
            return {
              loader: 'json',
              contents: JSON.stringify(dataUrl)
            }
          })
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
            const moduleCss: Record<string, string> = {}
            for (const key in bundled.exports ?? {}) {
                const exportData = bundled.exports[key]
                moduleCss[key.replace(/-\w/g, (v) => v.slice(1).toUpperCase())] = exportData.name
            }
            return {
              contents: JSON.stringify(moduleCss, null, 2),
              loader: 'json'
            }
          })
        },
      }
    ],
    sourcemap: 'inline',
    write: false
  })
 /* if (!built.success) {
    throw built.logs[0]
  }*/
  await Bun.write('dist/index.css', css)
  await Bun.write('dist/index.js', built.outputFiles?.[0].text ?? '')
}

if (import.meta.main) {
  await build()
}
