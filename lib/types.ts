export interface SolrServer {
  id: string
  name: string
  url: string
  username?: string
  password?: string
  status: 'online' | 'offline' | 'error'
  lastChecked: string
}

export interface SolrServerStore {
  servers: SolrServer[]
  activeServerId: string | null
  addServer: (server: Omit<SolrServer, 'id' | 'status' | 'lastChecked'>) => void
  removeServer: (id: string) => void
  updateServer: (id: string, server: Partial<SolrServer>) => void
  setActiveServer: (id: string | null) => void
}

export interface AIServiceConfig {
  enabled: boolean
  provider: 'openrouter' | 'ollama'
  apiKey?: string
  baseUrl?: string
  model?: string
}

export interface AIStore {
  config: AIServiceConfig
  updateConfig: (config: Partial<AIServiceConfig>) => void
}

export interface SchemaGenerationPrompt {
  description: string
  requirements?: string[]
  examples?: string[]
}

export interface AIResponse {
  text: string
  error?: string
}

export interface SolrSchema {
  name: string
  version: number
  uniqueKeyField: string
  fields: Field[]
  dynamicFields: DynamicField[]
  copyFields: CopyField[]
}

export interface Field {
  name: string
  type: string
  required?: boolean
  indexed?: boolean
  stored?: boolean
  multiValued?: boolean
  docValues?: boolean
}

export interface DynamicField {
  pattern: string
  type: string
  indexed?: boolean
  stored?: boolean
  multiValued?: boolean
  docValues?: boolean
}

export interface CopyField {
  source: string
  dest: string
  maxChars?: number
}

export interface SolrCollection {
  name: string
  schema: SolrSchema
  numDocs: number
  maxDoc: number
  deletedDocs: number
  indexSize: string
  lastModified: string
}