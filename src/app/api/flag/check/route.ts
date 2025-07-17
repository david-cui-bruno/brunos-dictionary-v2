import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { definition_id } = await request.json()
    
    if (!definition_id) {
      return NextResponse.json({ error: 'Definition ID is required' }, { status: 400 })
    }

    const userId = session.user.id

    // Check if user has already flagged this definition
    const { data: existingFlag } = await supabaseAdmin
      .from('flags')
      .select('id')
      .eq('definition_id', definition_id)
      .eq('flagger_id', userId)
      .single()

    return NextResponse.json({ 
      alreadyFlagged: !!existingFlag 
    })

  } catch (error) {
    console.error('Flag check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 