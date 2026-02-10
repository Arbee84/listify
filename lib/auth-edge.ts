/**
 * Edge-compatible JWT verification using Web Crypto API.
 * Used by middleware (which runs in Edge runtime).
 * For full auth utilities (sign, cookies), use lib/auth.ts in API routes.
 */

export interface JWTPayload {
  email: string
  user_id: number
  token_version: number
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production'
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts

    // Verify signature using HMAC-SHA256
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signature = base64UrlDecode(signatureB64)
    const data = encoder.encode(`${headerB64}.${payloadB64}`)

    const valid = await crypto.subtle.verify('HMAC', key, signature, data)
    if (!valid) return null

    // Decode payload
    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64))
    const payload = JSON.parse(payloadJson)

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload as JWTPayload
  } catch {
    return null
  }
}
