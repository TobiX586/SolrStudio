import { ArrowLeft, Download, Pencil, Plus, Trash, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useServersStore } from "@/lib/stores/servers"
import { SchemaDataImport } from "./schema-data-import"
import SchemaDataSearch from "./schema-data-search"
import { DocumentRelationships } from "./document-relationships"
import axios from "axios"

interface Schema {
  id: string
  name: string
  description: string
  lastModified: string
  uniqueKey: string
  fields: any[]
  dynamicFields: any[]
  copyFields: any[]
}

interface SchemaDetailProps {
  schema: Schema
}

export default function SchemaDetail({ schema }: SchemaDetailProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingField, setIsDeletingField] = useState<string | null>(null)
  const [isDeletingDynamicField, setIsDeletingDynamicField] = useState<string | null>(null)
  const [isDeletingCopyField, setIsDeletingCopyField] = useState<string | null>(null)
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  const handleDelete = async () => {
    if (!activeServer) {
      toast({
        title: "Error",
        description: "No server selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDeleting(true)
      await axios.delete(`/api/solr/collections/${schema.id}`, {
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
        },
      })
      
      toast({
        title: "Schema Deleted",
        description: `Schema "${schema.name}" has been deleted.`,
      })
      router.push("/schemas")
    } catch (error) {
      console.error('Error deleting schema:', error)
      let errorMessage = "Failed to delete schema"
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          errorMessage = "Schema not found"
        } else if (error.response?.status === 409) {
          errorMessage = "Schema is currently in use. Please try again later."
        } else {
          errorMessage = error.response?.data?.error || errorMessage
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteField = async (fieldName: string) => {
    if (!activeServer) {
      toast({
        title: "Error",
        description: "No server selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDeletingField(fieldName)
      await axios.delete(`/api/solr/schema/${schema.id}/fields/${fieldName}`, {
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
        },
      })
      
      toast({
        title: "Field Deleted",
        description: `Field "${fieldName}" has been deleted.`,
      })
      router.refresh()
    } catch (error) {
      console.error('Error deleting field:', error)
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to delete field"
          : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeletingField(null)
    }
  }

  const handleDeleteDynamicField = async (fieldName: string) => {
    if (!activeServer) {
      toast({
        title: "Error",
        description: "No server selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDeletingDynamicField(fieldName)
      await axios.delete(`/api/solr/schema/${schema.id}/dynamic-fields/${fieldName}`, {
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
        },
      })
      
      toast({
        title: "Dynamic Field Deleted",
        description: `Dynamic field "${fieldName}" has been deleted.`,
      })
      router.refresh()
    } catch (error) {
      console.error('Error deleting dynamic field:', error)
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to delete dynamic field"
          : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeletingDynamicField(null)
    }
  }

  const handleDeleteCopyField = async (source: string, dest: string) => {
    if (!activeServer) {
      toast({
        title: "Error",
        description: "No server selected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDeletingCopyField(`${source}-${dest}`)
      await axios.delete(`/api/solr/schema/${schema.id}/copy-fields`, {
        data: { source, dest },
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
        },
      })
      
      toast({
        title: "Copy Field Deleted",
        description: `Copy field mapping "${source} → ${dest}" has been deleted.`,
      })
      router.refresh()
    } catch (error) {
      console.error('Error deleting copy field:', error)
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to delete copy field"
          : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeletingCopyField(null)
    }
  }

  const handleDownload = () => {
    const schemaJson = JSON.stringify(schema, null, 2)
    const blob = new Blob([schemaJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${schema.name}-schema.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Schema Downloaded",
      description: "Schema configuration has been downloaded successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/schemas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{schema.name}</h1>
            <p className="text-muted-foreground">{schema.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Link href={`/schemas/${schema.id}/edit`}>
            <Button variant="outline" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Schema</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this schema? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schema Information</CardTitle>
          <CardDescription>Basic details about the schema</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Last Modified
              </div>
              <div>{new Date(schema.lastModified).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Unique Key
              </div>
              <div>{schema.uniqueKey}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="fields">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="fields">Fields ({schema.fields.length})</TabsTrigger>
            <TabsTrigger value="dynamic-fields">Dynamic Fields ({schema.dynamicFields.length})</TabsTrigger>
            <TabsTrigger value="copy-fields">Copy Fields ({schema.copyFields.length})</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <Link href={`/schemas/${schema.id}/fields/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </Link>
            <Link href={`/schemas/${schema.id}/dynamic-fields/new`}>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Dynamic Field
              </Button>
            </Link>
            <Link href={`/schemas/${schema.id}/copy-fields/new`}>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Copy Field
              </Button>
            </Link>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-24rem)]">
          <TabsContent value="fields" className="space-y-4">
            {schema.fields.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-32">
                  <p className="text-muted-foreground mb-4">No fields defined</p>
                  <Link href={`/schemas/${schema.id}/fields/new`}>
                    <Button>Add Your First Field</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              schema.fields.map((field) => (
                <Card key={field.name} className="hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{field.name}</span>
                      <Badge variant="secondary">{field.type}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {field.required && (
                        <Badge variant="default">Required</Badge>
                      )}
                      {field.indexed && (
                        <Badge variant="outline">Indexed</Badge>
                      )}
                      {field.stored && (
                        <Badge variant="outline">Stored</Badge>
                      )}
                      {field.multiValued && (
                        <Badge variant="outline">Multi-Valued</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Link href={`/schemas/${schema.id}/fields/${field.name}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={isDeletingField === field.name || field.name === schema.uniqueKey}
                        >
                          {isDeletingField === field.name ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trash className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Field</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the field "{field.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteField(field.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="dynamic-fields" className="space-y-4">
            {schema.dynamicFields.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-32">
                  <p className="text-muted-foreground mb-4">No dynamic fields defined</p>
                  <Link href={`/schemas/${schema.id}/dynamic-fields/new`}>
                    <Button>Add Dynamic Field</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              schema.dynamicFields.map((field) => (
                <Card key={field.name} className="hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{field.name}</span>
                      <Badge variant="secondary">{field.type}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {field.indexed && (
                        <Badge variant="outline">Indexed</Badge>
                      )}
                      {field.stored && (
                        <Badge variant="outline">Stored</Badge>
                      )}
                      {field.multiValued && (
                        <Badge variant="outline">Multi-Valued</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Link href={`/schemas/${schema.id}/dynamic-fields/${field.name}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={isDeletingDynamicField === field.name}
                        >
                          {isDeletingDynamicField === field.name ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trash className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Dynamic Field</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the dynamic field pattern "{field.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDynamicField(field.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="copy-fields" className="space-y-4">
            {schema.copyFields.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-32">
                  <p className="text-muted-foreground mb-4">No copy fields defined</p>
                  <Link href={`/schemas/${schema.id}/copy-fields/new`}>
                    <Button>Add Copy Field</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              schema.copyFields.map((field) => (
                <Card key={`${field.source}-${field.dest}`} className="hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">Copy Field</CardTitle>
                    <CardDescription>
                      {field.source} → {field.dest}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-end space-x-2">
                    <Link href={`/schemas/${schema.id}/copy-fields/${field.source}/${field.dest}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={isDeletingCopyField === `${field.source}-${field.dest}`}
                        >
                          {isDeletingCopyField === `${field.source}-${field.dest}` ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trash className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Copy Field</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the copy field mapping from "{field.source}" to "{field.dest}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCopyField(field.source, field.dest)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="data">
          <SchemaDataImport schemaId={schema.id} />
        </TabsContent>

        <TabsContent value="search">
          <SchemaDataSearch 
            schemaId={schema.id}
            fields={schema.fields.map(f => f.name)}
          />
        </TabsContent>

          <TabsContent value="relationships" className="space-y-6">
            <DocumentRelationships schemaId={schema.id} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}