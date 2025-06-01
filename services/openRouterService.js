import { saveChat, updateChat } from './DBService.js';

export async function createChatTitle(message) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        "model": "openai/gpt-3.5-turbo",
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful assistant. Generate a short, concise title (max 5 words) for this chat based on the user's message. Return only the title content text in string format, no prefix like Title, nothing else."
          },
          {
            "role": "user",
            "content": message
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const title = data.choices[0].message.content
      .trim()
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\\"/g, '"') // Replace escaped quotes
      .replace(/\\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' '); // Replace multiple spaces with single space

    return title;
  } catch (error) {
    console.error('Error creating chat title:', error);
    return 'New Chat'; // Default title if there's an error
  }
}

export function streamOpenRouter(messages, apiKey, res, chatId) {
  const userId = res.user.email;
  
  fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      "model": "openai/gpt-3.5-turbo",
      "messages": messages,
      "stream": true
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, response.statusText, errorText);
        res.status(response.status).json({
          error: 'OpenRouter API error',
          status: response.status,
          statusText: response.statusText,
          details: errorText
        });
        return;
      }
      if (!response.body) {
        res.status(500).json({ error: 'No response body from OpenRouter' });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        let assistantResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            if(chatId && assistantResponse) {
              const updatedMessages = [
                ...messages,
                {
                  role: 'assistant',
                  content: assistantResponse
                }
              ];
              
              await updateChat(chatId, userId, updatedMessages);
            }
            break;
          }
          const chunk = decoder.decode(value);          
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                if (data.trim()) {  // Only try to parse non-empty data
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    const content = parsed.choices[0].delta.content;
                    assistantResponse += content;
                  }
                }
              } catch (e) {
                console.error('Error parsing chunk:', e, 'Raw data:', data);
                // Continue processing other chunks even if one fails
                continue;
              }
            }
          }
          res.write(chunk);
        }
        res.end();
      } catch (error) {
        console.error('Stream processing error:', error);
        res.status(500).json({ error: 'Stream processing failed', details: error.message });
      }
    })
    .catch((err) => {
      console.error('OpenRouter connection error:', err);
      res.status(500).json({ error: 'Failed to connect to OpenRouter', details: err.message });
    });
}
