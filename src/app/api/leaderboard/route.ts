import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check if we have the required environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Get all words with their definitions and scores
    const { data: words, error } = await supabaseAdmin
      .from('words')
      .select(`
        id,
        word,
        definitions (
          id,
          score,
          status
        )
      `)
      .eq('definitions.status', 'clean')

    if (error) {
      console.error('Leaderboard fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    // Process words to get highest scoring definition for each
    const processedWords = (words || []).map(word => {
      // Filter out definitions that don't exist or have no score
      const validDefinitions = word.definitions?.filter(def => 
        def && def.score !== null && def.score !== undefined
      ) || []
      
      const highestScoreDef = validDefinitions.length > 0 
        ? validDefinitions.reduce((max, def) => 
            (def.score ?? 0) > (max.score ?? 0) ? def : max
          , validDefinitions[0])
        : null
      
      return {
        id: word.id,
        word: word.word,
        score: highestScoreDef?.score || 0,
        definitions: word.definitions || []
      };
    })
    .filter(word => word.score > 0) // Only include words with positive scores
    .sort((a, b) => b.score - a.score)

    return NextResponse.json({ words: processedWords }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 