import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { count, error } = await supabaseAdmin
      .from('moderation_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (error) {
      throw error
    }

    return NextResponse.json({ count: count || 0 })

  } catch (error) {
    console.error('Queue count error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
 