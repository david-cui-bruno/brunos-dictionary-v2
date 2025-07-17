import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim() === '') {
      return NextResponse.json({ results: [] })
    }

    // Search only in words table, not definitions
    const { data: words, error: fetchError } = await supabaseAdmin
      .from('words')
      .select(`
        id,
        word,
        slug,
        definitions!inner (
          id,
          body,
          example,
          score,
          created_at,
          users!definitions_author_id_fkey (
            username
          )
        )
      `)
      .ilike('word', `%${query}%`)  // Only search word field
      .eq('definitions.status', 'clean')

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch definitions', details: fetchError.message }, { status: 500 })
    }

    // Transform the data to match the expected format
    const results = words?.map(word => {
      // Get the highest scoring definition for each word
      const highestScoreDef = word.definitions?.reduce((max, def) => 
        (def.score || 0) > (max.score || 0) ? def : max
      , word.definitions[0]);

      return {
        id: highestScoreDef?.id,
        body: highestScoreDef?.body,
        example: highestScoreDef?.example,
        score: highestScoreDef?.score || 0,
        created_at: highestScoreDef?.created_at,
        words: {
          id: word.id,
          word: word.word,
          slug: word.slug
        },
        users: highestScoreDef?.users,
        // Add search relevance score
        searchScore: calculateSearchScore(word.word, query)
      };
    }).filter(result => result.id) || []; // Only include results with definitions

    // Sort by search relevance first, then by definition score
    const sortedResults = results.sort((a, b) => {
      // First sort by search relevance (higher is better)
      if (b.searchScore !== a.searchScore) {
        return b.searchScore - a.searchScore;
      }
      // Then sort by definition score
      return (b.score || 0) - (a.score || 0);
    });

    // Remove searchScore from final results
    const finalResults = sortedResults.map(({ searchScore, ...result }) => result);

    return NextResponse.json({ results: finalResults })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Calculate search relevance score
function calculateSearchScore(word: string, query: string): number {
  const wordLower = word.toLowerCase();
  const queryLower = query.toLowerCase();
  
  let score = 0;
  
  // Exact match gets highest score
  if (wordLower === queryLower) {
    score += 1000;
  }
  // Starts with query gets high score
  else if (wordLower.startsWith(queryLower)) {
    score += 100;
  }
  // Contains query gets medium score
  else if (wordLower.includes(queryLower)) {
    score += 10;
  }
  
  // Bonus for shorter words (more specific matches)
  score += Math.max(0, 20 - wordLower.length);
  
  // Bonus for words that start with the same letter as query
  if (wordLower[0] === queryLower[0]) {
    score += 5;
  }
  
  return score;
} 