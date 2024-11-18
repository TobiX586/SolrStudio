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

    // Get collection stats using Luke handler
    const lukeResponse = await axios.get(
      `${baseUrl}/${params.collection}/admin/luke?wt=json&numTerms=0`,
      { headers }
    )

    const { index = {} } = lukeResponse.data
    
    return NextResponse.json({
      numDocs: index.numDocs || 0,
      maxDoc: index.maxDoc || 0,
      deletedDocs: index.deletedDocs || 0,
      indexSize: index.size || '0 bytes',
      lastModified: new Date().toISOString(),
    })
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message },
      { status: error.response?.status || 500 }
    )
  }
}