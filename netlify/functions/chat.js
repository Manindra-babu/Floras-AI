export async function handler(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    }
  }

  const { message, context: treeContext, history } = JSON.parse(event.body || '{}')

  if (!message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing message field' })
    }
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GROQ_API_KEY environment variable is not configured.' })
    }
  }

  try {
    const messages = [
      {
        role: 'system',
        content: "You are Tree Doctor, a helpful assistant inside a community tree-tracking app. Users describe symptoms they observe in trees, such as leaf color changes, bark damage, unusual growth, or pest signs. Ask at most one clarifying question if needed, then give brief, practical guidance in plain language. Clearly state whether the issue sounds urgent enough that the user should mark the tree as 'sick' in the app. Keep responses under 100 words. Do not use markdown formatting, since this will render in a plain chat bubble."
      }
    ]

    if (treeContext) {
      messages.push({
        role: 'system',
        content: `Context: The user is asking about a tree of species: ${treeContext.species || 'Unknown'} currently reported with status: ${treeContext.status || 'healthy'}.`
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
      return {
        statusCode: groqResponse.status,
        body: JSON.stringify({ error: 'Tree Doctor is a bit busy — try again in a moment.' })
      }
    }

    const groqData = await groqResponse.json()
    const reply = groqData.choices?.[0]?.message?.content || ''

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    }
  } catch (e) {
    console.error("Netlify Chat API error:", e)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    }
  }
}
