"use client"

import { useEffect, useState } from "react"
import { CollectionDetail } from "@/components/collections/collection-detail"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useServersStore } from "@/lib/stores/servers"
import { SolrCollection } from "@/lib/types"
import { AlertCircle, Loader2 } from "lucide-react"
import axios from "axios"

export default function CollectionDetailPage({
  params,
}: {
  params: { name: string }
}) {
  const [collection, setCollection] = useState<SolrCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  useEffect(() => {
    async function fetchCollection() {
      if (!activeServer) {
        setError("No server selected")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const [schemaResponse, statusResponse] = await Promise.all([
          axios.get(`/api/solr/schema/${params.name}`, {
            headers: {
              'X-Solr-Url': activeServer.url,
              'X-Solr-Username': activeServer.username || '',
              'X-Solr-Password': activeServer.password || '',
            },
          }),
          axios.get(`/api/solr/collections/${params.name}/status`, {
            headers: {
              'X-Solr-Url': activeServer.url,
              'X-Solr-Username': activeServer.username || '',
              'X-Solr-Password': activeServer.password || '',
            },
          }),
        ])

        setCollection({
          name: params.name,
          schema: schemaResponse.data.schema,
          ...statusResponse.data,
        })
      } catch (err) {
        console.error('Error fetching collection:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to fetch collection details'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCollection()
  }, [activeServer, params.name])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!collection) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Collection not found.</AlertDescription>
      </Alert>
    )
  }

  return <CollectionDetail collection={collection} />
}