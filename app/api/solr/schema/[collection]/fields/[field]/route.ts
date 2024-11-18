import { NextResponse } from 'next/server'
import axios from 'axios'

export async function DELETE(
  request: Request,
  { params }: { params: { collection: string; field: string } }
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
      'Content-Type': 'application/json',
    }

    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64')
      headers['Authorization'] = `Basic ${auth}`
    }

    // Delete the field from the schema
    const deleteResponse = await axios.post(
      `${baseUrl}/${params.collection}/schema`,
      {
        "delete-field": { name: params.field }
      },
      { headers }
    )

    // If field was deleted successfully, reload the core
    if (deleteResponse.data.responseHeader?.status === 0) {
      try {
        await axios.get(
          `${baseUrl}/admin/cores?action=RELOAD&core=${params.collection}&wt=json`,
          { headers }
        )
      } catch (reloadError) {
        console.error('Error reloading core:', reloadError)
        return NextResponse.json({
          success: true,
          warning: "Field was deleted but core reload failed. Changes may not be visible until core is reloaded.",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Field deleted and core reloaded successfully"
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