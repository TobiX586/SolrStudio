"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/lib/types"
import { Card } from "@/components/ui/card"

interface DynamicFormProps {
  fields: Field[]
  onSubmit: (data: Record<string, any>) => void
}

export function DynamicForm({ fields, onSubmit }: DynamicFormProps) {
  // Initialize form data with default values based on field types
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initialData: Record<string, any> = {}
    fields.forEach(field => {
      switch (field.type) {
        case "boolean":
          initialData[field.name] = false
          break
        case "int":
        case "long":
        case "float":
        case "double":
          initialData[field.name] = 0
          break
        default:
          initialData[field.name] = ""
      }
    })
    return initialData
  })

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const missingFields = fields
      .filter(field => field.required && !formData[field.name])
      .map(field => field.name)

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(", ")}`)
      return
    }

    onSubmit(formData)
  }

  const renderField = (field: Field) => {
    switch (field.type) {
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.name}
              checked={formData[field.name] || false}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
            <Label htmlFor={field.name}>{field.name}</Label>
          </div>
        )
      case "text_general":
        return (
          <Textarea
            id={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.name}`}
            required={field.required}
          />
        )
      case "int":
      case "long":
        return (
          <Input
            id={field.name}
            type="number"
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, parseInt(e.target.value))}
            placeholder={`Enter ${field.name}`}
            required={field.required}
          />
        )
      case "float":
      case "double":
        return (
          <Input
            id={field.name}
            type="number"
            step="0.01"
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value))}
            placeholder={`Enter ${field.name}`}
            required={field.required}
          />
        )
      case "date":
        return (
          <Input
            id={field.name}
            type="datetime-local"
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        )
      default:
        return (
          <Input
            id={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.name}`}
            required={field.required}
          />
        )
    }
  }

  // Filter out any non-regular fields
  const regularFields = fields.filter(field => 
    !field.name.includes('*') && // Exclude dynamic fields
    field.name !== '_root_' && // Exclude special fields
    field.name !== '_version_'
  )

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {regularFields.map((field) => (
          <div key={field.name} className="space-y-2">
            {field.type !== "boolean" && (
              <Label htmlFor={field.name} className="flex items-center">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {field.multiValued && (
                  <span className="ml-2 text-xs text-muted-foreground">(Multiple values allowed)</span>
                )}
              </Label>
            )}
            {renderField(field)}
          </div>
        ))}
        <div className="pt-4">
          <Button type="submit" className="w-full">Submit Document</Button>
        </div>
      </form>
    </Card>
  )
}