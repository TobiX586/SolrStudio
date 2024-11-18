"use client"

import { useCallback, useEffect, useState, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { useServersStore } from '@/lib/stores/servers'
import { toast } from './ui/use-toast'
import { Alert, AlertDescription } from './ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import axios from 'axios'

interface DocumentRelationshipsProps {
  schemaId: string
}

// Define DocumentNode component with proper handles
const DocumentNode = ({ data }: { data: any }) => (
  <div 
    className={`min-w-[250px] p-4 shadow-lg rounded-lg ${
      data.isChild 
        ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500/50' 
        : 'bg-green-100 dark:bg-green-900/50 border-2 border-green-500/50'
    }`}
  >
    <Handle
      type="target"
      position={Position.Left}
      className="!bg-blue-500"
    />
    <Handle
      type="source"
      position={Position.Right}
      className="!bg-blue-500"
    />
    <div className="flex flex-col">
      <div className={`text-lg font-bold mb-2 ${
        data.isChild 
          ? 'text-blue-800 dark:text-blue-200' 
          : 'text-green-800 dark:text-green-200'
      }`}>
        {data.label}
      </div>
      <div className="space-y-1">
        {Object.entries(data.fields || {}).map(([key, value]) => (
          <div key={key} className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">{key}:</span>{' '}
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </div>
        ))}
      </div>
    </div>
  </div>
)

export function DocumentRelationships({ schemaId }: DocumentRelationshipsProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  // Memoize nodeTypes
  const nodeTypes = useMemo(() => ({
    document: DocumentNode
  }), [])

  // Memoize edge options
  const defaultEdgeOptions = useMemo(() => ({
    animated: true,
    style: {
      strokeWidth: 2,
      stroke: '#3b82f6',
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#3b82f6',
    },
    type: 'smoothstep',
  }), [])

  const layoutNodes = useCallback((documents: any[]) => {
    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    const parentPositions: Record<string, { x: number; y: number }> = {}
    let parentIndex = 0
    let childIndex = 0

    // First pass: Create parent nodes
    documents.forEach(doc => {
      if (!doc._root_ || doc._root_ === doc.id) {
        const x = (parentIndex % 3) * 600 + 100
        const y = Math.floor(parentIndex / 3) * 400 + 100

        parentPositions[doc.id] = { x, y }
        newNodes.push({
          id: doc.id,
          type: 'document',
          position: { x, y },
          data: {
            label: doc.title || `Document ${doc.id}`,
            fields: Object.entries(doc)
              .filter(([key]) => !key.startsWith('_') && !['id', 'title'].includes(key))
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
            isChild: false,
          },
        })
        parentIndex++
      }
    })

    // Second pass: Create child nodes and edges
    documents.forEach(doc => {
      if (doc._root_ && doc._root_ !== doc.id) {
        const parentPos = parentPositions[doc._root_]
        if (!parentPos) return

        // Position children in a grid to the right of their parent
        const childrenPerRow = 2
        const xOffset = 300
        const yOffset = 150
        const row = Math.floor(childIndex / childrenPerRow)
        const col = childIndex % childrenPerRow

        const x = parentPos.x + xOffset
        const y = parentPos.y - yOffset + (row * yOffset)

        newNodes.push({
          id: doc.id,
          type: 'document',
          position: { x, y },
          data: {
            label: doc.title || `Child Document ${doc.id}`,
            fields: Object.entries(doc)
              .filter(([key]) => !key.startsWith('_') && !['id', 'title'].includes(key))
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
            isChild: true,
          },
        })

        // Create edge from parent to child
        newEdges.push({
          id: `${doc._root_}-${doc.id}`,
          source: doc._root_,
          target: doc.id,
          type: 'smoothstep',
        })

        childIndex++
      }
    })

    return { nodes: newNodes, edges: newEdges }
  }, [])

  const fetchDocuments = useCallback(async () => {
    if (!activeServer) return

    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`/api/solr/schema/${schemaId}/data/search`, {
        params: { 
          q: '*:*',
          rows: 1000,
        },
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
        },
      })

      const { nodes, edges } = layoutNodes(response.data.docs)
      setNodes(nodes)
      setEdges(edges)
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch document relationships'
      )
    } finally {
      setLoading(false)
    }
  }, [activeServer, schemaId, setNodes, setEdges, layoutNodes])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  if (!activeServer) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select a server to view document relationships.
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[600px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
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

  if (nodes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Relationships</CardTitle>
          <CardDescription>
            No documents found with parent-child relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Try adding some documents with child documents to visualize their relationships.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Relationships</CardTitle>
        <CardDescription>
          Visualize the relationships between documents and their children. 
          Parent documents are shown in green, child documents in blue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] border rounded-md bg-slate-50 dark:bg-slate-900">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          >
            <Background color="#94a3b8" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  )
}