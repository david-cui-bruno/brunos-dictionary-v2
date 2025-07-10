import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const wordsRouter = router({
  search: publicProcedure
    .input(z.object({
      term: z.string().min(1),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .rpc('search_words', { search_term: input.term })

      if (error) {
        throw new Error('Search failed')
      }

      return data
    }),

  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('words')
        .select(`
          *,
          definitions (
            *,
            author:users (netid)
          )
        `)
        .eq('slug', input.slug)
        .eq('definitions.status', 'clean')
        .single()

      if (error) {
        throw new Error('Word not found')
      }

      return data
    }),

  create: protectedProcedure
    .input(z.object({
      word: z.string().min(1),
      slug: z.string().min(1),
      definition: z.string().min(1),
      example: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // First create the word
      const { data: word, error: wordError } = await ctx.supabase
        .from('words')
        .insert({
          word: input.word,
          slug: input.slug,
          created_by: ctx.session.user.id,
        })
        .select()
        .single()

      if (wordError) {
        throw new Error('Failed to create word')
      }

      // Then create the definition
      const { data: definition, error: defError } = await ctx.supabase
        .from('definitions')
        .insert({
          word_id: word.id,
          body: input.definition,
          example: input.example,
          author_id: ctx.session.user.id,
        })
        .select()
        .single()

      if (defError) {
        throw new Error('Failed to create definition')
      }

      return { word, definition }
    }),
})