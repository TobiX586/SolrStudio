"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SolrSchema, Field, DynamicField, CopyField } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SchemaViewProps {
  schema: SolrSchema
}

export function SchemaView({ schema }: SchemaViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schema Overview</CardTitle>
          <CardDescription>
            Basic information about the schema configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Version
              </div>
              <div>{schema.version}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Unique Key Field
              </div>
              <div>{schema.uniqueKeyField}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="fields">
        <TabsList>
          <TabsTrigger value="fields">Fields ({schema.fields.length})</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic Fields ({schema.dynamicFields.length})</TabsTrigger>
          <TabsTrigger value="copy">Copy Fields ({schema.copyFields.length})</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[500px] mt-4">
          <TabsContent value="fields" className="space-y-4">
            {schema.fields.map((field: Field) => (
              <Card key={field.name}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{field.name}</span>
                    <Badge variant="secondary">{field.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {field.required && <Badge>Required</Badge>}
                    {field.indexed && <Badge variant="outline">Indexed</Badge>}
                    {field.stored && <Badge variant="outline">Stored</Badge>}
                    {field.multiValued && <Badge variant="outline">Multi-Valued</Badge>}
                    {field.docValues && <Badge variant="outline">Doc Values</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="dynamic" className="space-y-4">
            {schema.dynamicFields.map((field: DynamicField) => (
              <Card key={field.name}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{field.pattern}</span>
                    <Badge variant="secondary">{field.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {field.indexed && <Badge variant="outline">Indexed</Badge>}
                    {field.stored && <Badge variant="outline">Stored</Badge>}
                    {field.multiValued && <Badge variant="outline">Multi-Valued</Badge>}
                    {field.docValues && <Badge variant="outline">Doc Values</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="copy" className="space-y-4">
            {schema.copyFields.map((field: CopyField, index: number) => (
              <Card key={`${field.source}-${field.dest}-${index}`}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {field.source} → {field.dest}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {field.maxChars && (
                    <Badge variant="outline">
                      Max Characters: {field.maxChars}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}