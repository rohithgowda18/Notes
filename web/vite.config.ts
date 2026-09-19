import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

// Local workspace reader plugin for offline/private dev fallback
function localNotesPlugin() {
  const rootDir = path.resolve(import.meta.dirname, '..')

  return {
    name: 'local-notes-plugin',
    configureServer(server: any) {
      // 1. Endpoint to get directory tree
      server.middlewares.use('/api/local-tree', (_req: any, res: any) => {
        try {
          const files: any[] = []

          function scanDir(dir: string, relPath = '') {
            const entries = fs.readdirSync(dir, { withFileTypes: true })
            for (const entry of entries) {
              if (
                entry.name.startsWith('.') ||
                entry.name === 'node_modules' ||
                entry.name === 'web' ||
                entry.name === 'images'
              ) {
                continue
              }

              const fullPath = path.join(dir, entry.name)
              const itemRelPath = (relPath ? `${relPath}/${entry.name}` : entry.name).replace(/\\/g, '/')

              if (entry.isDirectory()) {
                scanDir(fullPath, itemRelPath)
              } else if (entry.isFile()) {
                const lower = entry.name.toLowerCase()
                if (lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.pdf')) {
                  files.push({
                    path: itemRelPath,
                    name: entry.name,
                    type: lower.endsWith('.pdf') ? 'pdf' : 'markdown',
                    size: fs.statSync(fullPath).size,
                  })
                }
              }
            }
          }

          scanDir(rootDir)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ files }))
        } catch (err: any) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })

      // 2. Endpoint to get raw file content
      server.middlewares.use('/api/local-file', (req: any, res: any) => {
        try {
          const url = new URL(req.url, 'http://localhost')
          const filePath = url.searchParams.get('path')
          if (!filePath) {
            res.statusCode = 400
            res.end('Path query parameter required')
            return
          }

          const safePath = path.resolve(rootDir, filePath)
          if (!safePath.startsWith(rootDir) || !fs.existsSync(safePath)) {
            res.statusCode = 404
            res.end('File not found')
            return
          }

          const content = fs.readFileSync(safePath)
          const lower = filePath.toLowerCase()
          if (lower.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf')
          } else if (lower.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png')
          } else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg')
          } else if (lower.endsWith('.gif')) {
            res.setHeader('Content-Type', 'image/gif')
          } else if (lower.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml')
          } else if (lower.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp')
          } else {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          }
          res.end(content)
        } catch (err: any) {
          res.statusCode = 500
          res.end(err.message)
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    localNotesPlugin(),
  ],
})
