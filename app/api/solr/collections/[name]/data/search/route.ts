import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || '*:*'
  const facetFields = searchParams.getAll('facet.field')
  const fq = searchParams.getAll('fq')
  const sort = searchParams.get('sort')
  const start = searchParams.get('start') || '0'
  const rows = searchParams.get('rows') || '10'
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

    // Build Solr query parameters
    const solrParams = new URLSearchParams()
    solrParams.append('q', query)
    solrParams.append('wt', 'json')
    solrParams.append('start', start)
    solrParams.append('rows', rows)

    // Add faceting parameters if facet fields are specified
    if (facetFields.length > 0) {
      solrParams.append('facet', 'true')
      facetFields.forEach(field => solrParams.append('facet.field', field))
      solrParams.append('facet.mincount', '1')
    }

    // Add filter queries if specified
    fq.forEach(filter => solrParams.append('fq', filter))

    // Add sort parameter if specified
    if (sort) {
      solrParams.append('sort', sort)
    }

    // Add highlighting
    solrParams.append('hl', 'true')
    solrParams.append('hl.fl', '*')
    solrParams.append('hl.simple.pre', '<em>')
    solrParams.append('hl.simple.post', '</em>')

    // Make request to Solr
    const response = await axios.get(
      `${baseUrl}/${params.name}/select?${solrParams.toString()}`,
      { headers }
    )

    return NextResponse.json({
      docs: response.data.response.docs,
      numFound: response.data.response.numFound,
      start: response.data.response.start,
      facets: response.data.facet_counts?.facet_fields || {},
      highlighting: response.data.highlighting || {},
    })
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message },
      { status: error.response?.status || 500 }
    )
  }
}