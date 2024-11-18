"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus } from "lucide-react"

interface SearchCondition {
  field: string
  operator: string
  value: string
}

interface AdvancedSearchProps {
  fields: string[]
  onSearch: (query: string) => void
}

export function AdvancedSearch({ fields, onSearch }: AdvancedSearchProps) {
  const [conditions, setConditions] = useState<SearchCondition[]>([
    { field: fields[0], operator: ":", value: "" }
  ])

  const operators = [":", ":*", ":[* TO *]", ":[* TO", ":TO *]"]

  const addCondition = () => {
    setConditions([...conditions, { field: fields[0], operator: ":", value: "" }])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, field: keyof SearchCondition, value: string) => {
    setConditions(conditions.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    ))
  }

  const buildQuery = () => {
    return conditions
      .filter(c => c.value.trim() || c.operator === ":[* TO *]")
      .map(c => `${c.field}${c.operator}${c.value}`)
      .join(" AND ")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditions.map((condition, index) => (
          <div key={index} className="flex space-x-2">
            <Select
              value={condition.field}
              onValueChange={(value) => updateCondition(index, "field", value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={condition.operator}
              onValueChange={(value) => updateCondition(index, "operator", value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op} value={op}>
                    {op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={condition.value}
              onChange={(e) => updateCondition(index, "value", e.target.value)}
              placeholder="Enter value"
              className="flex-1"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => removeCondition(index)}
              disabled={conditions.length === 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={addCondition}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>

          <Button onClick={() => onSearch(buildQuery())}>
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}