import { RestClient } from 'okx-api'

let client: RestClient | null = null

export function getOkxClient(): RestClient | null {
  if (client) return client

  const apiKey = process.env.OKX_API_KEY
  const apiSecret = process.env.OKX_SECRET_KEY
  const apiPass = process.env.OKX_PASSPHRASE

  if (!apiKey || !apiSecret || !apiPass) {
    console.warn('OKX API credentials missing in environment variables. Falling back to public endpoints if available.')
    return null
  }

  client = new RestClient({
    apiKey,
    apiSecret,
    apiPass,
  })

  return client
}

// Backward compatibility wrapper, but ideally we should use getOkxClient() directly
export async function callOkxApi(method: 'GET' | 'POST', path: string, body: any = null) {
  const c = getOkxClient()
  if (!c) {
    console.warn('No OKX client available for request:', path)
    return null
  }

  try {
    if (method === 'GET') {
      // For okx-api, we might need to route through specific client methods or generic request
      // We will cast to any to use the generic request method if it's available or we just use specific methods in the calling code
      // We'll leave this as a basic wrapper that uses fetch if needed, but it's better to update the callers.
      console.warn('callOkxApi is deprecated, use getOkxClient() with native SDK methods instead.')
      return null;
    }
  } catch (error) {
    console.error(`Error calling OKX API via SDK at ${path}:`, error)
    return null
  }
}
