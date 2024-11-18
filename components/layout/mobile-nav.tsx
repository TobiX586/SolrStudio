"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Link from "next/link"
import { ServerSelector } from "../server-selector"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface MobileNavProps {
  navItems: NavItem[]
}

export function MobileNav({ navItems }: MobileNavProps) {
  return (
    <div className="flex h-16 items-center border-b px-4 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-4">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle>Solr Studio</SheetTitle>
          </SheetHeader>
          <div className="mt-4 mb-6">
            <ServerSelector />
          </div>
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}