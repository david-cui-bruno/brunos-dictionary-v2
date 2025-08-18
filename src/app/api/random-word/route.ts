import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substr(2, 9)
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 [${requestId}] Random word API called`)
  }
  
  try {
    // Parse request details
    const { searchParams } = new URL(request.url)
    const currentWord = searchParams.get('current')
    
    // Test database connection first
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('words')
      .select('count', { count: 'exact', head: true })
    
    if (connectionError) {
      console.error(`❌ [${requestId}] Database connection failed:`, connectionError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: connectionError.message,
        requestId: requestId
      }, { status: 500 })
    }
    
    // Build the query
    let query = supabaseAdmin
      .from('words')
      .select(`
        *,
        definitions!inner(
          id,
          body,
          example,
          score,
          status,
          author:author_id (
            username
          )
        )
      `)
      .eq('definitions.status', 'clean')

    // Exclude current word if provided
    if (currentWord) {
      query = query.neq('word', currentWord)
    }

    // Execute the query
    const { data: words, error } = await query

    if (error) {
      console.error(`❌ [${requestId}] Database query failed:`, error)
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error.message,
        requestId: requestId,
        errorCode: error.code
      }, { status: 500 })
    }

    if (!words || words.length === 0) {
      return NextResponse.json({ 
        error: 'No words found',
        requestId: requestId
      }, { status: 404 })
    }

    // Select random word
    const randomIndex = Math.floor(Math.random() * words.length)
    const randomWord = words[randomIndex]
    
    if (!randomWord) {
      return NextResponse.json({ 
        error: 'Random word selection failed',
        requestId: requestId
      }, { status: 500 })
    }

    // Validate the response structure
    const hasRequiredFields = randomWord.word && randomWord.definitions && randomWord.definitions.length > 0
    
    if (!hasRequiredFields) {
      return NextResponse.json({ 
        error: 'Invalid word structure',
        requestId: requestId
      }, { status: 500 })
    }

    return NextResponse.json({ 
      word: randomWord,
      requestId: requestId
    })
    
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`💥 [${requestId}] Unexpected error in random word API after ${totalTime}ms:`, error)
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestId: requestId
    }, { status: 500 })
  }
}