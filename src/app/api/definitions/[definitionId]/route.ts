import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { definitionId: string } }
) {
  try {
    const { definitionId } = params

    const { data: definition, error } = await supabaseAdmin
      .from('definitions')
      .select(`
        id,
        body,
        example,
        created_at,
        words (
          word
        ),
        users!definitions_author_id_fkey (
          username
        )
      `)
      .eq('id', definitionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Definition not found' }, { status: 404 })
      }
      throw error
    }

    if (!definition) {
      return NextResponse.json({ error: 'Definition not found' }, { status: 404 })
    }

    return NextResponse.json(definition)

  } catch (error) {
    console.error('Definition fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 