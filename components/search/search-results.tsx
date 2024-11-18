"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface SearchResultsProps {
  results: any[]
  fields: string[]
  totalResults: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  highlighting?: Record<string, Record<string, string[]>>
}

export function SearchResults({
  results,
  fields,
  totalResults,
  currentPage,
  pageSize,
  onPageChange,
  highlighting,
}: SearchResultsProps) {
  const totalPages = Math.ceil(totalResults / pageSize)

  const renderHighlightedValue = (doc: any, field: string) => {
    const highlights = highlighting?.[doc.id]?.[field]
    if (highlights?.length > 0) {
      return <div dangerouslySetInnerHTML={{ __html: highlights[0] }} />
    }
    return Array.isArray(doc[field]) ? (
      <div className="flex flex-wrap gap-1">
        {doc[field].map((value: any, i: number) => (
          <Badge key={i} variant="outline">
            {value}
          </Badge>
        ))}
      </div>
    ) : (
      doc[field]
    )
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map((field) => (
                <TableHead key={field}>{field}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={fields.length}
                  className="text-center h-24"
                >
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              results.map((doc, index) => (
                <TableRow key={doc.id || index}>
                  {fields.map((field) => (
                    <TableCell key={field}>
                      {renderHighlightedValue(doc, field)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}