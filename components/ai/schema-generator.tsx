"use client"

import { useState, useEffect } from "react"
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
import { Brain, Loader2, Wand } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAIStore } from "@/lib/stores/ai"
import { generateSchema, getSchemaExamples } from "@/lib/ai"

interface SchemaGeneratorProps {
  onSchemaGenerated: (schema: any) => void
}

export function SchemaGenerator({ onSchemaGenerated }: SchemaGeneratorProps) {
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState("")
  const [examples, setExamples] = useState("")
  const [generating, setGenerating] = useState(false)
  const [loadingExamples, setLoadingExamples] = useState(false)
  const [examplePrompts, setExamplePrompts] = useState<string[]>([])
  const { config } = useAIStore()

  useEffect(() => {
    async function loadExamples() {
      if (!config.enabled) return

      try {
        setLoadingExamples(true)
        const examples = await getSchemaExamples(config)
        setExamplePrompts(examples)
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

    loadExamples()
  }, [config])

  const handleGenerate = async () => {
    try {
      setGenerating(true)

      const response = await generateSchema(
        {
          description,
          requirements: requirements.split('\n').filter(Boolean),
          examples: examples.split('\n').filter(Boolean),
        },
        config
      )

      if (response.error) {
        throw new Error(response.error)
      }

      const schema = JSON.parse(response.text)
      onSchemaGenerated(schema)

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
      setGenerating(false)
    }
  }

  if (!config.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Schema Generator</span>
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
          <span>AI Schema Generator</span>
        </CardTitle>
        <CardDescription>
          Describe your data structure and requirements in natural language
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Description</h3>
          <Textarea
            placeholder="Describe your schema requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {loadingExamples ? (
            <div className="w-full text-center py-2">
              <Loader2 className="h-4 w-4 animate-spin inline-block" />
              <span className="ml-2">Loading examples...</span>
            </div>
          ) : (
            examplePrompts.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setDescription(example)}
              >
                {example}
              </Button>
            ))
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Requirements (optional)</h3>
          <Textarea
            placeholder="Enter requirements, one per line..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Example Documents (optional)</h3>
          <Textarea
            placeholder="Enter example documents, one per line..."
            value={examples}
            onChange={(e) => setExamples(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button
          className="w-full"
          onClick={handleGenerate}
          disabled={generating || !description}
        >
          {generating ? (
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
      </CardContent>
    </Card>
  )
}