import { supabase } from './supabase'

interface FetchOptions {
  cache?: RequestCache
  headers?: Record<string, string>
}

export async function getWords(search?: string, options?: FetchOptions) {
  let query = supabase
    .from('words')
    .select(`
      *,
      definitions!inner(
        *,
        author:author_id (
          username
        )
      )
    `)
    .eq('definitions.status', 'clean')
    .order('word', { ascending: true })

  if (search) {
    query = query.ilike('word', `%${search}%`)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getWord(wordSlug: string, options?: FetchOptions) {
  const { data: word, error: wordError } = await supabase
    .from('words')
    .select('*')
    .eq('slug', wordSlug)
    .single()

  if (wordError || !word) {
    return { data: null, error: wordError }
  }

  const { data: definitions, error: defError } = await supabase
    .from('definitions')
    .select(`
      *,
      author:author_id (
        username
      )
    `)
    .eq('word_id', word.id)
    .eq('status', 'clean')
    .order('score', { ascending: false })

  if (defError) {
    return { data: null, error: defError }
  }

  return { data: { ...word, definitions }, error: null }
}

export async function getWordOfDay(options?: FetchOptions) {
  const today = new Date().toISOString().split('T')[0]
  
  // First try to get today's word
  const { data: existingWord, error } = await supabase
    .from('word_of_day')
    .select(`
      *,
      words(
        *,
        definitions(*)
      )
    `)
    .eq('date', today)
    .single()

  if (existingWord?.words) {
    // Get only clean definitions and sort by score
    const cleanDefinitions = existingWord.words.definitions
      ?.filter((def: { 
  status: "clean" | "flagged" | "removed" | null;
  score: number | null;
}) => def.status === 'clean')
.sort((a: { score: number | null }, b: { score: number | null }) => (b.score || 0) - (a.score || 0)) || []

    existingWord.words.definitions = cleanDefinitions.slice(0, 1)
    return { data: existingWord, error: null }
  }

  // If no word exists for today, call the API to generate one
  try {
    const response = await fetch('/api/word-of-day', {
      method: 'GET',
      ...options
    })
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to get word of day')
    }

    // Sort and filter definitions for the new word
    if (result.data?.words?.definitions) {
      const cleanDefinitions = result.data.words.definitions
        .filter((def: { 
  status: "clean" | "flagged" | "removed" | null;
  score: number | null;
}) => def.status === 'clean')
        .sort((a: { score: number | null }, b: { score: number | null }) => (b.score || 0) - (a.score || 0))
      
      result.data.words.definitions = cleanDefinitions.slice(0, 1)
    }

    return { data: result.data, error: null }
  } catch (err) {
    console.error('Error fetching word of day:', err)
    return { data: null, error: err as Error }
  }
}

export async function searchWords(term: string) {
  const { data, error } = await supabase
    .from('words')
    .select(`
      *,
      definitions!inner(*)
    `)
    .eq('definitions.status', 'clean')
    .or(`word.ilike.%${term}%,slug.ilike.%${term}%`)
    .order('word', { ascending: true })

  return { data, error }
} 