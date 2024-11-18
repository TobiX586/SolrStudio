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
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"
import { useState } from "react"
import { useServersStore } from "@/lib/stores/servers"
import { Alert, AlertDescription } from "@/components/ui/alert"

const fieldFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
      message: "Name must start with a letter and contain only letters, numbers, and underscores",
    }),
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

export default function NewFieldPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  const form = useForm<z.infer<typeof fieldFormSchema>>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      name: "",
      type: "string",
      required: false,
      indexed: true,
      stored: true,
      multiValued: false,
    },
  })

  async function onSubmit(values: z.infer<typeof fieldFormSchema>) {
    if (!activeServer) {
      toast({
        title: "Error",
        description: "No server selected",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      await axios.post(`/api/solr/schema/${params.id}/fields`, values, {
        headers: {
          'X-Solr-Url': activeServer.url,
          'X-Solr-Username': activeServer.username || '',
          'X-Solr-Password': activeServer.password || '',
        },
      })

      toast({
        title: "Field Created",
        description: `Field "${values.name}" has been created successfully.`,
      })
      router.push(`/schemas/${params.id}`)
    } catch (error) {
      console.error('Error creating field:', error)
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to create field"
          : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!activeServer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/schemas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Add New Field</h1>
        </div>
        <Alert>
          <AlertDescription>
            Please select a server before creating a field.
          </AlertDescription>
        </Alert>
      </div>
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
        <h1 className="text-3xl font-bold">Add New Field</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Field Configuration</CardTitle>
          <CardDescription>
            Configure the properties for your new field
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
                    <FormLabel>Field Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., title" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique identifier for this field. Must start with a letter and contain only letters, numbers, and underscores.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      Creating Field
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Field
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