import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Plus, Server, Settings } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Solr Studio</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A modern, comprehensive management interface for Apache Solr.
          Get started by connecting to a Solr server or exploring the available features.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>Connect Server</span>
            </CardTitle>
            <CardDescription>
              Add and manage Solr server connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/servers/new">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Server
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Schema Manager</span>
            </CardTitle>
            <CardDescription>
              Create and manage Solr schemas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/schemas">
              <Button className="w-full" variant="outline">
                Manage Schemas
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </CardTitle>
            <CardDescription>
              Configure application preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings">
              <Button className="w-full" variant="outline">
                Open Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}