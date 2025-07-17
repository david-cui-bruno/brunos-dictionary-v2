import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user is admin
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    return NextResponse.json({ 
      isAdmin: true,
      userId: userId 
    })

  } catch (error) {
    console.error('Admin verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}