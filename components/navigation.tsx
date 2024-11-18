"use client"

import { Home, Settings, FileJson, Database, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { ServerSelector } from "./server-selector"

export default function Navigation() {
  const { setTheme } = useTheme()

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Database className="h-6 w-6" />
              <span className="font-bold text-xl">Solr Studio</span>
            </Link>
            <ServerSelector />
            <div className="hidden md:flex space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Link href="/schemas">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <FileJson className="h-4 w-4" />
                  <span>Schemas</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
              </Link>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}