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
import { AlertCircle, GitBranch, Loader2, RefreshCw } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { formatBytes } from "@/lib/utils"
import axios from "axios"

interface ReplicationStatus {
  master: boolean
  replicable: boolean
  replicationEnabled: boolean
  replicateAfter: string[]
  masterUrl: string
  confFiles: string[]
  generation: number
  indexVersion: number
  size: string
  indexPath: string
}

export default function ReplicationPage() {
  const [status, setStatus] = useState<Record<string, ReplicationStatus>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCore, setSelectedCore] = useState<string>("")
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  const fetchReplicationStatus = async () => {
    if (!activeServer || !selectedCore) return

    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`/api/solr/cores/${selectedCore}/replication`, {
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
        },
      })

      setStatus({ ...status, [selectedCore]: response.data })
    } catch (error) {
      console.error('Error fetching replication status:', error)
      setError('Failed to fetch replication status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEnableReplication = async (core: string, isMaster: boolean) => {
    if (!activeServer) return

    try {
      await axios.post(
        `/api/solr/cores/${core}/replication/enable`,
        { master: isMaster },
        {
          headers: {
            'X-Solr-Url': activeServer.url,
            'X-Solr-Username': activeServer.username || '',
            'X-Solr-Password': activeServer.password || '',
          },
        }
      )

      toast({
        title: "Replication Enabled",
        description: `Core "${core}" is now configured as a ${isMaster ? 'master' : 'slave'}.`,
      })

      fetchReplicationStatus()
    } catch (error) {
      console.error('Error enabling replication:', error)
      toast({
        title: "Error",
        description: "Failed to enable replication. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStartReplication = async (core: string) => {
    if (!activeServer) return

    try {
      await axios.post(
        `/api/solr/cores/${core}/replication/replicate`,
        null,
        {
          headers: {
            'X-Solr-Url': activeServer.url,
            'X-Solr-Username': activeServer.username || '',
            'X-Solr-Password': activeServer.password || '',
          },
        }
      )

      toast({
        title: "Replication Started",
        description: "The replication process has been initiated.",
      })

      fetchReplicationStatus()
    } catch (error) {
      console.error('Error starting replication:', error)
      toast({
        title: "Error",
        description: "Failed to start replication. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (selectedCore) {
      fetchReplicationStatus()
    }
  }, [selectedCore])

  if (!activeServer) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Replication</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a server to manage replication.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Replication</h1>
        <Button
          variant="outline"
          onClick={fetchReplicationStatus}
          disabled={!selectedCore || loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Core Selection</CardTitle>
          <CardDescription>
            Select a core to view and manage its replication settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="core-select">Core</Label>
            <Select value={selectedCore} onValueChange={setSelectedCore}>
              <SelectTrigger id="core-select">
                <SelectValue placeholder="Select a core" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collection1">collection1</SelectItem>
                <SelectItem value="collection2">collection2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedCore && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Replication Status</span>
                {status[selectedCore]?.replicationEnabled && (
                  <Badge variant="secondary">
                    {status[selectedCore]?.master ? 'Master' : 'Slave'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Current replication configuration and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : loading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : status[selectedCore] ? (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Status</TableCell>
                      <TableCell>
                        {status[selectedCore].replicationEnabled ? (
                          <Badge variant="success">Enabled</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Role</TableCell>
                      <TableCell>
                        {status[selectedCore].master ? 'Master' : 'Slave'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Index Version</TableCell>
                      <TableCell>{status[selectedCore].indexVersion}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Generation</TableCell>
                      <TableCell>{status[selectedCore].generation}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Size</TableCell>
                      <TableCell>{status[selectedCore].size}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertDescription>
                    No replication status available
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              {!status[selectedCore]?.replicationEnabled ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleEnableReplication(selectedCore, true)}
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Enable as Master
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEnableReplication(selectedCore, false)}
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Enable as Slave
                  </Button>
                </>
              ) : !status[selectedCore]?.master && (
                <Button
                  onClick={() => handleStartReplication(selectedCore)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Replication
                </Button>
              )}
            </CardFooter>
          </Card>

          {status[selectedCore]?.replicationEnabled && (
            <Card>
              <CardHeader>
                <CardTitle>Configuration Files</CardTitle>
                <CardDescription>
                  Files included in replication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {status[selectedCore]?.confFiles?.map((file) => (
                      <TableRow key={file}>
                        <TableCell>{file}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Included</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}