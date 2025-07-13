import { supabase } from './supabase'
import type { Database } from '@/types/supabase'

type Word = Database['public']['Tables']['words']['Row']
type Definition = Database['public']['Tables']['definitions']['Row']
type User = Database['public']['Tables']['users']['Row']

type FetchOptions = {
  cache?: RequestCache;
  headers?: HeadersInit;
};

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

export async function getWordBySlug(slug: string, userId?: string) {
  // First get the word
  const { data: word, error: wordError } = await supabase
    .from('words')
    .select('*')
    .eq('slug', slug)
    .single()

  if (wordError || !word) {
    return { data: null, error: wordError }
  }

  // Then get the definitions for this word
  const { data: definitions, error: defError } = await supabase
    .from('definitions')
    .select('*')
    .eq('word_id', word.id)
    .eq('status', 'clean')

  if (defError) {
    return { data: null, error: defError }
  }

  // Combine the data
  const result = {
    ...word,
    definitions: definitions || []
  }

  return { data: result, error: null }
}

export async function getWordOfDay(options?: FetchOptions) {
  console.log('getWordOfDay called with options:', options)
  const today = new Date().toISOString().split('T')[0]
  console.log('Today\'s date:', today)
  
  // First try to get today's word
  console.log('Checking Supabase for today\'s word...')
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

  console.log('Supabase response:', { existingWord, error })

  if (existingWord?.words) {
    // Get only clean definitions and sort by score
    const cleanDefinitions = existingWord.words.definitions
      ?.filter((def: { 
  status: "clean" | "flagged" | "removed" | null;
  score: number | null;
}) => def.status === 'clean')
.sort((a: { score: number | null }, b: { score: number | null }) => (b.score || 0) - (a.score || 0)) || []

    console.log('Clean definitions:', cleanDefinitions)
    existingWord.words.definitions = cleanDefinitions.slice(0, 1)
    return { data: existingWord, error: null }
  }

  // If no word exists for today, call the API to generate one
  console.log('No existing word found, calling API...')
  try {
    const response = await fetch('/api/word-of-day', {
      method: 'GET',
      ...options
    })
    console.log('API response status:', response.status)
    const result = await response.json()
    console.log('API response data:', result)
    
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
      
      console.log('Clean definitions from API:', cleanDefinitions)
      result.data.words.definitions = cleanDefinitions.slice(0, 1)
    }

    return { data: result.data, error: null }
  } catch (err) {
    console.error('Error fetching word of day:', err)
    return { data: null, error: err as Error }
  }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
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