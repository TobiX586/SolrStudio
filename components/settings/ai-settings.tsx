"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAIStore } from "@/lib/stores/ai"
import axios from "axios"

const aiSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  provider: z.enum(["openrouter", "ollama"]).default("openrouter"),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  model: z.string().optional(),
})

export function AISettings() {
  const { config, updateConfig } = useAIStore()
  const [testingConnection, setTestingConnection] = useState(false)

  const form = useForm<z.infer<typeof aiSettingsSchema>>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: {
      enabled: config.enabled,
      provider: config.provider,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || "http://localhost:11434",
      model: config.model,
    },
  })

  const provider = form.watch("provider")

  const testConnection = async () => {
    try {
      setTestingConnection(true)
      
      if (provider === "ollama") {
        const baseUrl = form.getValues("baseUrl") || "http://localhost:11434"
        await axios.get(`${baseUrl}/api/tags`)
        
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Ollama server",
        })
      } else {
        // Test OpenRouter connection
        const response = await axios.get("https://openrouter.ai/api/v1/models", {
          headers: {
            Authorization: `Bearer ${form.getValues("apiKey")}`,
          },
        })
        
        if (response.status === 200) {
          toast({
            title: "Connection Successful",
            description: "Successfully authenticated with OpenRouter",
          })
        }
      }
    } catch (error) {
      console.error('Connection test error:', error)
      toast({
        title: "Connection Failed",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Could not connect to AI service"
          : "Failed to test connection",
        variant: "destructive",
      })
    } finally {
      setTestingConnection(false)
    }
  }

  async function onSubmit(values: z.infer<typeof aiSettingsSchema>) {
    updateConfig(values)
    
    toast({
      title: "Settings Updated",
      description: "AI settings have been saved successfully.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
        <CardDescription>
          Configure AI services for schema generation and query optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable AI Features</FormLabel>
                    <FormDescription>
                      Use AI for schema generation and query optimization
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Provider</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="openrouter">OpenRouter</SelectItem>
                      <SelectItem value="ollama">Ollama (Local)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose between OpenRouter (cloud) or Ollama (local) for AI services
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {provider === "openrouter" && (
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your OpenRouter API key"
                      />
                    </FormControl>
                    <FormDescription>
                      Your OpenRouter API key for authentication
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {provider === "ollama" && (
              <FormField
                control={form.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ollama URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="http://localhost:11434"
                      />
                    </FormControl>
                    <FormDescription>
                      The URL where your Ollama server is running
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {provider === "openrouter" ? (
                        <>
                          <SelectItem value="mistralai/mistral-7b-instruct">Mistral 7B</SelectItem>
                          <SelectItem value="anthropic/claude-2">Claude 2</SelectItem>
                          <SelectItem value="google/palm-2-chat-bison">PaLM 2</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="mistral">Mistral</SelectItem>
                          <SelectItem value="llama2">Llama 2</SelectItem>
                          <SelectItem value="codellama">CodeLlama</SelectItem>
                          <SelectItem value="qwen2.5-coder-ottodev:7b">Qwen 2.5 Coder</SelectItem>
                          <SelectItem value="deepseel-coder-v2-extended:latest">DeepSeeL Coder V2</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the AI model to use for generation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={testingConnection || !form.getValues("enabled")}
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}