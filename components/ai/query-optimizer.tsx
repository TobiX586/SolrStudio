"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Loader2, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAIStore } from "@/lib/stores/ai"
import { optimizeQuery } from "@/lib/ai"

interface QueryOptimizerProps {
  onQuerySelect: (query: string) => void
  fields: string[]
}

export function QueryOptimizer({ onQuerySelect, fields }: QueryOptimizerProps) {
  const [query, setQuery] = useState("")
  const [optimizing, setOptimizing] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const { config } = useAIStore()

  const handleOptimize = async () => {
    try {
      setOptimizing(true)
      const response = await optimizeQuery(query, fields, config)

      if (response.error) {
        throw new Error(response.error)
      }

      const { suggestions } = JSON.parse(response.text)
      setSuggestions(suggestions)

      toast({
        title: "Query Optimized",
        description: "AI has generated optimized query suggestions",
      })
    } catch (error) {
      console.error('Query optimization error:', error)
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "Failed to optimize query",
        variant: "destructive",
      })
    } finally {
      setOptimizing(false)
    }
  }

  if (!config.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Query Optimizer</span>
          </CardTitle>
          <CardDescription>
            AI features are currently disabled. Enable them in settings to use this feature.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>Query Optimizer</span>
        </CardTitle>
        <CardDescription>
          Get AI-powered suggestions to improve your search query performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your Solr query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="font-mono"
        />

        <Button
          className="w-full"
          onClick={handleOptimize}
          disabled={optimizing || !query}
        >
          {optimizing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Optimizing Query
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Optimize Query
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {suggestion.performance.improvement} faster
                      </Badge>
                      <Badge variant="outline">
                        Est. {suggestion.performance.estimated}
                      </Badge>
                    </div>
                    <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                      <code>{suggestion.query}</code>
                    </pre>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.explanation}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => onQuerySelect(suggestion.query)}
                    >
                      Use This Query
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}