"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatBytes } from "@/lib/utils"

interface IndexStats {
  collection: string
  numDocs: number
  sizeInBytes: number
  lastModified: string
}

interface IndexStatsProps {
  data: IndexStats[]
}

export function IndexStats({ data }: IndexStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Index Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="collection" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "sizeInBytes" ? formatBytes(value) : value,
                  name === "sizeInBytes" ? "Size" : "Documents"
                ]}
              />
              <Bar
                yAxisId="left"
                dataKey="numDocs"
                name="Documents"
                fill="#8884d8"
              />
              <Bar
                yAxisId="right"
                dataKey="sizeInBytes"
                name="Size"
                fill="#82ca9d"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}