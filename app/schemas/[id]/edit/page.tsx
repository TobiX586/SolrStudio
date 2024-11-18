"use client"

import { useEffect, useState } from "react"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"

const schemaFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  uniqueKey: z.string().min(1, "Unique key field is required"),
})

interface Schema {
  id: string
  name: string
  description: string
  uniqueKey: string
  fields: any[]
  dynamicFields: any[]
  copyFields: any[]
}

export default function EditSchemaPage({ params }: { params: { id: string } }) {
  const [schema, setSchema] = useState<Schema | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof schemaFormSchema>>({
    resolver: zodResolver(schemaFormSchema),
    defaultValues: {
      name: "",
      description: "",
      uniqueKey: "",
    },
  })

  useEffect(() => {
    async function fetchSchema() {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.get(`/api/solr/schema/${params.id}`)
        const { schema: solrSchema } = response.data

        const schemaData = {
          id: params.id,
          name: params.id,
          description: solrSchema.description || `Schema for ${params.id} collection`,
          uniqueKey: solrSchema.uniqueKey || "id",
          fields: solrSchema.fields || [],
          dynamicFields: solrSchema.dynamicFields || [],
          copyFields: solrSchema.copyFields || [],
        }

        setSchema(schemaData)
        form.reset({
          name: schemaData.name,
          description: schemaData.description,
          uniqueKey: schemaData.uniqueKey,
        })
      } catch (err) {
        console.error("Error fetching schema:", err)
        setError("Failed to load schema details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchSchema()
    }
  }, [params.id, form])

  async function onSubmit(values: z.infer<typeof schemaFormSchema>) {
    try {
      setSaving(true)
      // In a real app, make an API call to update the schema
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Schema Updated",
        description: "Your changes have been saved successfully.",
      })
      router.push(`/schemas/${params.id}`)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update schema. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!schema) {
    return (
      <Alert>
        <AlertDescription>Schema not found.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/schemas/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Schema</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schema Details</CardTitle>
          <CardDescription>
            Update the basic information for your schema
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
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique name for your schema
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
                      The field that uniquely identifies each document
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-4">
                <Link href={`/schemas/${params.id}`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
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