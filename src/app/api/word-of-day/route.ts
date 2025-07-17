import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0]

    // First check if we already have a word for today
    const { data: todaysWord, error: todaysWordError } = await supabaseAdmin
      .from('word_of_day')
      .select(`
        *,
        words (
          *,
          definitions (*)
        )
      `)
      .eq('date', today)
      .single()

    if (todaysWordError && todaysWordError.code !== 'PGRST116') {
      console.error('Error checking today\'s word:', todaysWordError)
      return NextResponse.json({ error: 'Failed to check today\'s word' }, { status: 500 })
    }

    if (todaysWord?.words) {
      return NextResponse.json({ data: todaysWord })
    }

    // Get all previously used word IDs
    const { data: usedWords, error: usedWordsError } = await supabaseAdmin
      .from('word_of_day')
      .select('word_id')

    if (usedWordsError) {
      console.error('Error fetching used words:', usedWordsError)
      return NextResponse.json({ error: 'Failed to fetch used words' }, { status: 500 })
    }

    const usedWordIds = (usedWords || []).map(w => w.word_id)

    // Get all available words that haven't been used before
    const { data: availableWords, error: wordsError } = await supabaseAdmin
      .from('words')
      .select(`
        *,
        definitions!inner (
          id,
          body,
          example,
          score,
          status,
          author_id,
          created_at,
          updated_at,
          word_id
        )
      `)
      .eq('definitions.status', 'clean')

    if (wordsError) {
      console.error('Error fetching words:', wordsError)
      return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 })
    }

    let wordsToChooseFrom = availableWords?.filter(word => 
      !usedWordIds.includes(word.id)
    ) || []

    // If all words have been used, reset and use all words
    if (wordsToChooseFrom.length === 0) {
      wordsToChooseFrom = availableWords || []
    }

    if (wordsToChooseFrom.length === 0) {
      console.error('No words found in database')
      return NextResponse.json({ error: 'No words available' }, { status: 404 })
    }

    // Randomly select one word
    const randomIndex = Math.floor(Math.random() * wordsToChooseFrom.length)
    const selectedWord = wordsToChooseFrom[randomIndex]

    // Get the highest scored definition for this word
    const highestScoredDefinition = selectedWord.definitions
      .sort((a, b) => (b.score || 0) - (a.score || 0))[0]

    // Insert as today's word of the day
    const { data: newWordOfDay, error: insertError } = await supabaseAdmin
      .from('word_of_day')
      .insert({
        date: today,
        word_id: selectedWord.id
      })
      .select(`
        *,
        words (
          *,
          definitions (*)
        )
      `)
      .single()

    if (insertError) {
      console.error('Error inserting word of day:', insertError)
      return NextResponse.json({ error: 'Failed to create word of day' }, { status: 500 })
    }

    // Set the definitions to just the highest scored one
    if (newWordOfDay?.words) {
      newWordOfDay.words.definitions = [highestScoredDefinition]
    }

    return NextResponse.json({ data: newWordOfDay })

  } catch (error) {
    console.error('Word of day error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 