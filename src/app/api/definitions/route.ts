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

    const { word_id, definition, example } = await request.json()
    
    if (!word_id || !definition) {
      return NextResponse.json({ error: 'Word ID and definition are required' }, { status: 400 })
    }

    // Verify the word exists
    const { data: word, error: wordError } = await supabaseAdmin
      .from('words')
      .select('id')
      .eq('id', word_id)
      .single()

    if (wordError || !word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }

    // Insert the definition
    const { data: newDefinition, error: defError } = await supabaseAdmin
      .from('definitions')
      .insert({
        word_id,
        body: definition,
        example: example || null,
        author_id: session.user.id
      })
      .select()
      .single()

    if (defError) {
      console.error('Error creating definition:', defError)
      return NextResponse.json({ error: 'Failed to create definition' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      definition: newDefinition
    })

  } catch (error) {
    console.error('Create definition error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 