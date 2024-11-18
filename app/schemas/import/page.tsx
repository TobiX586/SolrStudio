"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export default function ImportSchemaPage() {
  const router = useRouter()
  const [solrUrl, setSolrUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleImport = () => {
    if (solrUrl) {
      toast({
        title: "Schema Imported",
        description: `Imported schema from: ${solrUrl}`,
      })
    } else if (file) {
      toast({
        title: "Schema Imported",
        description: `Imported schema from file: ${file.name}`,
      })
    }
    router.push("/schemas")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/schemas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Import Schema</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Import from Solr Instance</CardTitle>
            <CardDescription>
              Connect to an existing Solr instance to import its schema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter Solr URL (e.g., http://localhost:8983/solr/collection1)"
              value={solrUrl}
              onChange={(e) => setSolrUrl(e.target.value)}
            />
            <Button
              className="w-full"
              disabled={!solrUrl}
              onClick={handleImport}
            >
              Import from Solr
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import from File</CardTitle>
            <CardDescription>
              Upload a schema.xml or managed-schema file
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
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".xml"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            {file && (
              <div className="text-sm text-muted-foreground">
                Selected file: {file.name}
              </div>
            )}
            <Button
              className="w-full"
              disabled={!file}
              onClick={handleImport}
            >
              Import from File
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}