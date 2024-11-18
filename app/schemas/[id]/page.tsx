"use client"

import { useEffect, useState } from "react"
import SchemaDetail from "@/components/schema-detail"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useServersStore } from "@/lib/stores/servers"
import { SolrSchema } from "@/lib/types"
import { AlertCircle, Loader2 } from "lucide-react"
import axios from "axios"

export default function SchemaDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [mounted, setMounted] = useState(false)
  const [schema, setSchema] = useState<SolrSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchSchema() {
      if (!activeServer) {
        setError("No server selected")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await axios.get(`/api/solr/schema/${params.id}`, {
          headers: {
            'X-Solr-Url': activeServer.url,
            'X-Solr-Username': activeServer.username || '',
            'X-Solr-Password': activeServer.password || '',
          },
        })

        setSchema(response.data.schema)
      } catch (err) {
        console.error('Error fetching schema:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to fetch schema details'
        )
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      fetchSchema()
    }
  }, [activeServer, params.id, mounted])

  if (!mounted) {
    return null
  }

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

  if (!schema) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Schema not found.</AlertDescription>
      </Alert>
    )
  }

  return <SchemaDetail schema={schema} />
}