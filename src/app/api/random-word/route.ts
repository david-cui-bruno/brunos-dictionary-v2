import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substr(2, 9)
  
  console.log(`🚀 [${requestId}] Random word API called at ${new Date().toISOString()}`)
  console.log(`🔧 [${requestId}] Environment: ${process.env.NODE_ENV}`)
  console.log(` [${requestId}] Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET'}`)
  console.log(`🔑 [${requestId}] Service role key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'}`)
  
  try {
    // Parse request details
    const { searchParams } = new URL(request.url)
    const currentWord = searchParams.get('current')
    const timestamp = Date.now()
    
    console.log(`📝 [${requestId}] Request details:`)
    console.log(`   - Current word to avoid: ${currentWord || 'NONE'}`)
    console.log(`   - Timestamp: ${timestamp}`)
    console.log(`   - Request URL: ${request.url}`)
    console.log(`   - User agent: ${request.headers.get('user-agent')}`)
    console.log(`   - Referer: ${request.headers.get('referer')}`)
    
    // Test database connection first
    console.log(`🔌 [${requestId}] Testing database connection...`)
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
    
    console.log(`✅ [${requestId}] Database connection successful`)
    console.log(`📊 [${requestId}] Total words in database: ${connectionTest}`)
    
    // Build the query
    console.log(`🔍 [${requestId}] Building database query...`)
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

    console.log(`🔍 [${requestId}] Base query built with status filter: 'clean'`)

    // Exclude current word if provided
    if (currentWord) {
      query = query.neq('word', currentWord)
      console.log(`🚫 [${requestId}] Excluding current word: "${currentWord}"`)
    }

    // Execute the query
    console.log(`⚡ [${requestId}] Executing database query...`)
    const queryStartTime = Date.now()
    
    const { data: words, error } = await query

    const queryEndTime = Date.now()
    console.log(`⏱️ [${requestId}] Query execution time: ${queryEndTime - queryStartTime}ms`)

    if (error) {
      console.error(`❌ [${requestId}] Database query failed:`, error)
      console.error(`❌ [${requestId}] Error details:`, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error.message,
        requestId: requestId,
        errorCode: error.code
      }, { status: 500 })
    }

    console.log(`✅ [${requestId}] Database query successful`)
    console.log(`📊 [${requestId}] Query results:`, {
      totalWords: words?.length || 0,
      hasData: !!words,
      isArray: Array.isArray(words),
      firstWord: words?.[0]?.word || 'NONE',
      lastWord: words?.[words?.length - 1]?.word || 'NONE'
    })

    if (!words || words.length === 0) {
      console.log(`⚠️ [${requestId}] No words found in database`)
      return NextResponse.json({ 
        error: 'No words available',
        requestId: requestId,
        debug: {
          connectionTest: connectionTest,
          queryFilters: {
            status: 'clean',
            excludedWord: currentWord
          }
        }
      }, { status: 404 })
    }

    // Log sample of words for debugging
    console.log(`📝 [${requestId}] Sample words from query:`, words.slice(0, 3).map(w => w.word))
    
    // Enhanced randomization
    console.log(`🎲 [${requestId}] Starting randomization process...`)
    
    const seed = timestamp % words.length
    const randomIndex = (seed + Math.floor(Math.random() * words.length)) % words.length
    
    console.log(`🎲 [${requestId}] Randomization details:`, {
      totalWords: words.length,
      timestamp: timestamp,
      seed: seed,
      randomIndex: randomIndex,
      selectedWord: words[randomIndex]?.word || 'NONE'
    })
    
    const randomWord = words[randomIndex]
    
    if (!randomWord) {
      console.error(`❌ [${requestId}] Failed to select random word - index out of bounds`)
      return NextResponse.json({ 
        error: 'Random word selection failed',
        requestId: requestId,
        debug: {
          totalWords: words.length,
          attemptedIndex: randomIndex,
          words: words.slice(0, 5).map(w => w.word)
        }
      }, { status: 500 })
    }

    console.log(`🎯 [${requestId}] Random word selected successfully:`, {
      word: randomWord.word,
      wordId: randomWord.id,
      definitionCount: randomWord.definitions?.length || 0,
      firstDefinition: randomWord.definitions?.[0]?.body?.substring(0, 50) + '...' || 'NONE'
    })

    // Validate the response structure
    console.log(`🔍 [${requestId}] Validating response structure...`)
    const hasRequiredFields = randomWord.word && randomWord.definitions && randomWord.definitions.length > 0
    
    if (!hasRequiredFields) {
      console.error(`❌ [${requestId}] Invalid word structure:`, {
        hasWord: !!randomWord.word,
        hasDefinitions: !!randomWord.definitions,
        definitionCount: randomWord.definitions?.length || 0
      })
      return NextResponse.json({ 
        error: 'Invalid word structure',
        requestId: requestId,
        debug: {
          wordStructure: randomWord
        }
      }, { status: 500 })
    }

    console.log(`✅ [${requestId}] Response structure validation passed`)

    const totalTime = Date.now() - startTime
    console.log(`🏁 [${requestId}] Random word API completed successfully in ${totalTime}ms`)

    return NextResponse.json({ 
      word: randomWord,
      debug: {
        requestId: requestId,
        totalWords: words.length,
        selectedIndex: randomIndex,
        timestamp: timestamp,
        excludedWord: currentWord,
        executionTime: totalTime,
        environment: process.env.NODE_ENV
      }
    })
    
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`💥 [${requestId}] Unexpected error in random word API after ${totalTime}ms:`, error)
    console.error(`💥 [${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    console.error(`💥 [${requestId}] Error type:`, typeof error)
    console.error(`💥 [${requestId}] Error constructor:`, error?.constructor?.name)
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestId: requestId,
      executionTime: totalTime,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name
    }, { status: 500 })
  }
}
