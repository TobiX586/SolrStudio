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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Brain, Loader2, Wand } from "lucide-react"
import { useAIStore } from "@/lib/stores/ai"
import { generateSchema, getSchemaExamples } from "@/lib/ai"

export default function AIAssistantPage() {
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingExamples, setLoadingExamples] = useState(false)
  const [examples, setExamples] = useState<string[]>([])
  const { config } = useAIStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function loadExamples() {
      if (!config.enabled) return

      try {
        setLoadingExamples(true)
        const examplePrompts = await getSchemaExamples(config)
        setExamples(examplePrompts)
      } catch (error) {
        console.error('Error loading examples:', error)
        toast({
          title: "Error",
          description: "Failed to load example prompts",
          variant: "destructive",
        })
      } finally {
        setLoadingExamples(false)
      }
    }

    if (mounted) {
      loadExamples()
    }
  }, [config, mounted])

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const response = await generateSchema(
        {
          description: query,
          requirements: [],
          examples: [],
        },
        config
      )

      if (response.error) {
        throw new Error(response.error)
      }

      setResult(response.text)

      toast({
        title: "Schema Generated",
        description: "AI has generated a schema based on your requirements",
      })
    } catch (error) {
      console.error('Schema generation error:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate schema",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  if (!config.enabled) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Features Disabled</span>
            </CardTitle>
            <CardDescription>
              AI features are currently disabled. Please enable them in settings to use this feature.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <Brain className="h-8 w-8" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schema Generator</CardTitle>
          <CardDescription>
            Describe your schema requirements and let AI generate an optimized schema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your schema requirements..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[100px]"
          />

          <div className="flex flex-wrap gap-2">
            {loadingExamples ? (
              <div className="w-full text-center py-2">
                <Loader2 className="h-4 w-4 animate-spin inline-block" />
                <span className="ml-2">Loading examples...</span>
              </div>
            ) : (
              examples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(example)}
                >
                  {example}
                </Button>
              ))
            )}
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || !query}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Schema
              </>
            ) : (
              <>
                <Wand className="mr-2 h-4 w-4" />
                Generate Schema
              </>
            )}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="mb-2 font-semibold">Generated Schema:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-auto">
                {result}
              </pre>
              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setResult("")}>
                  Clear
                </Button>
                <Button onClick={() => {
                  try {
                    const schema = JSON.parse(result)
                    // TODO: Implement schema import
                    toast({
                      title: "Schema Imported",
                      description: "The generated schema has been imported successfully.",
                    })
                  } catch (error) {
                    toast({
                      title: "Import Failed",
                      description: "Invalid schema format",
                      variant: "destructive",
                    })
                  }
                }}>
                  Import Schema
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}