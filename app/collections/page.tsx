"use client"

import { CollectionList } from "@/components/collections/collection-list"
import { useCollections } from "@/hooks/use-collections"

export default function CollectionsPage() {
  const { collections, loading, error } = useCollections()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Collections</h1>
      <CollectionList
        collections={collections}
        loading={loading}
        error={error}
      />
    </div>
  )
}