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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImportPreview } from "@/components/data-import/import-preview"
import { useServersStore } from "@/lib/stores/servers"
import { AlertCircle, FileJson, Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [jsonData, setJsonData] = useState("")
  const [previewData, setPreviewData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        setPreviewData(Array.isArray(json) ? json : [json])
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
        description: "Please select a server first",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      // TODO: Implement actual import logic
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast({
        title: "Import Successful",
        description: "Data has been imported successfully",
      })

      // Clear form
      setFile(null)
      setJsonData("")
      setPreviewData([])
    } catch (error) {
      setError("Failed to import data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!activeServer) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Data Import</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a server before importing data.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Import</h1>

      <Tabs defaultValue="file">
        <TabsList>
          <TabsTrigger value="file">File Upload</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="csv">CSV</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>
                Import data from JSON or CSV files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JSON or CSV files
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".json,.csv"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected file: {file.name}
                </p>
              )}
            </CardContent>
          </Card>

          {previewData.length > 0 && (
            <ImportPreview
              data={previewData}
              loading={loading}
              error={error}
              onConfirm={handleImport}
              onCancel={() => {
                setFile(null)
                setPreviewData([])
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON Data</CardTitle>
              <CardDescription>
                Paste JSON data directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="json-data">JSON Data</Label>
                <Input
                  id="json-data"
                  value={jsonData}
                  onChange={(e) => {
                    setJsonData(e.target.value)
                    try {
                      const data = JSON.parse(e.target.value)
                      setPreviewData(Array.isArray(data) ? data : [data])
                      setError(null)
                    } catch {
                      setPreviewData([])
                      setError("Invalid JSON format")
                    }
                  }}
                  className="font-mono"
                  placeholder='[{"id": "1", "title": "Example"}]'
                />
              </div>

              <Button
                className="w-full"
                onClick={handleImport}
                disabled={loading || !jsonData}
              >
                <FileJson className="mr-2 h-4 w-4" />
                Import JSON
              </Button>
            </CardContent>
          </Card>

          {previewData.length > 0 && (
            <ImportPreview
              data={previewData}
              loading={loading}
              error={error}
              onConfirm={handleImport}
              onCancel={() => {
                setJsonData("")
                setPreviewData([])
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="csv">
          <Card>
            <CardHeader>
              <CardTitle>CSV Import</CardTitle>
              <CardDescription>
                Import data from CSV files (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  CSV import functionality will be available soon.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}