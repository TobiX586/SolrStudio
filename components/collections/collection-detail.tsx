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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useServersStore } from "@/lib/stores/servers"
import { SolrCollection } from "@/lib/types"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DataImport } from "./data-import"
import { DataSearch } from "@/components/data/data-search"

interface CollectionDetailProps {
  collection: SolrCollection
}

export function CollectionDetail({ collection }: CollectionDetailProps) {
  const { activeServerId } = useServersStore()

  if (!activeServerId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select a server to view collection details.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/collections">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            <p className="text-muted-foreground">
              {collection.numDocs} documents
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection Information</CardTitle>
          <CardDescription>Basic details about the collection</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Index Size
              </div>
              <div>{collection.indexSize}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Last Modified
              </div>
              <div>{new Date(collection.lastModified).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="schema">
        <TabsList>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="schema" className="space-y-4">
          {collection.schema.fields.map((field) => (
            <Card key={field.name}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{field.name}</span>
                  <Badge variant="secondary">{field.type}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {field.required && <Badge>Required</Badge>}
                  {field.indexed && <Badge variant="outline">Indexed</Badge>}
                  {field.stored && <Badge variant="outline">Stored</Badge>}
                  {field.multiValued && <Badge variant="outline">Multi-Valued</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="data">
          <DataImport 
            collectionName={collection.name} 
            schema={collection.schema}
          />
        </TabsContent>

        <TabsContent value="search">
          <DataSearch 
            collectionName={collection.name}
            schema={collection.schema}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}