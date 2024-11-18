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

const dynamicFieldFormSchema = z.object({
  name: z.string()
    .min(1, "Pattern is required")
    .regex(/^[*]?[a-zA-Z0-9_]+[*]?$/, {
      message: "Pattern must contain only letters, numbers, underscores, and wildcards (*)",
    }),
  type: z.string().min(1, "Type is required"),
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

export default function NewDynamicFieldPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof dynamicFieldFormSchema>>({
    resolver: zodResolver(dynamicFieldFormSchema),
    defaultValues: {
      name: "*_t",
      type: "text_general",
      indexed: true,
      stored: true,
      multiValued: false,
    },
  })

  async function onSubmit(values: z.infer<typeof dynamicFieldFormSchema>) {
    try {
      setSaving(true)

      await axios.post(`/api/solr/schema/${params.id}/dynamic-fields`, values)

      toast({
        title: "Dynamic Field Created",
        description: `Dynamic field pattern "${values.name}" has been created successfully.`,
      })
      router.push(`/schemas/${params.id}`)
    } catch (error) {
      console.error('Error creating dynamic field:', error)
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to create dynamic field"
          : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/schemas/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add Dynamic Field</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dynamic Field Configuration</CardTitle>
          <CardDescription>
            Configure a pattern-based dynamic field
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
                    <FormLabel>Pattern</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., *_t or prefix_*" {...field} />
                    </FormControl>
                    <FormDescription>
                      A pattern using wildcards (*) to match field names. For example, "*_t" matches all fields ending in "_t".
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
                      The data type for fields matching this pattern
                    </FormDescription>
                    <FormMessage />
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
                        Fields can be searched
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
                        Field values are retrievable
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
                        Fields can contain multiple values
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
                      Creating Dynamic Field
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Dynamic Field
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