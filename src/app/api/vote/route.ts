import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { definition_id, action } = await request.json()
    
    if (!definition_id || !action || !['up', 'down'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const userId = session.user.id

    // Verify the definition exists
    const { data: definition, error: defError } = await supabaseAdmin
      .from('definitions')
      .select('id')
      .eq('id', definition_id)
      .single()

    if (defError || !definition) {
      return NextResponse.json({ error: 'Definition not found' }, { status: 404 })
    }

    // Verify the user exists in public.users
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Step 1: Look up existing vote
    const { data: existingVote, error: lookupError } = await supabaseAdmin
      .from('votes')
      .select('value')
      .eq('user_id', userId)
      .eq('definition_id', definition_id)
      .single()

    const currentValue = existingVote?.value || 0
    const nextValue = action === 'up' ? 1 : -1
    const shouldDelete = currentValue === nextValue

    // Step 2: Update or delete the vote
    let upsertError = null
    if (shouldDelete) {
      // Delete the vote - database trigger will automatically update score
      const { error } = await supabaseAdmin
        .from('votes')
        .delete()
        .eq('user_id', userId)
        .eq('definition_id', definition_id)
      upsertError = error
    } else {
      // Upsert the vote - database trigger will automatically update score
      const { error } = await supabaseAdmin
        .from('votes')
        .upsert({
          user_id: userId,
          definition_id: definition_id,
          value: nextValue
        })
      upsertError = error
    }

    if (upsertError) {
      console.error('Vote upsert error:', upsertError)
      return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 })
    }

    // Step 3: Get the updated score from the database (trigger has already updated it)
    const { data: updatedDefinition, error: scoreError } = await supabaseAdmin
      .from('definitions')
      .select('score')
      .eq('id', definition_id)
      .single()

    if (scoreError) {
      console.error('Score fetch error:', scoreError)
      return NextResponse.json({ error: 'Failed to get updated score' }, { status: 500 })
    }

    // Return the vote result and updated score
    return NextResponse.json({
      vote: shouldDelete ? 0 : nextValue,
      counts: {
        netScore: updatedDefinition?.score || 0
      }
    })

  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 