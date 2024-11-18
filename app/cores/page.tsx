"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useServersStore } from "@/lib/stores/servers"
import { AlertCircle, Loader2, Plus, RefreshCw, Settings } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"

interface CoreStatus {
  name: string
  instanceDir: string
  dataDir: string
  config: string
  schema: string
  startTime: string
  uptime: string
  index: {
    numDocs: number
    maxDoc: number
    deletedDocs: number
    indexHeapUsageBytes: number
    version: number
    segmentCount: number
    current: boolean
    hasDeletions: boolean
    directory: string
    segmentsFile: string
    segmentsFileSizeInBytes: number
  }
}

export default function CoresPage() {
  const [cores, setCores] = useState<Record<string, CoreStatus>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newCoreName, setNewCoreName] = useState("")
  const [creatingCore, setCreatingCore] = useState(false)
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  const fetchCores = async () => {
    if (!activeServer) return

    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('/api/solr/cores', {
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
        },
      })

      setCores(response.data.status || {})
    } catch (error) {
      console.error('Error fetching cores:', error)
      setError('Failed to fetch cores. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCores()
  }, [activeServer])

  const handleCreateCore = async () => {
    if (!activeServer) return

    try {
      setCreatingCore(true)

      await axios.post('/api/solr/cores', 
        { name: newCoreName },
        {
          headers: {
            'X-Solr-Url': activeServer.url,
            'X-Solr-Username': activeServer.username || '',
            'X-Solr-Password': activeServer.password || '',
          },
        }
      )

      toast({
        title: "Core Created",
        description: `Core "${newCoreName}" has been created successfully.`,
      })

      setNewCoreName("")
      fetchCores()
    } catch (error) {
      console.error('Error creating core:', error)
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to create core"
          : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setCreatingCore(false)
    }
  }

  const handleReloadCore = async (coreName: string) => {
    if (!activeServer) return

    try {
      await axios.post(`/api/solr/cores/${coreName}/reload`, null, {
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
        },
      })

      toast({
        title: "Core Reloaded",
        description: `Core "${coreName}" has been reloaded successfully.`,
      })

      fetchCores()
    } catch (error) {
      console.error('Error reloading core:', error)
      toast({
        title: "Error",
        description: "Failed to reload core. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!activeServer) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Core Management</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a server to manage cores.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Core Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Core
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Core</DialogTitle>
              <DialogDescription>
                Enter a name for your new Solr core
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Core Name</Label>
                <Input
                  id="name"
                  value={newCoreName}
                  onChange={(e) => setNewCoreName(e.target.value)}
                  placeholder="my_core"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateCore}
                disabled={creatingCore || !newCoreName}
              >
                {creatingCore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating
                  </>
                ) : (
                  'Create Core'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : loading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : Object.keys(cores).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48">
            <p className="text-muted-foreground mb-4">No cores found</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Your First Core</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Core</DialogTitle>
                  <DialogDescription>
                    Enter a name for your new Solr core
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Core Name</Label>
                    <Input
                      id="name"
                      value={newCoreName}
                      onChange={(e) => setNewCoreName(e.target.value)}
                      placeholder="my_core"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateCore}
                    disabled={creatingCore || !newCoreName}
                  >
                    {creatingCore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating
                      </>
                    ) : (
                      'Create Core'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {Object.entries(cores).map(([name, status]) => (
            <Card key={name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{name}</span>
                  <Badge variant="secondary">
                    {status.index.numDocs} documents
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Instance Directory: {status.instanceDir}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Start Time</TableCell>
                      <TableCell>{new Date(status.startTime).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Uptime</TableCell>
                      <TableCell>{status.uptime}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Index Version</TableCell>
                      <TableCell>{status.index.version}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Segments</TableCell>
                      <TableCell>{status.index.segmentCount}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Deleted Documents</TableCell>
                      <TableCell>{status.index.deletedDocs}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleReloadCore(name)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}