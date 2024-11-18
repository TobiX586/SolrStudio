"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useServersStore } from "@/lib/stores/servers"
import { SolrCollection } from "@/lib/types"
import { AlertCircle, Loader2, Plus, Search } from "lucide-react"
import Link from "next/link"

interface CollectionListProps {
  collections: SolrCollection[]
  loading: boolean
  error: string | null
}

export function CollectionList({ collections, loading, error }: CollectionListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { activeServerId } = useServersStore()

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!activeServerId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select a server to view collections.
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Link href="/collections/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
        </Link>
      </div>

      {filteredCollections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No collections found matching your search" : "No collections found"}
            </p>
            <Link href="/collections/new">
              <Button>Create Your First Collection</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCollections.map((collection) => (
            <Link key={collection.name} href={`/collections/${collection.name}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{collection.name}</span>
                    <Badge variant="secondary">
                      {collection.numDocs} docs
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Schema: {collection.schema.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Size</div>
                      <div>{collection.indexSize}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Modified</div>
                      <div>{new Date(collection.lastModified).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}