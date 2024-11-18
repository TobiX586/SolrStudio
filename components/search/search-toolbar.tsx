"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, SlidersHorizontal } from "lucide-react"

interface SearchToolbarProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  sortField: string
  onSortChange: (field: string) => void
  fields: string[]
  loading?: boolean
}

export function SearchToolbar({
  query,
  onQueryChange,
  onSearch,
  sortField,
  onSortChange,
  fields,
  loading,
}: SearchToolbarProps) {
  return (
    <div className="flex space-x-2">
      <div className="flex-1">
        <Input
          placeholder="Enter search query (e.g., *:* for all documents)"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch()
            }
          }}
        />
      </div>

      <Select value={sortField} onValueChange={onSortChange}>
        <SelectTrigger className="w-[200px]">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="relevance">Relevance</SelectItem>
          {fields.map((field) => (
            <>
              <SelectItem key={`${field}-asc`} value={`${field} asc`}>
                {field} (A-Z)
              </SelectItem>
              <SelectItem key={`${field}-desc`} value={`${field} desc`}>
                {field} (Z-A)
              </SelectItem>
            </>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={onSearch} disabled={loading}>
        <Search className="h-4 w-4" />
      </Button>
    </div>
  )
}