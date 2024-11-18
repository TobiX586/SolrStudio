"use client"

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
import {
  Plus,
  Search,
  Loader2,
  Upload,
  ArrowUpDown,
  Calendar,
  LayoutGrid,
  List,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useSchemas } from "@/hooks/use-schemas"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useServersStore } from "@/lib/stores/servers"

type ViewMode = "grid" | "list"
type SortField = "name" | "lastModified" | "fields"
type SortOrder = "asc" | "desc"

export default function SchemasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortField, setSortField] = useState<SortField>("lastModified")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const { schemas, loading, error } = useSchemas()
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  const sortedAndFilteredSchemas = schemas
    .filter((schema) =>
      schema.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      if (sortField === "lastModified") {
        return sortOrder === "asc"
          ? new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
          : new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      }
      return sortOrder === "asc"
        ? a.fields.length - b.fields.length
        : b.fields.length - a.fields.length
    })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  if (!activeServer) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Schemas</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a server to view and manage schemas.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Schemas</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schemas..."
                className="pl-8 w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link href="/schemas/import">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </Link>
            <Link href="/schemas/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Schema
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort by {sortField}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => toggleSort("name")}>
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort("lastModified")}>
                  Last Modified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort("fields")}>
                  Field Count
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      ) : sortedAndFilteredSchemas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-muted-foreground mb-4">
              {searchQuery ? "No schemas found matching your search" : "No schemas found"}
            </div>
            <Link href="/schemas/new">
              <Button>Create Your First Schema</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {sortedAndFilteredSchemas.map((schema) => (
              <Link key={schema.id} href={`/schemas/${schema.id}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{schema.name}</span>
                      {schema.fields.length > 0 && (
                        <Badge variant="secondary">
                          {schema.fields.length} fields
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {schema.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Dynamic Fields</div>
                        <div>{schema.dynamicFields.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Copy Fields</div>
                        <div>{schema.copyFields.length}</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Last modified {new Date(schema.lastModified).toLocaleDateString()}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}