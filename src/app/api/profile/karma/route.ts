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

    // Get words (2 points each)
    const { data: words } = await supabaseAdmin
      .from('words')
      .select('id')
      .eq('created_by', userId)

    // Get definitions with votes
    const { data: definitions } = await supabaseAdmin
      .from('definitions')
      .select(`
        id,
        votes (
          value,
          user_id
        )
      `)
      .eq('author_id', userId)

    // Get votes given to others
    const { data: votesGiven } = await supabaseAdmin
      .from('votes')
      .select('definition_id, value')
      .eq('user_id', userId)

    // Calculate karma
    let totalKarma = 0

    // Add 2 points per word
    totalKarma += (words?.length || 0) * 2

    // Add points for votes received (excluding self-votes)
    definitions?.forEach((def) => {
      def.votes?.forEach((vote: any) => {
        if (vote.value > 0) {
          if (vote.user_id === userId) {
            // Self-vote: count only once
            totalKarma += 1
          } else {
            // Vote from another user
            totalKarma += 1
          }
        }
      })
    })

    // Add points for votes given to others
    votesGiven?.forEach((vote) => {
      if (vote.value && vote.value > 0) {
        totalKarma += 1
      }
    })

    return NextResponse.json({ karma: totalKarma })
  } catch (error) {
    console.error('Karma fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 