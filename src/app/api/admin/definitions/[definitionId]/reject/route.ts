import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { definitionId: string } }
) {
  try {
    const { userId } = await requireAdmin()
    const { definitionId } = params

    // Update definition status to flagged (keep hidden)
    const { error: updateError } = await supabaseAdmin
      .from('definitions')
      .update({ 
        status: 'flagged',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', definitionId)

    if (updateError) {
      throw updateError
    }

    // Update moderation queue status
    const { error: queueError } = await supabaseAdmin
      .from('moderation_queue')
      .update({ 
        status: 'rejected',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString()
      })
      .eq('definition_id', definitionId)

    if (queueError) {
      throw queueError
    }

    // Log admin action
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: userId,
        action_type: 'reject',
        target_type: 'definition',
        target_id: definitionId
      })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Reject error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}