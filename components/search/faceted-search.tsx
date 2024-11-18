"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

interface SearchFiltersProps {
  facets: Record<string, Record<string, number>>
  selectedFilters: Record<string, string[]>
  onFilterChange: (field: string, value: string) => void
  onFilterClear: (field?: string) => void
}

export function SearchFilters({
  facets,
  selectedFilters,
  onFilterChange,
  onFilterClear,
}: SearchFiltersProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filters</CardTitle>
        {Object.keys(selectedFilters).length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onFilterClear()}>
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(facets).map(([field, values]) => (
              <div key={field}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold capitalize">
                    {field.replace(/_/g, ' ')}
                  </h4>
                  {selectedFilters[field]?.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFilterClear(field)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(values).map(([value, count]) => {
                    const isSelected = selectedFilters[field]?.includes(value)
                    return (
                      <Badge
                        key={value}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => onFilterChange(field, value)}
                      >
                        {value} ({count})
                      </Badge>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}