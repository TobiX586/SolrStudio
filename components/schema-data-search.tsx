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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useServersStore } from "@/lib/stores/servers"
import { AlertCircle, Loader2, Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"

interface SchemaDataSearchProps {
  schemaId: string
}

export function SchemaDataSearch({ schemaId }: SchemaDataSearchProps) {
  const [query, setQuery] = useState("*:*")
  const [results, setResults] = useState<any[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState("")
  const [fields, setFields] = useState<string[]>([])
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  const handleSearch = async () => {
    if (!activeServer) {
      toast({
        title: "Error",
        description: "No server selected",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Build search parameters
      const params = new URLSearchParams()
      params.append('q', query || '*:*')
      
      // Add sort if specified
      if (sortField) {
        params.append('sort', sortField)
      }

      const response = await axios.get(`/api/solr/schema/${schemaId}/data/search?${params.toString()}`, {
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
        },
      })

      setResults(response.data.docs)
      setTotalResults(response.data.numFound)

      // Extract available fields from the first document
      if (response.data.docs.length > 0) {
        const documentFields = Object.keys(response.data.docs[0]).filter(
          key => !key.startsWith('_') && !key.endsWith('_')
        )
        setFields(documentFields)
      }
    } catch (error) {
      console.error('Error searching:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to perform search'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Documents</CardTitle>
        <CardDescription>
          Search for documents in your collection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Enter search query (e.g., *:* for all documents)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <Select value={sortField} onValueChange={setSortField}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Relevance</SelectItem>
              {fields.map((field) => (
                <SelectItem key={field} value={`${field} asc`}>
                  {field} (A-Z)
                </SelectItem>
              ))}
              {fields.map((field) => (
                <SelectItem key={`${field}-desc`} value={`${field} desc`}>
                  {field} (Z-A)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Results</span>
                {totalResults > 0 && (
                  <Badge variant="secondary">
                    {totalResults} document{totalResults !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {fields.map((field) => (
                        <TableHead key={field}>{field}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={fields.length}
                          className="text-center h-24"
                        >
                          No results found
                        </TableCell>
                      </TableRow>
                    ) : (
                      results.map((doc, index) => (
                        <TableRow key={index}>
                          {fields.map((field) => (
                            <TableCell key={field}>
                              {Array.isArray(doc[field]) ? (
                                <div className="flex flex-wrap gap-1">
                                  {doc[field].map((value: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                    >
                                      {value}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                doc[field]
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

export default SchemaDataSearch;