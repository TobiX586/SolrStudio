import axios from 'axios'
import { SolrServer } from './types'

export const createSolrClient = (server: SolrServer) => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }

  if (server.username && server.password) {
    const auth = Buffer.from(`${server.username}:${server.password}`).toString('base64')
    headers['Authorization'] = `Basic ${auth}`
  }

  // Ensure URL uses http protocol
  const baseURL = server.url.replace(/^https:/, 'http:')

  return axios.create({
    baseURL,
    headers,
    timeout: 5000,
  })
}

export async function testSolrConnection(server: SolrServer): Promise<void> {
  if (!server.url) {
    throw new Error('Solr URL is required')
  }

  try {
    // Ensure URL uses http protocol
    const url = server.url.replace(/^https:/, 'http:')
    const response = await axios.get('/api/solr/test', {
      headers: {
        'X-Solr-Url': url,
        'X-Solr-Username': server.username || '',
        'X-Solr-Password': server.password || '',
      },
    })

    if (!response.data.lucene || !response.data.solr_home) {
      throw new Error('Invalid Solr response - are you sure this is a Solr server?')
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your username and password.')
      }
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        throw new Error(
          'Connection refused: Could not connect to Solr server.\n\n' +
          'Please check:\n' +
          '1. Solr is running and accessible\n' +
          '2. The port number is correct (default is 8983)\n' +
          '3. No firewall is blocking the connection\n\n' +
          'Common solutions:\n' +
          '• Start Solr if it\'s not running\n' +
          '• Check if Solr is running on the expected port'
        )
      }

      if (error.response?.status === 404) {
        throw new Error(
          'Not Found: The Solr endpoint could not be found.\n\n' +
          'Please check:\n' +
          '1. The URL path is correct\n' +
          '2. Solr is properly installed and configured'
        )
      }

      throw new Error(`Solr server error: ${error.response?.statusText || error.message}`)
    }
    throw error
  }
}

export async function fetchSolrCollections(server: SolrServer): Promise<string[]> {
  try {
    // Ensure URL uses http protocol
    const url = server.url.replace(/^https:/, 'http:')
    const response = await axios.get('/api/solr/collections', {
      headers: {
        'X-Solr-Url': url,
        'X-Solr-Username': server.username || '',
        'X-Solr-Password': server.password || '',
      },
    })
    return response.data.collections || []
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your credentials.')
      }
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to Solr server. Please check if Solr is running and accessible.')
      }
    }
    console.error('Error fetching collections:', error)
    throw error
  }
}

export async function fetchFullSchema(server: SolrServer, collection: string) {
  try {
    // Ensure URL uses http protocol
    const url = server.url.replace(/^https:/, 'http:')
    const response = await axios.get(`/api/solr/schema/${collection}`, {
      headers: {
        'X-Solr-Url': url,
        'X-Solr-Username': server.username || '',
        'X-Solr-Password': server.password || '',
      },
    })
    const { schema } = response.data
    
    return {
      name: collection,
      description: schema.description || `Schema for ${collection} collection`,
      lastModified: new Date().toISOString(),
      fields: schema.fields || [],
      dynamicFields: schema.dynamicFields || [],
      copyFields: schema.copyFields || [],
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('Authentication failed. Please check your credentials.')
    }
    console.error(`Error fetching schema for ${collection}:`, error)
    throw error
  }
}