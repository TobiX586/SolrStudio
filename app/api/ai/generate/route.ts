import { NextResponse } from 'next/server'
import axios from 'axios'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1'
const DEFAULT_OLLAMA_URL = 'http://localhost:11434'

export async function POST(request: Request) {
  try {
    const { prompt, config } = await request.json()

    if (!config.enabled) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 400 }
      )
    }

    if (config.provider === 'openrouter') {
      if (!config.apiKey) {
        return NextResponse.json(
          { error: 'OpenRouter API key is required' },
          { status: 400 }
        )
      }

      const response = await axios.post(
        `${OPENROUTER_API_URL}/chat/completions`,
        {
          model: config.model || 'mistralai/mistral-7b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'HTTP-Referer': 'https://stackblitz.com',
          },
        }
      )

      return NextResponse.json({
        text: response.data.choices[0].message.content,
      })
    } else {
      // Ollama
      const baseUrl = config.baseUrl || DEFAULT_OLLAMA_URL
      
      try {
        const response = await axios.post(
          `${baseUrl}/api/generate`,
          {
            model: config.model || 'mistral',
            prompt,
            stream: false,
            options: {
              temperature: 0.7,
              num_predict: 2000,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            timeout: 60000,
          }
        )

        if (!response.data || !response.data.response) {
          throw new Error('Invalid response from Ollama')
        }

        return NextResponse.json({
          text: response.data.response,
        })
      } catch (ollamaError) {
        console.error('Ollama error:', ollamaError)
        
        if (axios.isAxiosError(ollamaError)) {
          if (ollamaError.code === 'ECONNREFUSED') {
            return NextResponse.json(
              { error: 'Could not connect to Ollama. Please ensure Ollama is running on the specified URL.' },
              { status: 503 }
            )
          }
          if (ollamaError.response?.status === 404) {
            return NextResponse.json(
              { error: 'The specified model is not available in Ollama. Please pull the model first.' },
              { status: 404 }
            )
          }
        }
        
        throw ollamaError
      }
    }
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { 
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || 'Failed to generate response'
          : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}