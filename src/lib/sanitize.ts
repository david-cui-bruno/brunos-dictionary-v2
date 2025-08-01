export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

export function sanitizeWord(word: string): string {
  return sanitizeInput(word).toLowerCase().replace(/[^a-z0-9\s-]/g, '')
}

export function sanitizeDefinition(definition: string): string {
  return sanitizeInput(definition)
} 