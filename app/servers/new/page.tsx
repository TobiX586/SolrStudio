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
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { useServersStore } from "@/lib/stores/servers"
import { testSolrConnection } from "@/lib/solr"
import { useState } from "react"

const serverFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Must be a valid URL").min(1, "URL is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export default function NewServerPage() {
  const [testing, setTesting] = useState(false)
  const { addServer, setActiveServer } = useServersStore()
  const router = useRouter()

  const form = useForm<z.infer<typeof serverFormSchema>>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: "",
      url: "http://localhost:8983/solr",
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof serverFormSchema>) {
    try {
      setTesting(true)
      const server = {
        name: values.name,
        url: values.url,
        username: values.username,
        password: values.password,
      }
      
      await testSolrConnection(server)
      addServer(server)
      
      toast({
        title: "Server Added",
        description: `Successfully connected to ${values.name}`,
      })
      
      // Set as active server and redirect to dashboard
      const servers = useServersStore.getState().servers
      const newServer = servers[servers.length - 1]
      setActiveServer(newServer.id)
      router.push('/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect to server'
      toast({
        title: "Connection Failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add Solr Server</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Server Details</CardTitle>
          <CardDescription>
            Connect to a new Apache Solr server
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
                    <FormLabel>Server Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Production Solr" {...field} />
                    </FormControl>
                    <FormDescription>
                      A friendly name to identify this server
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solr URL</FormLabel>
                    <FormControl>
                      <Input placeholder="http://localhost:8983/solr" {...field} />
                    </FormControl>
                    <FormDescription>
                      The base URL of your Solr server
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="solr" {...field} />
                      </FormControl>
                      <FormDescription>
                        Basic auth username
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="SolrRocks" {...field} />
                      </FormControl>
                      <FormDescription>
                        Basic auth password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <Link href="/">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={testing}>
                  {testing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing Connection
                    </>
                  ) : (
                    'Add Server'
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