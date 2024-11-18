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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { FileJson, Loader2, Upload } from "lucide-react"
import { useServersStore } from "@/lib/stores/servers"
import { SolrSchema } from "@/lib/types"
import { DynamicForm } from "@/components/dynamic-form"
import axios from "axios"

interface DataImportProps {
  collectionName: string
  schema: SolrSchema
}

export function DataImport({ collectionName, schema }: DataImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [jsonData, setJsonData] = useState("")
  const [uploading, setUploading] = useState(false)
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    
    if (selectedFile.type === "application/json") {
      try {
        const text = await selectedFile.text()
        const json = JSON.parse(text)
        setJsonData(JSON.stringify(json, null, 2))
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "The selected file contains invalid JSON",
          variant: "destructive",
        })
      }
    }
  }

  const handleImport = async (data: any) => {
    if (!activeServer) {
      toast({
        title: "Error",
        description: "No server selected",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)

      let documents
      if (data) {
        // Single document from form
        documents = [data]
      } else {
        // Bulk import from file/JSON
        documents = file ? JSON.parse(await file.text()) : JSON.parse(jsonData)
      }

      await axios.post(`/api/solr/collections/${collectionName}/data`, documents, {
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
        },
      })

      toast({
        title: "Import Successful",
        description: "Documents have been imported successfully",
      })

      // Clear form
      setFile(null)
      setJsonData("")
    } catch (error) {
      console.error('Error importing data:', error)
      toast({
        title: "Import Failed",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to import data"
          : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Data</CardTitle>
        <CardDescription>
          Add documents to your collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="form">
          <TabsList>
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4 pt-4">
            <DynamicForm 
              fields={schema.fields}
              onSubmit={handleImport}
            />
          </TabsContent>

          <TabsContent value="file" className="space-y-4 pt-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">JSON files only</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".json"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected file: {file.name}
              </p>
            )}
            <Button
              className="w-full"
              onClick={() => handleImport(null)}
              disabled={uploading || !file}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import File
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="json" className="space-y-4 pt-4">
            <textarea
              className="w-full h-64 p-2 font-mono text-sm border rounded-md"
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder='[{"id": "1", "title": "Example Document"}]'
            />
            <Button
              className="w-full"
              onClick={() => handleImport(null)}
              disabled={uploading || !jsonData}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing
                </>
              ) : (
                <>
                  <FileJson className="mr-2 h-4 w-4" />
                  Import JSON
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}