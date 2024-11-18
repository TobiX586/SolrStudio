import { NextResponse } from 'next/server'
import axios from 'axios'

export async function DELETE(
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

    // Delete the collection using POST with action=DELETE
    const response = await axios.post(`${baseUrl}/admin/collections`, null, {
      params: {
        action: 'DELETE',
        name: params.collection,
        wt: 'json'
      },
      headers
    })

    if (response.data.responseHeader?.status !== 0) {
      throw new Error(response.data.error?.msg || 'Failed to delete collection')
    }

    return NextResponse.json({ 
      success: true,
      message: 'Collection deleted successfully'
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
    if (errorMsg.includes('not found')) {
      return NextResponse.json(
        { error: `Collection '${params.collection}' not found` },
        { status: 404 }
      )
    }
    if (errorMsg.includes('in use')) {
      return NextResponse.json(
        { error: 'Collection is currently in use. Please try again later.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: errorMsg },
      { status: error.response?.status || 500 }
    )
  }
}