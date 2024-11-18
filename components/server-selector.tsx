"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useServersStore } from "@/lib/stores/servers"
import { ChevronDown, Plus, Server } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ServerSelectorProps {
  collapsed?: boolean
}

export function ServerSelector({ collapsed = false }: ServerSelectorProps) {
  const [mounted, setMounted] = useState(false)
  const { servers, activeServerId, setActiveServer } = useServersStore()
  const router = useRouter()

  const activeServer = servers.find(s => s.id === activeServerId)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleServerSelect = (id: string) => {
    setActiveServer(id)
    router.push('/dashboard')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("justify-between", collapsed ? "w-8 p-0" : "w-full")}>
          <div className="flex items-center">
            <Server className="h-4 w-4" />
            {!collapsed && (
              <span className="ml-2 truncate">
                {activeServer ? activeServer.name : 'Select Server'}
              </span>
            )}
          </div>
          {!collapsed && <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel>Solr Servers</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {servers.map((server) => (
          <DropdownMenuItem
            key={server.id}
            onSelect={() => handleServerSelect(server.id)}
          >
            <Server className="mr-2 h-4 w-4" />
            <span>{server.name}</span>
          </DropdownMenuItem>
        ))}
        {servers.length === 0 && (
          <DropdownMenuItem disabled>
            No servers configured
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push('/servers/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Server
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}