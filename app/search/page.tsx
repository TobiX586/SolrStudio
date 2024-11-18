"use client"

import { useState, useEffect } from "react"
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
import { useServersStore } from "@/lib/stores/servers"
import { AlertCircle, Loader2, Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchFilters } from "@/components/search/search-filters"
import { SearchResults } from "@/components/search/search-results"
import { SearchToolbar } from "@/components/search/search-toolbar"
import { QueryOptimizer } from "@/components/ai/query-optimizer"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"

export default function SearchPage() {
  const [query, setQuery] = useState("*:*")
  const [results, setResults] = useState<any[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<string>("")
  const [collections, setCollections] = useState<string[]>([])
  const [fields, setFields] = useState<string[]>([])
  const [sortField, setSortField] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>({})
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const pageSize = 10

  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  useEffect(() => {
    async function fetchCollections() {
      if (!activeServer) return

      try {
        const response = await axios.get('/api/solr/collections', {
          headers: {
            'X-Solr-Url': activeServer.url,
            'X-Solr-Username': activeServer.username || '',
            'X-Solr-Password': activeServer.password || '',
          },
        })
        setCollections(response.data.collections || [])
      } catch (error) {
        console.error('Error fetching collections:', error)
        toast({
          title: "Error",
          description: "Failed to fetch collections",
          variant: "destructive",
        })
      }
    }

    fetchCollections()
  }, [activeServer])

  useEffect(() => {
    async function fetchFields() {
      if (!activeServer || !selectedCollection) return

      try {
        const response = await axios.get(`/api/solr/schema/${selectedCollection}`, {
          headers: {
            'X-Solr-Url': activeServer.url,
            'X-Solr-Username': activeServer.username || '',
            'X-Solr-Password': activeServer.password || '',
          },
        })
        
        const schemaFields = response.data.schema.fields
          .filter((field: any) => field.indexed)
          .map((field: any) => field.name)
        
        setFields(schemaFields)
      } catch (error) {
        console.error('Error fetching fields:', error)
      }
    }

    fetchFields()
  }, [activeServer, selectedCollection])

  const handleSearch = async (page: number = 1) => {
    if (!activeServer || !selectedCollection) {
      toast({
        title: "Error",
        description: "Please select a collection to search",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Build facet fields from indexed fields
      const facetFields = fields.filter(field => 
        !field.includes('_text_') && !field.includes('_txt')
      )

      // Build search parameters
      const params = new URLSearchParams()
      params.append('q', query || '*:*')
      params.append('start', ((page - 1) * pageSize).toString())
      params.append('rows', pageSize.toString())

      // Add facet fields
      facetFields.forEach(field => params.append('facet.field', field))

      // Add filter queries
      Object.entries(selectedFilters).forEach(([field, values]) => {
        values.forEach(value => {
          params.append('fq', `${field}:"${value}"`)
        })
      })

      // Add sort if specified
      if (sortField) {
        params.append('sort', sortField)
      }

      const response = await axios.get(
        `/api/solr/collections/${selectedCollection}/data/search?${params.toString()}`,
        {
          headers: {
            'X-Solr-Url': activeServer.url,
            'X-Solr-Username': activeServer.username || '',
            'X-Solr-Password': activeServer.password || '',
          },
        }
      )

      setResults(response.data.docs)
      setTotalResults(response.data.numFound)
      setFacets(response.data.facets || {})
      setCurrentPage(page)
    } catch (error) {
      console.error('Error searching:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to perform search'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev }
      if (!newFilters[field]) {
        newFilters[field] = []
      }
      if (newFilters[field].includes(value)) {
        newFilters[field] = newFilters[field].filter(v => v !== value)
        if (newFilters[field].length === 0) {
          delete newFilters[field]
        }
      } else {
        newFilters[field] = [...newFilters[field], value]
      }
      return newFilters
    })
    handleSearch(1)
  }

  const handleFilterClear = (field?: string) => {
    if (field) {
      setSelectedFilters(prev => {
        const newFilters = { ...prev }
        delete newFilters[field]
        return newFilters
      })
    } else {
      setSelectedFilters({})
    }
    handleSearch(1)
  }

  if (!activeServer) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Search Console</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a server to use the search console.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Search Console</h1>

      <Card>
        <CardHeader>
          <CardTitle>Collection Selection</CardTitle>
          <CardDescription>
            Select a collection to search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger>
              <SelectValue placeholder="Select a collection" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((collection) => (
                <SelectItem key={collection} value={collection}>
                  {collection}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <SearchFilters
            facets={facets}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onFilterClear={handleFilterClear}
          />
          <QueryOptimizer 
            onQuerySelect={setQuery}
            fields={fields}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search</CardTitle>
              <CardDescription>
                Search across all documents in your collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SearchToolbar
                query={query}
                onQueryChange={setQuery}
                onSearch={() => handleSearch(1)}
                sortField={sortField}
                onSortChange={setSortField}
                fields={fields}
                loading={loading}
              />

              {error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <SearchResults
                  results={results}
                  fields={fields}
                  totalResults={totalResults}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  onPageChange={handleSearch}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}