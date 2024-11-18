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
    const { master } = await request.json()
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64')
      headers['Authorization'] = `Basic ${auth}`
    }

    // Enable replication by updating solrconfig.xml
    const response = await axios.post(
      `${baseUrl}/${params.core}/config`,
      {
        'set-property': {
          name: master ? 'replicator' : 'replicator.slave',
          value: {
            class: master
              ? 'solr.MasterReplicationHandler'
              : 'solr.SlaveReplicationHandler',
            config: master
              ? { replicateAfter: ['commit', 'optimize'] }
              : { masterUrl: `${baseUrl}/${params.core}/replication` },
          },
        },
      },
      { headers }
    )

    if (response.data.responseHeader?.status !== 0) {
      throw new Error(response.data.error?.msg || 'Failed to enable replication')
    }

    // Reload the core to apply changes
    await axios.get(`${baseUrl}/admin/cores`, {
      params: {
        action: 'RELOAD',
        core: params.core,
        wt: 'json'
      },
      headers,
    })

    return NextResponse.json({
      success: true,
      message: `Replication enabled as ${master ? 'master' : 'slave'}`,
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