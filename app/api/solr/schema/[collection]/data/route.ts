import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(
  request: Request,
  { params }: { params: { collection: string } }
) {
  const baseUrl = request.headers.get('x-solr-url')
  const username = request.headers.get('x-solr-username')
  const password = request.headers.get('x-solr-password')
  const commitWithin = request.headers.get('x-commit-within') || '1000'

  if (!baseUrl) {
    return NextResponse.json(
      { error: 'Solr base URL is required' },
      { status: 400 }
    )
  }

  try {
    const data = await request.json()
    const documents = Array.isArray(data) ? data : [data]

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64')
      headers['Authorization'] = `Basic ${auth}`
    }

    // Add documents to Solr
    const response = await axios.post(
      `${baseUrl}/${params.collection}/update?commitWithin=${commitWithin}&wt=json`,
      documents,
      { headers }
    )

    if (response.data.responseHeader.status !== 0) {
      throw new Error(response.data.error?.msg || 'Failed to import documents')
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${documents.length} document(s)`,
    })
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Handle specific Solr error messages
    const errorMsg = error.response?.data?.error?.msg || error.message
    if (errorMsg.includes('missing required field')) {
      return NextResponse.json(
        { error: "Missing required field in document" },
        { status: 400 }
      )
    }
    if (errorMsg.includes('unknown field')) {
      return NextResponse.json(
        { error: "Document contains unknown fields" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: errorMsg },
      { status: error.response?.status || 500 }
    )
  }
}