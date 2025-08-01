import { NextAuthOptions } from "next-auth"
import Google from "next-auth/providers/google"
import { supabaseAdmin } from "./supabase"

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  // Remove this line for production
  // debug: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Check if email is from Brown University
        if (!user.email?.endsWith('@brown.edu')) {
          return false
        }
        
        // Extract netid from email (remove @brown.edu)
        const netid = user.email.replace('@brown.edu', '')
        
        // Check if user already exists in our custom users table
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('netid', netid)
          .single()
        
        if (!existingUser) {
          // Insert new user into our custom users table
          const { data: newUser, error } = await supabaseAdmin
            .from('users')
            .insert({
              netid: netid,
              name: user.name,
              email: user.email,
              grad_year: null,
              concentration: null
            })
            .select()
            .single()
          
          if (error) {
            console.error('Error inserting user:', error)
            return false
          }
        }
        
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Get the user ID from our database using netid
        const netid = user.email?.replace('@brown.edu', '')
        if (netid) {
          const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('netid', netid)
            .single()
          
          if (dbUser) {
            token.id = dbUser.id
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
} 