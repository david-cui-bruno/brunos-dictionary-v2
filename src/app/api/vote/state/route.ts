import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ userVote: 0 })
    }

    const { searchParams } = new URL(request.url)
    const definitionId = searchParams.get('definition_id')
    
    if (!definitionId) {
      return NextResponse.json({ error: 'Definition ID is required' }, { status: 400 })
    }

    // Get user's vote for this definition
    const { data: vote, error } = await supabaseAdmin
      .from('votes')
      .select('value')
      .eq('user_id', session.user.id)
      .eq('definition_id', definitionId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching vote state:', error)
      return NextResponse.json({ error: 'Failed to fetch vote state' }, { status: 500 })
    }

    return NextResponse.json({ 
      userVote: vote?.value || 0 
    })

  } catch (error) {
    console.error('Vote state error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 