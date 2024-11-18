"use client"

import { useState, useEffect } from "react"
import { useServersStore } from "@/lib/stores/servers"
import { SolrCollection } from "@/lib/types"
import axios from "axios"

export function useCollections() {
  const [collections, setCollections] = useState<SolrCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  useEffect(() => {
    async function fetchCollections() {
      if (!activeServer) {
        setError("No server selected")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Get list of collections
        const response = await axios.get('/api/solr/collections', {
          headers: {
            'X-Solr-Url': activeServer.url,
            'X-Solr-Username': activeServer.username || '',
            'X-Solr-Password': activeServer.password || '',
          },
        })

        const collectionNames = response.data.collections || []

        // Fetch details for each collection
        const collectionsData = await Promise.all(
          collectionNames.map(async (name: string) => {
            try {
              const [schemaResponse, statusResponse] = await Promise.all([
                axios.get(`/api/solr/schema/${name}`, {
                  headers: {
                    'X-Solr-Url': activeServer.url,
                    'X-Solr-Username': activeServer.username || '',
                    'X-Solr-Password': activeServer.password || '',
                  },
                }),
                axios.get(`/api/solr/collections/${name}/status`, {
                  headers: {
                    'X-Solr-Url': activeServer.url,
                    'X-Solr-Username': activeServer.username || '',
                    'X-Solr-Password': activeServer.password || '',
                  },
                }),
              ])

              return {
                name,
                schema: schemaResponse.data.schema,
                ...statusResponse.data,
              }
            } catch (err) {
              console.error(`Error fetching details for collection ${name}:`, err)
              return {
                name,
                schema: { name, version: 1.0, uniqueKeyField: 'id', fields: [], dynamicFields: [], copyFields: [] },
                numDocs: 0,
                maxDoc: 0,
                deletedDocs: 0,
                indexSize: '0 bytes',
                lastModified: new Date().toISOString(),
              }
            }
          })
        )

        setCollections(collectionsData)
      } catch (err) {
        console.error('Error fetching collections:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to fetch collections'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [activeServer])

  return { collections, loading, error }
}