import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    // Get flagged definitions that are in the moderation queue
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
        )
      `)
      .eq('status', 'pending')
      .order('flagged_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get flags for each definition separately
    const itemsWithFlags = await Promise.all(
      (queueItems || []).map(async (item) => {
        if (!item.definition_id) return item;

        // Get flags for this definition
        const { data: flags } = await supabaseAdmin
          .from('flags')
          .select(`
            reason,
            created_at,
            users!flags_flagger_id_fkey (
              username
            )
          `)
          .eq('definition_id', item.definition_id)

        return {
          ...item,
          flags: flags || []
        };
      })
    );

    return NextResponse.json({ items: itemsWithFlags })

  } catch (error) {
    console.error('Queue fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
 