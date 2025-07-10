import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { supabase } from './supabase'

export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts
  const session = await getServerSession(req, res, authOptions)

  return {
    session,
    supabase,
  }
}

const t = initTRPC.context<typeof createContext>().create()

export const router = t.router
export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
```

```typescript:src/lib/trpc/routers/words.ts
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
```

## 11. Edge Functions for Moderation

```typescript:supabase/functions/moderate-definition/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OP