import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: Request) {
  const solrUrl = request.headers.get('x-solr-url')?.replace(/^https:/, 'http:')
  const username = request.headers.get('x-solr-username')
  const password = request.headers.get('x-solr-password')

  if (!solrUrl) {
    return NextResponse.json(
      { error: 'Solr URL is required' },
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

    const response = await axios.get(`${solrUrl}/admin/info/system?wt=json`, {
      headers,
      timeout: 5000,
    })
    
    return NextResponse.json(response.data)
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