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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { FileJson, Loader2, Upload } from "lucide-react"
import { useServersStore } from "@/lib/stores/servers"
import { DocumentEditor } from "./document-editor"
import axios from "axios"

interface SchemaDataImportProps {
  schemaId: string
}

export function SchemaDataImport({ schemaId }: SchemaDataImportProps) {
  const [importMethod, setImportMethod] = useState<"editor" | "json" | "csv">("editor")
  const [file, setFile] = useState<File | null>(null)
  const [jsonData, setJsonData] = useState("")
  const [uploading, setUploading] = useState(false)
  const [commitWithin, setCommitWithin] = useState("1000")

  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      // If JSON file, read and display content
      if (importMethod === "json" && selectedFile.type === "application/json") {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            // Validate JSON and format it
            const formatted = JSON.stringify(JSON.parse(content), null, 2)
            setJsonData(formatted)
          } catch (error) {
            toast({
              title: "Invalid JSON",
              description: "The selected file contains invalid JSON",
              variant: "destructive",
            })
          }
        }
        reader.readAsText(selectedFile)
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

      await axios.post(`/api/solr/schema/${schemaId}/data`, data, {
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
          'X-Commit-Within': commitWithin,
        },
      })

      toast({
        title: "Data Imported",
        description: "Document has been successfully imported",
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

  const handleUpload = async () => {
    if (!file && !jsonData) {
      toast({
        title: "Error",
        description: "Please select a file or enter JSON data",
        variant: "destructive",
      })
      return
    }

    try {
      let data: any
      if (importMethod === "json") {
        data = file ? await file.text() : jsonData
        try {
          // Ensure valid JSON
          data = JSON.parse(data)
        } catch (error) {
          throw new Error("Invalid JSON data")
        }
      } else {
        if (!file) {
          throw new Error("Please select a CSV file")
        }
        // Convert CSV to JSON
        data = await file.text()
        // TODO: Add CSV parsing logic
      }

      await handleImport(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Data</CardTitle>
        <CardDescription>
          Add documents to your schema using the document editor or by uploading a file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Import Method</Label>
          <Select
            value={importMethod}
            onValueChange={(value: "editor" | "json" | "csv") => {
              setImportMethod(value)
              setFile(null)
              setJsonData("")
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="editor">Document Editor</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Commit Within (ms)</Label>
          <Input
            type="number"
            value={commitWithin}
            onChange={(e) => setCommitWithin(e.target.value)}
            placeholder="1000"
          />
        </div>

        {importMethod === "editor" ? (
          <DocumentEditor
            fields={[
              { name: "id" },
              { name: "title" },
              { name: "content" },
            ]}
            onSave={handleImport}
          />
        ) : (
          <>
            <div className="space-y-2">
              <Label>Upload File</Label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {importMethod === "json" ? "JSON" : "CSV"} files only
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept={importMethod === "json" ? ".json" : ".csv"}
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

            {importMethod === "json" && (
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
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}