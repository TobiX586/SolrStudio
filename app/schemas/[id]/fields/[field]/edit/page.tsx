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
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"

const fieldFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  required: z.boolean().default(false),
  indexed: z.boolean().default(true),
  stored: z.boolean().default(true),
  multiValued: z.boolean().default(false),
})

const fieldTypes = [
  "string",
  "text_general",
  "int",
  "long",
  "float",
  "double",
  "date",
  "boolean",
]

export default function EditFieldPage({ 
  params 
}: { 
  params: { id: string; field: string } 
}) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof fieldFormSchema>>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      name: "",
      type: "",
      required: false,
      indexed: true,
      stored: true,
      multiValued: false,
    },
  })

  useEffect(() => {
    async function fetchField() {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.get(`/api/solr/schema/${params.id}`)
        const field = response.data.schema.fields.find(
          (f: any) => f.name === params.field
        )

        if (!field) {
          throw new Error("Field not found")
        }

        form.reset({
          name: field.name,
          type: field.type,
          required: field.required || false,
          indexed: field.indexed !== false,
          stored: field.stored !== false,
          multiValued: field.multiValued || false,
        })
      } catch (err) {
        console.error("Error fetching field:", err)
        setError("Failed to load field details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchField()
  }, [params.id, params.field, form])

  async function onSubmit(values: z.infer<typeof fieldFormSchema>) {
    try {
      setSaving(true)

      await axios.put(`/api/solr/schema/${params.id}/fields`, {
        ...values,
        name: params.field, // Keep original field name
      })

      toast({
        title: "Field Updated",
        description: "Field has been updated successfully.",
      })
      router.push(`/schemas/${params.id}`)
    } catch (error) {
      console.error('Error updating field:', error)
      toast({
        title: "Error",
        description: "Failed to update field. Please try again.",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/schemas/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Field</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Field Configuration</CardTitle>
          <CardDescription>
            Update the configuration for field "{params.field}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a field type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The data type of the field
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Required</FormLabel>
                      <FormDescription>
                        Field must have a value in all documents
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
                name="indexed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Indexed</FormLabel>
                      <FormDescription>
                        Field can be searched
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
                name="stored"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Stored</FormLabel>
                      <FormDescription>
                        Field value is retrievable
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
                name="multiValued"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Multi-Valued</FormLabel>
                      <FormDescription>
                        Field can contain multiple values
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