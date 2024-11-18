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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { useServersStore } from "@/lib/stores/servers"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"
import { useState } from "react"

const schemaFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .regex(/^[a-z][a-z0-9_]*$/, {
      message: "Name must start with a letter and contain only lowercase letters, numbers, and underscores",
    }),
  description: z.string().optional(),
  uniqueKey: z.string().min(1, "Unique key field is required"),
})

export default function NewSchemaPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  const form = useForm<z.infer<typeof schemaFormSchema>>({
    resolver: zodResolver(schemaFormSchema),
    defaultValues: {
      name: "",
      description: "",
      uniqueKey: "id",
    },
  })

  if (!activeServer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/schemas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Create New Schema</h1>
        </div>
        <Alert>
          <AlertDescription>
            Please select a server before creating a schema.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  async function onSubmit(values: z.infer<typeof schemaFormSchema>) {
    try {
      setIsCreating(true)

      await axios.post('/api/solr/collections', {
        name: values.name,
      }, {
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
        },
      })

      toast({
        title: "Schema Created",
        description: `Successfully created schema: ${values.name}`,
      })
      
      router.push("/schemas")
    } catch (error) {
      console.error('Error creating schema:', error)
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to create schema"
          : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/schemas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create New Schema</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schema Details</CardTitle>
          <CardDescription>
            Enter the basic information for your new Solr schema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schema Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., product_catalog" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique name for your schema. Must start with a letter and contain only lowercase letters, numbers, and underscores.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the purpose of this schema"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description to help others understand the schema's purpose
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="uniqueKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unique Key Field</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The field that uniquely identifies each document (default: id)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-4">
                <Link href="/schemas">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Schema
                    </>
                  ) : (
                    'Create Schema'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}