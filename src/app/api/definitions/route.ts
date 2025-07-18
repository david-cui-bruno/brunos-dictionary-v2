// src/app/api/definitions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { moderateContent, logModerationAction } from '@/lib/moderation'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { word, word_id, definition, example } = await request.json()
    
    if ((!word_id && !word) || !definition) {
      return NextResponse.json({ 
        error: 'Either word_id or word, and definition are required' 
      }, { status: 400 })
    }

    let finalWordId = word_id

    // If word is provided instead of word_id, always create a new word
    if (!word_id && word) {
      // Generate a unique slug by appending a timestamp
      const baseSlug = word.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const timestamp = Date.now()
      const slug = `${baseSlug}-${timestamp}`

      // Create new word
      const { data: newWord, error: wordError } = await supabaseAdmin
        .from('words')
        .insert({
          slug,
          word, // Keep the original word text
          created_by: session.user.id
        })
        .select()
        .single()

      if (wordError) {
        console.error('Error creating word:', wordError)
        return NextResponse.json({ error: 'Failed to create word' }, { status: 500 })
      }

      finalWordId = newWord.id
    }

    // Moderate the content before saving
    const moderationResult = await moderateContent(definition + (example ? ' ' + example : ''));

    // Add definition with moderation results
    const { data: newDefinition, error: definitionError } = await supabaseAdmin
      .from('definitions')
      .insert({
        word_id: finalWordId,
        body: definition,
        example: example || null,
        author_id: session.user.id,
        status: moderationResult.status,
        ai_moderation_score: moderationResult.categoryScores.sexual + 
                           moderationResult.categoryScores.hate + 
                           moderationResult.categoryScores.violence,
        ai_moderation_categories: moderationResult.categories,
        ai_moderation_flagged_at: moderationResult.flaggedAt
      })
      .select()
      .single()

    if (definitionError) {
      console.error('Error creating definition:', definitionError)
      return NextResponse.json({ error: 'Failed to create definition' }, { status: 500 })
    }

    // Log the moderation action AFTER the definition is created
    if (moderationResult.flagged) {
      await logModerationAction(newDefinition.id, moderationResult);
    }

    return NextResponse.json({
      ...newDefinition,
      moderated: moderationResult.flagged
    })
  } catch (error) {
    console.error('Unexpected error in /api/definitions:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}