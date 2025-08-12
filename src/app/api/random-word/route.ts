import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase' // Use admin client instead

export async function GET(request: NextRequest) {
  try {
    console.log('Random word API called')
    
    // Get all words with clean definitions using admin client
    const { data: words, error } = await supabaseAdmin
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
      .limit(1000)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 })
    }

    if (!words || words.length === 0) {
      console.log('No words found in database')
      return NextResponse.json({ 
        error: 'No words available' 
      }, { status: 404 })
    }

    console.log(`Found ${words.length} words, selecting random one`)

    // Pick a random word from the results
    const randomIndex = Math.floor(Math.random() * words.length)
    const randomWord = words[randomIndex]

    console.log('Selected random word:', randomWord.word)

    return NextResponse.json({ word: randomWord })
  } catch (error) {
    console.error('Unexpected error in random word API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
