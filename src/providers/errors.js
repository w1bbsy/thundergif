// Why a Provider request failed, in the terms the user needs: their key, the hourly limit, or
// the connection.

/** @typedef {'rejected' | 'limit' | 'unreachable'} FailureKind */

export class ProviderError extends Error {
  /**
   * @param {FailureKind} kind
   * @param {string} message
   */
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

/**
 * Fetches a Provider URL, turning every failure into a ProviderError.
 *
 * @param {typeof globalThis.fetch} fetch
 * @param {URL} url
 * @param {(response: Response) => boolean} keyRejected how this Provider signals a bad key
 * @returns {Promise<any>} the parsed body
 */
export async function fetchFromProvider(fetch, url, keyRejected) {
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new ProviderError('unreachable', String(error));
  }
  if (keyRejected(response)) throw new ProviderError('rejected', `Key rejected (${response.status})`);
  if (response.status === 429) throw new ProviderError('limit', 'Hourly limit reached');
  if (!response.ok) throw new ProviderError('unreachable', `Responded ${response.status}`);
  return response.json();
}
