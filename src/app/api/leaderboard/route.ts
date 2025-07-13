import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get all users with their karma scores
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        username,
        name,
        grad_year,
        concentration,
        (
          SELECT 
            COALESCE(SUM(value), 0)
          FROM votes v
          JOIN definitions d ON d.id = v.definition_id
          WHERE d.created_by = users.id
        ) as karma
      `)
      .order('karma', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Leaderboard fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 