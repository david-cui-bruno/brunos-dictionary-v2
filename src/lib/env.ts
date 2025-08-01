export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'OPENAI_API_KEY'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`)
    // Don't throw in production, just log
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }
}

// Call this in your app initialization
validateEnv() 