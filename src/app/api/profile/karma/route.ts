import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

interface Vote {
  value: number | null
  user_id: string
}

interface Definition {
  author_id: string | null
  votes: Vote[]
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's words (2 points each)
    const { data: words, error: wordsError } = await supabaseAdmin
      .from('words')
      .select('id')
      .eq('created_by', userId)

    if (wordsError) {
      console.error('Words fetch error:', wordsError)
      return NextResponse.json({ error: wordsError.message }, { status: 500 })
    }

    // Get user's definitions with votes
    const { data: definitions, error: defError } = await supabaseAdmin
      .from('definitions')
      .select(`
        author_id,
        votes (
          value,
          user_id
        )
      `)
      .eq('author_id', userId)

    if (defError) {
      console.error('Definitions fetch error:', defError)
      return NextResponse.json({ error: defError.message }, { status: 500 })
    }

    let karma = 0

    // Add 2 points per word created
    karma += (words?.length || 0) * 2

    // Calculate karma from votes
    definitions?.forEach((def: Definition) => {
      def.votes?.forEach((vote: Vote) => {
        const voterId = vote.user_id
        
        if (vote.value && vote.value > 0) {
          if (voterId === userId) {
            // Self-vote: count only once as a vote given
            karma += 1
          } else {
            // Vote from another user: count once for receiving
            karma += 1
          }
        }
      })
    })

    return NextResponse.json({ karma })

  } catch (error) {
    console.error('Karma fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 