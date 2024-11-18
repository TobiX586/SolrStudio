"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImportPreviewProps {
  data: any[]
  loading: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function ImportPreview({ data, loading, error, onConfirm, onCancel }: ImportPreviewProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data.length) {
    return (
      <Alert>
        <AlertDescription>No data to preview</AlertDescription>
      </Alert>
    )
  }

  const columns = Object.keys(data[0])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Data Preview</span>
          <Badge variant="secondary">{data.length} records</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 5).map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      {typeof row[column] === 'object'
                        ? JSON.stringify(row[column])
                        : String(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Import Data
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}