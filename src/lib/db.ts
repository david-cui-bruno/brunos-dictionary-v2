import { supabase } from './supabase'
import type { Database } from '@/types/supabase'

type Word = Database['public']['Tables']['words']['Row']
type Definition = Database['public']['Tables']['definitions']['Row']
type User = Database['public']['Tables']['users']['Row']

export async function getWords(search?: string, userId?: string) {
  let query = supabase
    .from('words')
    .select(`
      *,
      definitions!inner(*)
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

export async function getWordOfDay() {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
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

  if (data?.words) {
    // Filter definitions to only clean ones
    const { data: definitions } = await supabase
      .from('definitions')
      .select('*')
      .eq('word_id', data.words.id)
      .eq('status', 'clean')

    data.words.definitions = definitions || []
  }

  return { data, error }
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