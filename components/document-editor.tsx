"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Field {
  name: string
  type: string
  value?: string
}

interface NestedDocument {
  fields: Field[]
  children: NestedDocument[]
}

interface DocumentEditorProps {
  fields: Field[]
  onSave: (document: NestedDocument) => void
}

export function DocumentEditor({ fields = [], onSave }: DocumentEditorProps) {
  const [document, setDocument] = useState<NestedDocument>({
    fields: [
      { name: "id", type: "string" },
      ...fields.filter(f => f.name !== "id").map(f => ({ ...f, type: f.type || "string" }))
    ],
    children: []
  })

  const handleFieldChange = (fieldName: string, value: string) => {
    setDocument(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.name === fieldName ? { ...field, value } : field
      )
    }))
  }

  const handleChildFieldChange = (childIndex: number, fieldName: string, value: string) => {
    setDocument(prev => ({
      ...prev,
      children: prev.children.map((child, i) =>
        i === childIndex
          ? {
              ...child,
              fields: child.fields.map(field =>
                field.name === fieldName ? { ...field, value } : field
              )
            }
          : child
      )
    }))
  }

  const handleAddChildDocument = () => {
    setDocument(prev => ({
      ...prev,
      children: [
        ...prev.children,
        {
          fields: [
            { name: "id", type: "string" },
            ...fields
              .filter(f => f.name !== "id")
              .map(f => ({ ...f, type: f.type || "string" }))
          ],
          children: []
        }
      ]
    }))
  }

  const handleRemoveChildDocument = (index: number) => {
    setDocument(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    onSave(document)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parent Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {document.fields.map((field) => (
            <div key={field.name} className="grid gap-2">
              <Label htmlFor={field.name}>{field.name}</Label>
              <Input
                id={field.name}
                value={field.value || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={`Enter ${field.name}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Child Documents</h3>
          <Button onClick={handleAddChildDocument}>
            <Plus className="h-4 w-4 mr-2" />
            Add Child Document
          </Button>
        </div>

        {document.children.map((child, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Child Document {index + 1}</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveChildDocument(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {child.fields.map((field) => (
                <div key={field.name} className="grid gap-2">
                  <Label htmlFor={`${index}-${field.name}`}>
                    {field.name}
                  </Label>
                  <Input
                    id={`${index}-${field.name}`}
                    value={field.value || ""}
                    onChange={(e) =>
                      handleChildFieldChange(index, field.name, e.target.value)
                    }
                    placeholder={`Enter ${field.name}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Document</Button>
      </div>
    </div>
  )
}