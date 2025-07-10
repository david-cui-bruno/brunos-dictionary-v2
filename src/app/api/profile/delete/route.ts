import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Delete user's votes first (due to foreign key constraints)
    const { error: votesError } = await supabaseAdmin
      .from('votes')
      .delete()
      .eq('user_id', userId)

    if (votesError) {
      console.error('Error deleting votes:', votesError)
      return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 })
    }

    // Delete user's flags
    const { error: flagsError } = await supabaseAdmin
      .from('flags')
      .delete()
      .eq('flagger_id', userId)

    if (flagsError) {
      console.error('Error deleting flags:', flagsError)
      return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 })
    }

    // Delete user's search logs
    const { error: searchLogsError } = await supabaseAdmin
      .from('search_logs')
      .delete()
      .eq('user_id', userId)

    if (searchLogsError) {
      console.error('Error deleting search logs:', searchLogsError)
      return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 })
    }

    // Delete user's definitions
    const { error: definitionsError } = await supabaseAdmin
      .from('definitions')
      .delete()
      .eq('author_id', userId)

    if (definitionsError) {
      console.error('Error deleting definitions:', definitionsError)
      return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 })
    }

    // Delete user's words
    const { error: wordsError } = await supabaseAdmin
      .from('words')
      .delete()
      .eq('created_by', userId)

    if (wordsError) {
      console.error('Error deleting words:', wordsError)
      return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 })
    }

    // Finally, delete the user
    const { error: userError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (userError) {
      console.error('Error deleting user:', userError)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 