import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: Request) {
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

    // Get list of collections using the admin API
    const response = await axios.get(`${baseUrl}/admin/collections?action=LIST&wt=json`, {
      headers,
      timeout: 5000,
    })
    
    return NextResponse.json({
      collections: response.data.collections || []
    })
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

export async function POST(request: Request) {
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
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      )
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }

    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64')
      headers['Authorization'] = `Basic ${auth}`
    }

    // Check if collection exists
    const listResponse = await axios.get(`${baseUrl}/admin/collections?action=LIST&wt=json`, {
      headers,
    })

    if (listResponse.data.collections?.includes(name)) {
      return NextResponse.json(
        { error: `Collection '${name}' already exists` },
        { status: 400 }
      )
    }

    // Create collection
    const createResponse = await axios.get(`${baseUrl}/admin/collections`, {
      params: {
        action: 'CREATE',
        name,
        'collection.configName': '_default',
        numShards: 1,
        replicationFactor: 1,
        maxShardsPerNode: 1,
        wt: 'json',
      },
      headers,
    })

    if (createResponse.data.responseHeader?.status !== 0) {
      throw new Error(createResponse.data.error?.msg || 'Failed to create collection')
    }

    return NextResponse.json({
      success: true,
      message: `Collection '${name}' created successfully`,
    })
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: error.response?.data?.error?.msg || error.message },
      { status: error.response?.status || 500 }
    )
  }
}