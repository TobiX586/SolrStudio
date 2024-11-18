"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useServersStore } from "@/lib/stores/servers"
import axios from "axios"

interface DocumentEditDialogProps {
  schemaId: string
  document: Record<string, any>
  open: boolean
  onOpenChange: (open: boolean) => void
  onDocumentUpdated: () => void
}

export function DocumentEditDialog({
  schemaId,
  document,
  open,
  onOpenChange,
  onDocumentUpdated,
}: DocumentEditDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>(document)
  const [saving, setSaving] = useState(false)
  const { servers, activeServerId } = useServersStore()
  const activeServer = servers.find(s => s.id === activeServerId)

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleSave = async () => {
    if (!activeServer) {
      toast({
        title: "Error",
        description: "No server selected",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      await axios.put(
        `/api/solr/schema/${schemaId}/data/${document.id}`,
        formData,
        {
          headers: {
            'X-Solr-Url': activeServer.url,
            'X-Solr-Username': activeServer.username || '',
            'X-Solr-Password': activeServer.password || '',
          },
        }
      )

      toast({
        title: "Success",
        description: "Document updated successfully",
      })

      onDocumentUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating document:', error)
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data?.error || "Failed to update document"
          : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const fields = Object.entries(document).filter(
    ([key]) => key !== '_version_' && !key.startsWith('_') && !key.endsWith('_')
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>
            Update the document fields below
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {fields.map(([fieldName, fieldValue]) => (
            <div key={fieldName} className="grid gap-2">
              <Label htmlFor={fieldName}>{fieldName}</Label>
              <Input
                id={fieldName}
                value={formData[fieldName] || ''}
                onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                disabled={fieldName === 'id'} // Prevent editing the ID field
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}