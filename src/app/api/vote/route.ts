import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Vote API called')
    
    // Check authentication
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    
    if (!session?.user?.id) {
      console.log('No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { definition_id, action } = await request.json()
    console.log('Vote request:', { definition_id, action, userId: session.user.id })
    
    if (!definition_id || !action || !['up', 'down'].includes(action)) {
      console.log('Invalid request data')
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
      console.log('Definition not found:', definition_id)
      return NextResponse.json({ error: 'Definition not found' }, { status: 404 })
    }

    // Verify the user exists in public.users
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.log('User not found in public.users:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Step 1: Look up existing vote
    const { data: existingVote, error: lookupError } = await supabaseAdmin
      .from('votes')
      .select('value')
      .eq('user_id', userId)
      .eq('definition_id', definition_id)
      .single()

    console.log('Existing vote lookup:', { existingVote, lookupError })

    const currentValue = existingVote?.value || 0

    // Step 2: Determine next action
    let nextValue: number | null
    let shouldDelete = false
    
    if (action === 'up') {
      if (currentValue === 1) {
        // User is removing their upvote
        shouldDelete = true
        nextValue = null
      } else {
        // User is adding an upvote (or changing from downvote)
        nextValue = 1
      }
    } else { // action === 'down'
      if (currentValue === -1) {
        // User is removing their downvote
        shouldDelete = true
        nextValue = null
      } else {
        // User is adding a downvote (or changing from upvote)
        nextValue = -1
      }
    }

    console.log('Vote transition:', { currentValue, action, nextValue, shouldDelete })

    // Step 3: Persist vote
    let upsertError = null
    
    if (shouldDelete) {
      // Delete the vote row
      const { error: deleteError } = await supabaseAdmin
        .from('votes')
        .delete()
        .eq('user_id', userId)
        .eq('definition_id', definition_id)
      
      upsertError = deleteError
    } else {
      // Insert or update the vote
      const { error: insertError } = await supabaseAdmin
        .from('votes')
        .upsert({
          user_id: userId,
          definition_id,
          value: nextValue,
          created_at: new Date().toISOString()
        })
      
      upsertError = insertError
    }

    console.log('Upsert result:', { upsertError })

    if (upsertError) {
      console.error('Vote upsert error:', upsertError)
      return NextResponse.json({ error: 'Failed to save vote: ' + upsertError.message }, { status: 500 })
    }

    // Step 4: Recompute tallies
    const { data: voteCounts, error: countError } = await supabaseAdmin
      .from('votes')
      .select('value')
      .eq('definition_id', definition_id)

    console.log('Vote counts:', { voteCounts, countError })

    const netScore = voteCounts?.reduce((sum, vote) => sum + vote.value, 0) || 0
    const upCount = voteCounts?.filter(vote => vote.value === 1).length || 0
    const downCount = voteCounts?.filter(vote => vote.value === -1).length || 0

    // Step 5: Update definition score
    const { error: updateError } = await supabaseAdmin
      .from('definitions')
      .update({ score: netScore })
      .eq('id', definition_id)

    console.log('Score update:', { netScore, updateError })

    return NextResponse.json({
      success: true,
      vote: shouldDelete ? 0 : nextValue,
      counts: {
        netScore,
        upCount,
        downCount
      }
    })

  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 })
  }
} 