import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    // Single query with joins - no more N+1!
    const { data: queueItems, error } = await supabaseAdmin
      .from('moderation_queue')
      .select(`
        id,
        definition_id,
        status,
        flagged_at,
        reviewed_at,
        reviewed_by,
        admin_notes,
        definition:definitions (
          id,
          body,
          example,
          score,
          status,
          words (
            word
          ),
          users!definitions_author_id_fkey (
            username
          )
        ),
        flags:flags (
          reason,
          created_at,
          users!flags_flagger_id_fkey (
            username
          )
        )
      `)
      .eq('status', 'pending')
      .order('flagged_at', { ascending: false })

    if (error) {
      throw error
    }

    // Transform the data to match expected format
    const itemsWithFlags = (queueItems || []).map((item) => ({
          ...item,
      flags: item.flags || []
    }))

    return NextResponse.json({ items: itemsWithFlags })

  } catch (error) {
    console.error('Queue fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
 