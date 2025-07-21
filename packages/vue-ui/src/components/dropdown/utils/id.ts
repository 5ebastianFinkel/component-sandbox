let idCounter = 0

/**
 * Generates a unique ID with a given prefix
 * Uses timestamp and counter for uniqueness
 */
export function generateId(prefix: string = 'sp'): string {
  const timestamp = Date.now().toString(36)
  const counter = (++idCounter).toString(36)
  
  return `${prefix}-${timestamp}-${counter}`
}

/**
 * Generates an SSR-safe ID
 * Falls back to Math.random() on server-side
 */
export function generateSSRSafeId(prefix: string = 'sp'): string {
  // For SSR compatibility, use a simpler approach
  if (typeof window === 'undefined') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  return generateId(prefix)
}