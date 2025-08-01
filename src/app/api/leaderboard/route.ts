import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get all words with their definitions and scores
    const { data: words, error } = await supabaseAdmin
      .from('words')
      .select(`
        id,
        word,
        definitions (
          id,
          score
        )
      `)
      .eq('definitions.status', 'clean')

    if (error) {
      console.error('Leaderboard fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }

    // Process words to get highest scoring definition for each
    const processedWords = words?.map(word => {
      const highestScoreDef = word.definitions?.reduce((max, def) => 
        (def.score ?? 0) > (max.score ?? 0) ? def : max
      , word.definitions[0]);
      
      return {
        id: word.id,
        word: word.word,
        score: highestScoreDef?.score || 0,
        definitions: word.definitions
      };
    }).sort((a, b) => b.score - a.score) || [];

    // Return empty array if no words (instead of error)
    return NextResponse.json({ words: processedWords })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 