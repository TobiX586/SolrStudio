import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2, Server } from "lucide-react"
import { SystemInfo } from "@/lib/types"
import { formatBytes, formatUptime } from "@/lib/utils"
import { useServersStore } from "@/lib/stores/servers"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"

export function ServerStatus() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  useEffect(() => {
    async function fetchSystemInfo() {
      if (!activeServer) return

      try {
        setLoading(true)
        setError(null)
        
        const response = await axios.get('/api/solr/test', {
          headers: {
            'X-Solr-Url': activeServer.url,
            'X-Solr-Username': activeServer.username || '',
            'X-Solr-Password': activeServer.password || '',
          },
        })
        
        const { jvm, system, lucene } = response.data

        // Parse JVM memory values
        const jvmMemoryRaw = jvm.memory?.raw || jvm.memory || {}
        const jvmMemory = {
          free: parseInt(jvmMemoryRaw.free || jvmMemoryRaw.freeMemory || 0),
          total: parseInt(jvmMemoryRaw.total || jvmMemoryRaw.totalMemory || 0),
          max: parseInt(jvmMemoryRaw.max || jvmMemoryRaw.maxMemory || 0),
          used: parseInt(jvmMemoryRaw.used || (jvmMemoryRaw.totalMemory - jvmMemoryRaw.freeMemory) || 0),
        }

        // Parse system memory values
        const systemMemoryRaw = system.memory || {}
        const systemMemory = {
          free: parseInt(systemMemoryRaw.freePhysicalMemorySize || systemMemoryRaw.free || 0),
          total: parseInt(systemMemoryRaw.totalPhysicalMemorySize || systemMemoryRaw.total || 0),
        }

        setSystemInfo({
          jvm: {
            version: jvm.version || jvm.spec?.version || 'Unknown',
            memory: {
              free: formatBytes(jvmMemory.free),
              total: formatBytes(jvmMemory.total),
              max: formatBytes(jvmMemory.max),
              used: formatBytes(jvmMemory.used),
            },
          },
          system: {
            processorCores: system.availableProcessors || 0,
            uptime: formatUptime(system.uptime || 0),
            memory: {
              free: formatBytes(systemMemory.free),
              total: formatBytes(systemMemory.total),
            },
          },
          solr: {
            version: lucene.solr?.spec?.version || lucene.version || 'Unknown',
            startTime: new Date(system.startTime || Date.now()).toLocaleString(),
            specification: lucene.specification || lucene.solr?.impl?.version || `Lucene ${lucene.version}`,
          },
        })
      } catch (err) {
        console.error('Error fetching system info:', err)
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError('Authentication failed. Please check your credentials.')
        } else {
          setError('Failed to fetch system information')
        }
      } finally {
        setLoading(false)
      }
    }

    if (activeServer) {
      fetchSystemInfo()
      const interval = setInterval(fetchSystemInfo, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [activeServer])

  if (!activeServer) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No server selected. Please select a server to view its status.
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error || !systemInfo) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'No system information available'}
        </AlertDescription>
      </Alert>
    )
  }

  const jvmMemoryUsed = parseInt(systemInfo.jvm.memory.used)
  const jvmMemoryTotal = parseInt(systemInfo.jvm.memory.total)
  const jvmMemoryPercentage = Math.min(100, Math.max(0, (jvmMemoryUsed / jvmMemoryTotal) * 100))

  const systemMemoryUsed = parseInt(systemInfo.system.memory.total) - parseInt(systemInfo.system.memory.free)
  const systemMemoryTotal = parseInt(systemInfo.system.memory.total)
  const systemMemoryPercentage = Math.min(100, Math.max(0, (systemMemoryUsed / systemMemoryTotal) * 100))

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Solr Version
          </CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemInfo.solr.version}</div>
          <p className="text-xs text-muted-foreground">
            {systemInfo.solr.specification}
          </p>
          <div className="mt-4 flex items-center text-sm">
            <Badge variant="secondary">Started {systemInfo.solr.startTime}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JVM Memory Usage</CardTitle>
          <CardDescription>
            {systemInfo.jvm.memory.used} of {systemInfo.jvm.memory.total}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={jvmMemoryPercentage} className="h-2" />
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Free</div>
              <div>{systemInfo.jvm.memory.free}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Max</div>
              <div>{systemInfo.jvm.memory.max}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Memory Usage</CardTitle>
          <CardDescription>
            {formatBytes(systemMemoryUsed)} of {systemInfo.system.memory.total}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={systemMemoryPercentage} className="h-2" />
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Processor Cores</div>
              <div>{systemInfo.system.processorCores}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Uptime</div>
              <div>{systemInfo.system.uptime}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}