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

    const response = await axios.get(`${baseUrl}/admin/cores?action=STATUS&wt=json`, {
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
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Core name is required' },
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

    const response = await axios.get(`${baseUrl}/admin/cores`, {
      params: {
        action: 'CREATE',
        name,
        instanceDir: name,
        config: 'solrconfig.xml',
        dataDir: 'data',
        wt: 'json'
      },
      headers,
    })

    if (response.data.responseHeader?.status !== 0) {
      throw new Error(response.data.error?.msg || 'Failed to create core')
    }

    return NextResponse.json({
      success: true,
      message: `Core "${name}" created successfully`,
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