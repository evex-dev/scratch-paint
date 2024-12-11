import { Hono } from 'hono'
import { html } from 'hono/html'
import type { WSContext } from 'hono/ws'
import { createBunWebSocket } from 'hono/bun'
import * as fs from 'node:fs/promises'
import * as url from 'node:url'
import * as esbuild from 'esbuild'

const app = new Hono()
const { websocket, upgradeWebSocket } = createBunWebSocket()

app.get('/', c => c.html(html`
  <html>
    <head>
      <title>Scratch-Paint by Evex playground</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/scratch-paint.css">
      <script>
        {
          const ws = new WebSocket('/ws')
          ws.onmessage = () => {
            location.reload()
          }
        }
      </script>
      <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
      <script>eruda.init();</script>
      <script type="module" src="/main.js"></script>
    </head>
    <body>
      <h1>hello world</h1>
    </body>
  </html>
`))

app.get('/main.js', async (c) => {
  const built = await esbuild.build({
    entryPoints: ['./playground/playground.jsx'],
    target: 'esnext',
    platform: 'browser',
    format: 'esm',
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    plugins: [
      {
        name: 'resolve',
        setup(build) {
          build.onResolve({ filter: /^scratch-paint/ }, (args) => {
            return {
              path: url.fileURLToPath(import.meta.resolve('../dist/index.js')),
            }
          })
        }
      }
    ],
    sourcemap: 'inline',
    write: false,
    bundle: true
  })
  /*if (!built.success) {
    throw built.logs[0]
  }*/
  c.header('Content-Type', 'text/javascript')
  return c.body(await built.outputFiles?.[0].text ?? '')
})
app.get('/scratch-paint.js', async c => {
  c.header('Content-Type', 'text/javascript')
  return c.body(await Bun.file('dist/index.js').text())
})
app.get('/scratch-paint.css', async c => {
  c.header('Content-Type', 'text/css')
  return c.body(await Bun.file('dist/index.css').text())
})

const wscontexts = new Set<WSContext>()
app.get('/ws', upgradeWebSocket(c => ({
  onOpen(_evt, ws) {
    wscontexts.add(ws)
  },
  onClose(_evt, ws) {
    wscontexts.delete(ws)
  }
})))

;(async () => {
  for await (const _event of fs.watch('src', { recursive: true })) {
    for (const ws of wscontexts) {
      ws.send('reload')
    }
  }
})()

const server = Bun.serve({
  fetch: app.fetch,
  port: 8601,
  websocket
})
console.log(`Listening on http://localhost:${server.port}`)
