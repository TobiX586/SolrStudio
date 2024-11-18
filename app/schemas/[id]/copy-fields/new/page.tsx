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

const copyFieldFormSchema = z.object({
  source: z.string().min(1, "Source field is required"),
  dest: z.string().min(1, "Destination field is required"),
  maxChars: z.number().optional(),
})

export default function NewCopyFieldPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof copyFieldFormSchema>>({
    resolver: zodResolver(copyFieldFormSchema),
    defaultValues: {
      source: "",
      dest: "",
      maxChars: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof copyFieldFormSchema>) {
    try {
      setSaving(true)

      await axios.post(`/api/solr/schema/${params.id}/copy-fields`, values)

      toast({
        title: "Copy Field Created",
        description: `Copy field from "${values.source}" to "${values.dest}" has been created successfully.`,
      })
      router.push(`/schemas/${params.id}`)
    } catch (error) {
      console.error('Error creating copy field:', error)
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to create copy field"
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
        <h1 className="text-3xl font-bold">Add Copy Field</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Copy Field Configuration</CardTitle>
          <CardDescription>
            Configure field value copying from source to destination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Field</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., title" {...field} />
                    </FormControl>
                    <FormDescription>
                      The field to copy from. Can be a specific field name or a dynamic field pattern.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Field</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., text" {...field} />
                    </FormControl>
                    <FormDescription>
                      The field to copy to. Must be an existing field.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxChars"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Characters</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Optional" 
                        {...field}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional limit on the number of characters to copy
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
                      Creating Copy Field
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Copy Field
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