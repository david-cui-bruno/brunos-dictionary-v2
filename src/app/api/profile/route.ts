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

    // Check if username is already taken by another user
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username.trim())
      .neq('id', session.user.id)  // Exclude current user
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Username check error:', checkError)
      return NextResponse.json({ error: 'Error checking username availability' }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Username is already taken. Please choose another one.',
        code: 'USERNAME_TAKEN'
      }, { status: 409 })
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