import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(
  request: Request,
  { params }: { params: { core: string } }
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

    const response = await axios.get(
      `${baseUrl}/${params.core}/replication?command=fetchindex&wt=json`,
      { headers }
    )

    if (response.data.responseHeader?.status !== 0) {
      throw new Error(response.data.error?.msg || 'Failed to start replication')
    }

    return NextResponse.json({
      success: true,
      message: 'Replication process started',
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