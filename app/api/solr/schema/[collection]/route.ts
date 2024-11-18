import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(
  request: Request,
  { params }: { params: { collection: string } }
) {
  const baseUrl = request.headers.get('x-solr-url')
  const username = request.headers.get('x-solr-username')
  const password = request.headers.get('x-solr-password')

  if (!baseUrl) {
    return NextResponse.json(
      { error: 'Solr base URL is required' },
      { status: 400 }
    )
  }

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }

    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64')
      headers['Authorization'] = `Basic ${auth}`
    }

    // Get schema using the Schema API
    const response = await axios.get(`${baseUrl}/${params.collection}/schema?wt=json`, {
      headers,
      timeout: 5000,
    })

    // Transform the response to match our schema structure
    const solrSchema = response.data.schema
    const schema = {
      name: params.collection,
      version: solrSchema.version || 1.0,
      uniqueKeyField: solrSchema.uniqueKey || "id",
      fieldTypes: solrSchema.fieldTypes || [],
      fields: solrSchema.fields || [],
      dynamicFields: solrSchema.dynamicFields || [],
      copyFields: solrSchema.copyFields || [],
    }
    
    return NextResponse.json({ schema })
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Connection refused. Is Solr running?' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: error.message },
      { status: error.response?.status || 500 }
    )
  }
}