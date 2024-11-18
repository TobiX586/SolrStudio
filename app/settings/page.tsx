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
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AISettings } from "@/components/settings/ai-settings"
import { toast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import { Brain, Moon, Settings, Sun } from "lucide-react"

const generalSettingsSchema = z.object({
  autoCommit: z.boolean().default(true),
  commitWithinMs: z.string().regex(/^\d+$/, "Must be a number").default("1000"),
  notifications: z.boolean().default(true),
  pageSize: z.string().regex(/^\d+$/, "Must be a number").default("10"),
})

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const form = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      autoCommit: true,
      commitWithinMs: "1000",
      notifications: true,
      pageSize: "10",
    },
  })

  async function onSubmit(values: z.infer<typeof generalSettingsSchema>) {
    // Save general settings
    localStorage.setItem('settings', JSON.stringify(values))
    
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Settings className="h-8 w-8" />
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="autoCommit"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto Commit</FormLabel>
                          <FormDescription>
                            Automatically commit changes to Solr
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
                    name="commitWithinMs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commit Within (ms)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" step="100" />
                        </FormControl>
                        <FormDescription>
                          Time in milliseconds to wait before committing changes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Notifications</FormLabel>
                          <FormDescription>
                            Show desktop notifications for important events
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
                    name="pageSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Page Size</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="1" max="100" />
                        </FormControl>
                        <FormDescription>
                          Number of items to show per page in lists and search results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <AISettings />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Theme</div>
                  <div className="text-sm text-muted-foreground">
                    Choose between light and dark mode
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}