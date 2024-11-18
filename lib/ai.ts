import { AIServiceConfig, SchemaGenerationPrompt, AIResponse } from './types'
import axios from 'axios'

export async function generateSchema(
  prompt: SchemaGenerationPrompt,
  config: AIServiceConfig
): Promise<AIResponse> {
  try {
    if (!config.enabled) {
      return { error: 'AI features are not enabled. Please enable them in settings.' }
    }

    const systemPrompt = `You are an expert in Apache Solr schema design. Your task is to generate a Solr schema based on the requirements provided.
    CRITICAL INSTRUCTIONS:
    1. You MUST return ONLY a valid JSON object with NO additional text, comments, or explanations
    2. The response MUST be parseable by JSON.parse()
    3. Do NOT include any markdown formatting or code blocks
    4. The response must start with { and end with }
    5. ALWAYS include both 'id' and '_root_' fields with the SAME fieldType for parent-child relationships
    6. The '_root_' field MUST use the same fieldType as the uniqueKey field (usually string)
    
    Required JSON structure:
    {
      "fields": [
        { 
          "name": "id", 
          "type": "string", 
          "required": true, 
          "indexed": true, 
          "stored": true,
          "multiValued": false
        },
        {
          "name": "_root_",
          "type": "string",
          "required": false,
          "indexed": true,
          "stored": true,
          "multiValued": false
        }
      ],
      "dynamicFields": [
        { "pattern": string, "type": string, "indexed": boolean, "stored": boolean, "multiValued": boolean }
      ],
      "copyFields": [
        { "source": string, "dest": string, "maxChars": number (optional) }
      ]
    }`

    const userPrompt = `
    Description: ${prompt.description}
    ${prompt.requirements?.length ? `Requirements:\n${prompt.requirements.join('\n')}` : ''}
    ${prompt.examples?.length ? `Example Documents:\n${prompt.examples.join('\n')}` : ''}`

    const response = await axios.post('/api/ai/generate', {
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      config,
    })

    try {
      const cleanText = response.data.text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()

      const schema = JSON.parse(cleanText)
      
      if (!schema.fields || !Array.isArray(schema.fields)) {
        throw new Error('Invalid schema structure')
      }

      const idField = schema.fields.find(f => f.name === 'id')
      const rootField = schema.fields.find(f => f.name === '_root_')

      if (!idField) {
        schema.fields.unshift({
          name: 'id',
          type: 'string',
          required: true,
          indexed: true,
          stored: true,
          multiValued: false
        })
      }

      if (!rootField) {
        schema.fields.push({
          name: '_root_',
          type: 'string',
          required: false,
          indexed: true,
          stored: true,
          multiValued: false
        })
      }

      const rootFieldIndex = schema.fields.findIndex(f => f.name === '_root_')
      if (rootFieldIndex !== -1) {
        schema.fields[rootFieldIndex].type = schema.fields.find(f => f.name === 'id')?.type || 'string'
      }

      return { text: JSON.stringify(schema, null, 2) }
    } catch (parseError) {
      return { error: 'Generated schema is not valid JSON. Please try again.' }
    }
  } catch (error) {
    console.error('Schema generation error:', error)
    return {
      error: axios.isAxiosError(error)
        ? error.response?.data?.error || 'Failed to generate schema'
        : 'An unexpected error occurred'
    }
  }
}

export async function getSchemaExamples(config: AIServiceConfig): Promise<string[]> {
  try {
    if (!config.enabled) {
      return []
    }

    const systemPrompt = `Generate 5 example prompts for Apache Solr schema design.
    CRITICAL INSTRUCTIONS:
    1. You MUST return ONLY a valid JSON array of strings
    2. The response MUST be parseable by JSON.parse()
    3. Do NOT include any markdown formatting or code blocks
    4. The response must start with [ and end with ]
    5. Do NOT generate actual schemas - only provide the requirements/descriptions
    6. Each string should describe a use case and requirements, NOT the schema itself

    Example format: "Design a schema for an e-commerce product catalog with support for variants, categories, and faceted search. Include fields for SKUs, prices, inventory levels, and product attributes."`

    const response = await axios.post('/api/ai/generate', {
      prompt: systemPrompt,
      config,
    })

    // Parse the response to ensure it's a valid JSON array
    try {
      // Remove any potential markdown formatting or code blocks
      const cleanText = response.data.text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()

      const examples = JSON.parse(cleanText)
      if (!Array.isArray(examples)) {
        throw new Error('Invalid examples format')
      }
      return examples.slice(0, 10)
    } catch (parseError) {
      console.error('Error parsing examples:', parseError)
      return []
    }
  } catch (error) {
    console.error('Error getting schema examples:', error)
    return []
  }
}

export async function optimizeQuery(
  query: string,
  fields: string[] | undefined,
  config: AIServiceConfig
): Promise<AIResponse> {
  try {
    if (!config.enabled) {
      return { error: 'AI features are not enabled. Please enable them in settings.' }
    }

    const systemPrompt = `You are an expert in Apache Solr query optimization. Your task is to suggest optimized queries based on the input query and available fields.
    CRITICAL INSTRUCTIONS:
    1. You MUST return ONLY a valid JSON object with NO additional text or comments
    2. The response MUST be parseable by JSON.parse()
    3. Do NOT include any markdown formatting or code blocks
    4. The response must start with { and end with }
    5. Each suggestion must include a valid Solr query syntax
    
    Required JSON structure:
    {
      "suggestions": [
        {
          "query": string,
          "explanation": string,
          "performance": {
            "estimated": string,
            "improvement": string
          }
        }
      ]
    }`

    const userPrompt = `
    Original Query: ${query}
    Available Fields: ${fields ? fields.join(', ') : 'all fields'}
    
    Please provide optimized query suggestions that:
    1. Improve search relevance
    2. Enhance performance
    3. Use appropriate field boosting
    4. Consider fuzzy matching where appropriate
    5. Implement proper escaping and syntax`

    const response = await axios.post('/api/ai/generate', {
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      config,
    })

    try {
      const cleanText = response.data.text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()

      const result = JSON.parse(cleanText)
      
      if (!result.suggestions || !Array.isArray(result.suggestions)) {
        throw new Error('Invalid response structure')
      }

      return { text: JSON.stringify(result, null, 2) }
    } catch (parseError) {
      return { error: 'Generated response is not valid JSON. Please try again.' }
    }
  } catch (error) {
    console.error('Query optimization error:', error)
    return {
      error: axios.isAxiosError(error)
        ? error.response?.data?.error || 'Failed to optimize query'
        : 'An unexpected error occurred'
    }
  }
}