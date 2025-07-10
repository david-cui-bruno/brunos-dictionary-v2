import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's words
    const { data: words, error: wordsError } = await supabaseAdmin
      .from('words')
      .select(`
        *,
        definitions (
          id,
          body,
          score
        )
      `)
      .eq('created_by', userId)

    if (wordsError) {
      console.error('Words fetch error:', wordsError)
      return NextResponse.json({ error: wordsError.message }, { status: 500 })
    }

    // Get user's votes
    const { data: votes, error: votesError } = await supabaseAdmin
      .from('votes')
      .select(`
        value,
        created_at,
        definitions (
          body,
          words (
            word,
            slug
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (votesError) {
      console.error('Votes fetch error:', votesError)
      return NextResponse.json({ error: votesError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      words: words || [], 
      votes: votes || [] 
    })
  } catch (error) {
    console.error('Contributions fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 