"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useServersStore } from "@/lib/stores/servers"
import { AlertCircle, Loader2 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  // Mock data - replace with real data from Solr
  const queryData = [
    { time: '00:00', queries: 120 },
    { time: '04:00', queries: 180 },
    { time: '08:00', queries: 350 },
    { time: '12:00', queries: 480 },
    { time: '16:00', queries: 420 },
    { time: '20:00', queries: 250 },
  ]

  const fieldUsageData = [
    { field: 'title', count: 450 },
    { field: 'content', count: 380 },
    { field: 'tags', count: 230 },
    { field: 'author', count: 150 },
  ]

  const statusData = [
    { name: 'Success', value: 850 },
    { name: 'Failed', value: 50 },
    { name: 'Timeout', value: 20 },
    { name: 'Error', value: 80 },
  ]

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!activeServer) return
      
      try {
        setLoading(true)
        setError(null)
        // TODO: Implement real analytics data fetching
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [activeServer])

  if (!activeServer) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select a server to view analytics.
        </AlertDescription>
      </Alert>
    )
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Query Volume</CardTitle>
            <CardDescription>Queries per hour</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={queryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="queries" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Field Usage</CardTitle>
            <CardDescription>Most queried fields</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fieldUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="field" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Query Status</CardTitle>
            <CardDescription>Distribution of query results</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>System performance over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { time: '00:00', queryTime: 120, indexTime: 80 },
                { time: '04:00', queryTime: 150, indexTime: 90 },
                { time: '08:00', queryTime: 200, indexTime: 120 },
                { time: '12:00', queryTime: 180, indexTime: 100 },
                { time: '16:00', queryTime: 250, indexTime: 140 },
                { time: '20:00', queryTime: 190, indexTime: 110 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="queryTime" 
                name="Query Time (ms)"
                stroke="#8884d8" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="indexTime" 
                name="Index Time (ms)"
                stroke="#82ca9d" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}