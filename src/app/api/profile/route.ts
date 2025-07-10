import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username, gradYear, concentration } = await request.json()

    // Validate input
    if (!username || !gradYear || !concentration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (username.length < 3 || username.length > 15) {
      return NextResponse.json({ error: 'Username must be 3-15 characters' }, { status: 400 })
    }

    if (gradYear < 1900 || gradYear > 2100) {
      return NextResponse.json({ error: 'Invalid graduation year' }, { status: 400 })
    }

    // Update user profile
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        username: username.trim(),
        grad_year: parseInt(gradYear),
        concentration: concentration.trim()
      })
      .eq('id', session.user.id)

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 