import { NextResponse } from 'next/server'
import axios from 'axios'

export async function PUT(
  request: Request,
  { params }: { params: { collection: string; id: string } }
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
    const document = await request.json()
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64')
      headers['Authorization'] = `Basic ${auth}`
    }

    // Update document in Solr
    const response = await axios.post(
      `${baseUrl}/${params.collection}/update?commit=true&wt=json`,
      [document],
      { headers }
    )

    if (response.data.responseHeader.status !== 0) {
      throw new Error(response.data.error?.msg || 'Failed to update document')
    }

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
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