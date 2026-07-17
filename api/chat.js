export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { message, context, history } = req.body || {}

  if (!message) {
    return res.status(400).json({ error: 'Missing message field' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY environment variable is not configured.' })
  }

  try {
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
      return res.status(groqResponse.status).json({ error: 'Tree Doctor is a bit busy — try again in a moment.' })
    }

    const groqData = await groqResponse.json()
    const reply = groqData.choices?.[0]?.message?.content || ''

    return res.status(200).json({ reply })
  } catch (e) {
    console.error("Vercel Chat API error:", e)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
