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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { FileJson, Loader2, Upload } from "lucide-react"
import { useServersStore } from "@/lib/stores/servers"
import axios from "axios"

interface DataImportProps {
  collectionName: string
}

export function DataImport({ collectionName }: DataImportProps) {
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

  const handleImport = async () => {
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

      const data = file ? await file.text() : jsonData
      let documents
      try {
        documents = JSON.parse(data)
      } catch (error) {
        throw new Error("Invalid JSON data")
      }

      await axios.post(`/api/solr/schema/${collectionName}/data`, documents, {
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
          Import documents into your collection using JSON
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Upload JSON File</Label>
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
        </div>

        <div className="space-y-2">
          <Label>Or Paste JSON Data</Label>
          <Textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder='[{"id": "1", "title": "Example Document"}]'
            className="font-mono"
            rows={10}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleImport}
          disabled={uploading || (!file && !jsonData)}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing
            </>
          ) : (
            <>
              <FileJson className="mr-2 h-4 w-4" />
              Import Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}