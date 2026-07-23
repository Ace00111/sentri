import { RestClient } from 'okx-api';

let client: RestClient | null = null;

export function getOkxClient(): RestClient | null {
  if (client) return client;

  const apiKey = process.env.OKX_API_KEY;
  const apiSecret = process.env.OKX_SECRET_KEY;
  const apiPass = process.env.OKX_PASSPHRASE;

  if (!apiKey || !apiSecret || !apiPass) {
    console.warn('OKX API credentials missing in environment variables. Falling back to public endpoints if available.');
    return null;
  }

  client = new RestClient({
    apiKey,
    apiSecret,
    apiPass,
  });

  return client;
}

export async function callOkxApi(_method: 'GET' | 'POST', path: string, _body: unknown = null) {
  const c = getOkxClient();
  if (!c) {
    console.warn('No OKX client available for request:', path);
    return null;
  }
}
