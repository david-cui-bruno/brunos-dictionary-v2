import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { definitionId: string } }
) {
  try {
    const { definitionId } = params
    console.log('🔍 Fetching definition with ID:', definitionId)

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

    console.log('📊 Supabase response:', { definition, error })

    if (error) {
      console.log('❌ Supabase error:', error)
      if (error.code === 'PGRST116') {
        console.log('🔍 No rows found for definition ID:', definitionId)
        return NextResponse.json({ error: 'Definition not found' }, { status: 404 })
      }
      throw error
    }

    if (!definition) {
      console.log('❌ No definition data returned for ID:', definitionId)
      return NextResponse.json({ error: 'Definition not found' }, { status: 404 })
    }

    console.log('✅ Successfully found definition:', definition)
    return NextResponse.json(definition)

  } catch (error) {
    console.error('💥 Definition fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 