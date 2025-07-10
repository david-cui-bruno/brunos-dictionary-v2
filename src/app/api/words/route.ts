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

    const { word, definition, example } = await request.json()
    
    if (!word || !definition) {
      return NextResponse.json({ error: 'Word and definition are required' }, { status: 400 })
    }

    // Create slug from word
    const slug = word.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    // Check if word already exists
    const { data: existingWord } = await supabaseAdmin
      .from('words')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingWord) {
      return NextResponse.json({ error: 'Word already exists' }, { status: 409 })
    }

    // Insert the word
    const { data: newWord, error: wordError } = await supabaseAdmin
      .from('words')
      .insert({
        slug,
        word,
        created_by: session.user.id
      })
      .select()
      .single()

    if (wordError) {
      console.error('Error creating word:', wordError)
      return NextResponse.json({ error: 'Failed to create word' }, { status: 500 })
    }

    // Insert the definition
    const { data: newDefinition, error: defError } = await supabaseAdmin
      .from('definitions')
      .insert({
        word_id: newWord.id,
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
      word: newWord,
      definition: newDefinition
    })

  } catch (error) {
    console.error('Create word error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}