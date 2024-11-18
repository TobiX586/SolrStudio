import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AIStore, AIServiceConfig } from '@/lib/types'

const defaultConfig: AIServiceConfig = {
  enabled: false,
  provider: 'openrouter',
  apiKey: '',
  baseUrl: 'http://localhost:11434',
  model: 'mistralai/mistral-7b-instruct',
}

export const useAIStore = create<AIStore>()(
  persist(
    (set) => ({
      config: defaultConfig,
      updateConfig: (config) =>
        set((state) => ({
          config: { ...state.config, ...config },
        })),
    }),
    {
      name: 'ai-config',
      version: 1,
    }
  )
)