import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get all words with clean definitions (limit to reasonable number for performance)
    const { data: words, error } = await supabase
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
      .limit(1000) // Limit to prevent performance issues

    if (error || !words || words.length === 0) {
      console.error('Error getting words:', error)
      return NextResponse.json({ error: 'Failed to get words' }, { status: 500 })
    }

    // Pick a random word from the results
    const randomIndex = Math.floor(Math.random() * words.length)
    const randomWord = words[randomIndex]

    return NextResponse.json({ word: randomWord })
  } catch (error) {
    console.error('Error getting random word:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
