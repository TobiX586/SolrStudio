"use client"

import { useState, useEffect } from 'react'
import { useServersStore } from '@/lib/stores/servers'
import { SolrSchema } from '@/lib/types'
import axios from 'axios'

export function useSchemas() {
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)
  const [schemas, setSchemas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSchemas() {
      if (!activeServer) {
        setLoading(false)
        setError("No server selected. Please select a server to view schemas.")
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // First, get list of collections
        const collectionsResponse = await axios.get('/api/solr/collections', {
          headers: {
            'X-Solr-Url': activeServer.url,
            'X-Solr-Username': activeServer.username || '',
            'X-Solr-Password': activeServer.password || '',
          },
        })
        
        const collections = collectionsResponse.data.collections || []
        
        // Then fetch schema for each collection
        const schemaPromises = collections.map(async (collection: string) => {
          const response = await axios.get(`/api/solr/schema/${collection}`, {
            headers: {
              'X-Solr-Url': activeServer.url,
              'X-Solr-Username': activeServer.username || '',
              'X-Solr-Password': activeServer.password || '',
            },
          })

          const { schema } = response.data
          return {
            id: collection,
            name: collection,
            description: schema.description || `Schema for ${collection} collection`,
            lastModified: new Date().toISOString(),
            uniqueKey: schema.uniqueKeyField || "id",
            fields: schema.fields || [],
            dynamicFields: schema.dynamicFields || [],
            copyFields: schema.copyFields || [],
          }
        })
        
        const loadedSchemas = await Promise.all(schemaPromises)
        setSchemas(loadedSchemas)
      } catch (err) {
        console.error('Error loading schemas:', err)
        if (err instanceof Error && err.message.includes('Authentication failed')) {
          setError("Authentication failed. Please check your credentials.")
        } else {
          setError("Failed to load schemas. Please check your Solr connection settings.")
        }
        setSchemas([])
      } finally {
        setLoading(false)
      }
    }

    loadSchemas()
  }, [activeServer])

  return { schemas, loading, error }
}