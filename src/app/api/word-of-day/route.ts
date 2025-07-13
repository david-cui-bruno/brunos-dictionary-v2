import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Word of Day API called')
    const today = new Date().toISOString().split('T')[0]
    console.log('Today\'s date:', today)

    // First check if we already have a word for today
    console.log('Checking for existing word of day...')
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

    console.log('Today\'s word result:', { todaysWord, error: todaysWordError })

    if (todaysWordError && todaysWordError.code !== 'PGRST116') {
      console.error('Error checking today\'s word:', todaysWordError)
      return NextResponse.json({ error: 'Failed to check today\'s word' }, { status: 500 })
    }

    if (todaysWord?.words) {
      console.log('Found existing word for today:', todaysWord)
      return NextResponse.json({ data: todaysWord })
    }

    // Get all previously used word IDs
    console.log('Fetching previously used words...')
    const { data: usedWords, error: usedWordsError } = await supabaseAdmin
      .from('word_of_day')
      .select('word_id')

    console.log('Used words result:', { usedWords, error: usedWordsError })

    if (usedWordsError) {
      console.error('Error fetching used words:', usedWordsError)
      return NextResponse.json({ error: 'Failed to fetch used words' }, { status: 500 })
    }

    const usedWordIds = (usedWords || []).map(w => w.word_id)
    console.log('Used word IDs:', usedWordIds)

    // Get all available words that haven't been used before
    console.log('Fetching available words...')
    // Update the query to include all required fields
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

    console.log('Available words result:', { 
      wordCount: availableWords?.length,
      error: wordsError,
      firstWord: availableWords?.[0]
    })

    if (wordsError) {
      console.error('Error fetching words:', wordsError)
      return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 })
    }

    let wordsToChooseFrom = availableWords?.filter(word => 
      !usedWordIds.includes(word.id)
    ) || []

    console.log('Words to choose from (after filtering used words):', wordsToChooseFrom.length)

    // If all words have been used, reset and use all words
    if (wordsToChooseFrom.length === 0) {
      console.log('No unused words found, using all available words')
      wordsToChooseFrom = availableWords || []
    }

    if (wordsToChooseFrom.length === 0) {
      console.error('No words found in database')
      return NextResponse.json({ error: 'No words available' }, { status: 404 })
    }

    // Randomly select one word
    const randomIndex = Math.floor(Math.random() * wordsToChooseFrom.length)
    const selectedWord = wordsToChooseFrom[randomIndex]
    console.log('Selected word:', { word: selectedWord.word, id: selectedWord.id })

    // Get the highest scored definition for this word
    const highestScoredDefinition = selectedWord.definitions
      .sort((a, b) => (b.score || 0) - (a.score || 0))[0]
    console.log('Highest scored definition:', highestScoredDefinition)

    // Insert as today's word of the day
    console.log('Inserting new word of day...')
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

    console.log('Insert result:', { newWordOfDay, error: insertError })

    if (insertError) {
      console.error('Error setting word of day:', insertError)
      return NextResponse.json({ error: 'Failed to set word of day' }, { status: 500 })
    }

    // Format the response to include only the highest scored definition
    if (newWordOfDay?.words) {
      const fullDefinition = {
        ...highestScoredDefinition,
        author_id: highestScoredDefinition.author_id || null,
        created_at: highestScoredDefinition.created_at || null,
        updated_at: highestScoredDefinition.updated_at || null,
        word_id: selectedWord.id
      }
      newWordOfDay.words.definitions = [fullDefinition]
    }

    console.log('Final response:', { data: newWordOfDay })
    return NextResponse.json({ data: newWordOfDay })
  } catch (error) {
    console.error('Word of day error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 