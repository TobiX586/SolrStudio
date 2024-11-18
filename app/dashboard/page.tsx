"use client"

import { useServersStore } from "@/lib/stores/servers"
import { ServerStatus } from "@/components/server-status"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  if (!activeServer) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Alert>
          <AlertDescription>
            No server selected. Please{" "}
            <Link href="/servers/new">
              <Button variant="link" className="px-0">add a server</Button>
            </Link>{" "}
            or select one from the dropdown above.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/servers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </Link>
      </div>

      <ServerStatus />
    </div>
  )
}