import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom local middleware plugin to proxy /api/chat directly to Groq in dev
const localChatApiPlugin = (env) => ({
  name: 'local-chat-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''
        req.on('data', chunk => {
          body += chunk
        })
        req.on('end', async () => {
          try {
            const { message, context, history } = JSON.parse(body || '{}')

            if (!message) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Missing message field' }))
              return
            }

            const apiKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY
            if (!apiKey) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'GROQ_API_KEY environment variable is not configured. Please add it to your .env.local file.' }))
              return
            }

            const messages = [
              {
                role: 'system',
                content: "You are Tree Doctor, a helpful assistant inside a community tree-tracking app. Users describe symptoms they observe in trees, such as leaf color changes, bark damage, unusual growth, or pest signs. Ask at most one clarifying question if needed, then give brief, practical guidance in plain language. Clearly state whether the issue sounds urgent enough that the user should mark the tree as 'sick' in the app. Keep responses under 100 words. Do not use markdown formatting, since this will render in a plain chat bubble."
              }
            ]

            if (context) {
              messages.push({
                role: 'system',
                content: `Context: The user is asking about a tree of species: ${context.species || 'Unknown'} currently reported with status: ${context.status || 'healthy'}.`
              })
            }

            if (history && Array.isArray(history)) {
              messages.push(...history)
            }

            messages.push({ role: 'user', content: message })

            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages
              })
            })

            if (!groqResponse.ok) {
              const errText = await groqResponse.text()
              console.error("Groq API error response:", errText)
              res.statusCode = groqResponse.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Tree Doctor is a bit busy — try again in a moment.' }))
              return
            }

            const groqData = await groqResponse.json()
            const reply = groqData.choices?.[0]?.message?.content || ''

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ reply }))
          } catch (e) {
            console.error("Local chat API error:", e)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Internal Server Error' }))
          }
        })
      } else {
        next()
      }
    })
  }
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss(), localChatApiPlugin(env)],
    server: {
      proxy: {
        '/api/plantnet': {
          target: 'https://my-api.plantnet.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/plantnet/, ''),
          headers: {
            'Origin': 'https://my-api.plantnet.org',
            'Referer': 'https://my-api.plantnet.org'
          }
        }
      }
    }
  }
})
