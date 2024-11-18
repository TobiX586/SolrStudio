import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { SolrServer, SolrServerStore } from '@/lib/types'

export const useServersStore = create<SolrServerStore>()(
  persist(
    (set) => ({
      servers: [],
      activeServerId: null,
      addServer: (server) => set((state) => ({
        servers: [...state.servers, {
          ...server,
          id: uuidv4(),
          status: 'offline',
          lastChecked: new Date().toISOString(),
        }],
      })),
      removeServer: (id) => set((state) => ({
        servers: state.servers.filter((s) => s.id !== id),
        activeServerId: state.activeServerId === id ? null : state.activeServerId,
      })),
      updateServer: (id, updates) => set((state) => ({
        servers: state.servers.map((server) =>
          server.id === id ? { ...server, ...updates } : server
        ),
      })),
      setActiveServer: (id) => set({ activeServerId: id }),
    }),
    {
      name: 'solr-servers',
    }
  )
)