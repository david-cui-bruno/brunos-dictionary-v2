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

    const body = await request.json()
    const { definition_id, reason, additional_comments } = body
    
    if (!definition_id || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userId = session.user.id

    // Verify the definition exists
    const { data: definition, error: defError } = await supabaseAdmin
      .from('definitions')
      .select('id, status')
      .eq('id', definition_id)
      .single()

    if (defError || !definition) {
      return NextResponse.json({ error: 'Definition not found' }, { status: 404 })
    }

    // Check if user has already flagged this definition
    const { data: existingFlag } = await supabaseAdmin
      .from('flags')
      .select('id')
      .eq('definition_id', definition_id)
      .eq('flagger_id', userId)
      .single()

    if (existingFlag) {
      return NextResponse.json({ 
        error: 'You have already flagged this definition',
        errorType: 'ALREADY_FLAGGED'
      }, { status: 400 })
    }

    // Insert the flag
    const { error: flagError } = await supabaseAdmin
      .from('flags')
      .insert({
        definition_id,
        flagger_id: userId,
        reason,
        additional_comments: additional_comments || null
      })

    if (flagError) {
      console.error('Flag insert error:', flagError)
      return NextResponse.json({ error: 'Failed to submit flag' }, { status: 500 })
    }

    // Check if this is the 3rd unique flag on this definition
    const { data: flagCount } = await supabaseAdmin
      .from('flags')
      .select('id', { count: 'exact' })
      .eq('definition_id', definition_id)

    // ALWAYS add to moderation queue, regardless of flag count
    const { error: queueError } = await supabaseAdmin
      .from('moderation_queue')
      .insert({
        definition_id,
        status: 'pending',
        flagged_at: new Date().toISOString()
      })

    if (queueError) {
      console.error('Failed to add to moderation queue:', queueError)
      // Don't fail the request if queue insertion fails
    }

    // Only auto-hide if 3+ flags
    if (flagCount && flagCount.length >= 3) {
      // Auto-hide the definition
      const { error: updateError } = await supabaseAdmin
        .from('definitions')
        .update({ status: 'flagged' })
        .eq('id', definition_id)

      if (updateError) {
        console.error('Failed to auto-hide definition:', updateError)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Flag error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 