import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(
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
    const body = await request.json()
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64')
      headers['Authorization'] = `Basic ${auth}`
    }
    
    // First, add the field to the schema
    const addFieldResponse = await axios.post(
      `${baseUrl}/${params.collection}/schema`,
      {
        "add-field": body
      },
      { headers }
    )

    // If field was added successfully, reload the core
    if (addFieldResponse.data.responseHeader?.status === 0) {
      try {
        await axios.get(
          `${baseUrl}/admin/cores?action=RELOAD&core=${params.collection}&wt=json`,
          { headers }
        )
      } catch (reloadError) {
        console.error('Error reloading core:', reloadError)
        return NextResponse.json({
          success: true,
          warning: "Field was added but core reload failed. Changes may not be visible until core is reloaded.",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Field added and core reloaded successfully"
    })
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
    const errorMsg = error.response?.data?.error?.msg || error.message
    if (errorMsg.includes('Field id already exists')) {
      return NextResponse.json(
        { error: "A field with this name already exists" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: errorMsg },
      { status: error.response?.status || 500 }
    )
  }
}

export async function PUT(
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
    const body = await request.json()
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64')
      headers['Authorization'] = `Basic ${auth}`
    }
    
    // Update the field in the schema
    const updateFieldResponse = await axios.post(
      `${baseUrl}/${params.collection}/schema`,
      {
        "replace-field": body
      },
      { headers }
    )

    // If field was updated successfully, reload the core
    if (updateFieldResponse.data.responseHeader?.status === 0) {
      try {
        await axios.get(
          `${baseUrl}/admin/cores?action=RELOAD&core=${params.collection}&wt=json`,
          { headers }
        )
      } catch (reloadError) {
        console.error('Error reloading core:', reloadError)
        return NextResponse.json({
          success: true,
          warning: "Field was updated but core reload failed. Changes may not be visible until core is reloaded.",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Field updated and core reloaded successfully"
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