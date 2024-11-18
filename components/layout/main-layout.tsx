"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Settings, 
  FileJson, 
  Database,
  Search,
  Upload,
  Brain,
  BarChart,
  Layers,
  GitBranch,
  FolderOpen
} from "lucide-react"
import Link from "next/link"
import { MobileNav } from "./mobile-nav"
import { Footer } from "./footer"
import { ServerSelector } from "../server-selector"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile && isCollapsed) {
        setIsCollapsed(false)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [isCollapsed])

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Schemas",
      href: "/schemas",
      icon: FileJson,
    },
    {
      title: "Collections",
      href: "/collections",
      icon: FolderOpen,
    },

    {
      title: "Search Console",
      href: "/search",
      icon: Search,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart,
    },
    {
      title: "AI Assistant",
      href: "/ai-assistant",
      icon: Brain,
    },
    {
      title: "Core Management",
      href: "/cores",
      icon: Layers,
    },
    {
      title: "Replication",
      href: "/replication",
      icon: GitBranch,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNav navItems={navItems} />
      </div>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 z-20 h-full border-r bg-background transition-all duration-300 ease-in-out md:relative",
            isCollapsed ? "w-16" : "w-64",
            isMobile && "hidden md:block"
          )}
        >
          <div className="flex h-16 items-center border-b px-4">
            <Link href="/" className="flex items-center space-x-2">
              <Database className="h-6 w-6" />
              {!isCollapsed && <span className="font-bold text-xl">Solr Studio</span>}
            </Link>
          </div>

          <div className="p-4">
            <ServerSelector collapsed={isCollapsed} />
          </div>

          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1 p-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {!isCollapsed && <span className="ml-2">{item.title}</span>}
                  </Button>
                </Link>
              ))}
            </div>
          </ScrollArea>

          <Button
            variant="ghost"
            className="absolute -right-4 top-20 hidden h-8 w-8 rounded-full md:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </aside>

        {/* Main content */}
        <main className={cn(
          "flex-1 flex flex-col min-h-screen",
          isMobile ? "w-full" : isCollapsed ? "ml-16" : "ml-64"
        )}>
          <div className="flex-1 px-4 py-6 md:px-6 lg:px-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}