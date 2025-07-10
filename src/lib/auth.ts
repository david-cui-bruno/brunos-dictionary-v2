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
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('=== SIGNIN CALLBACK STARTED ===')
      console.log('User:', user)
      console.log('Account:', account)
      console.log('Profile:', profile)
      
      try {
        // Check if email is from Brown University
        if (!user.email?.endsWith('@brown.edu')) {
          console.log('Non-Brown email rejected:', user.email)
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
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()
          
          if (error) {
            console.error('Error inserting user:', error)
            return false
          }
          
          // Update the user object with our generated ID
          user.id = newUser.id
          console.log('User successfully inserted into database')
        } else {
          // Use the existing user's ID
          user.id = existingUser.id
          console.log('User already exists in database')
        }
        
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },
    async jwt({ token, user }) {
      console.log('JWT callback:', { token, user })
      if (user) {
        token.id = user.id
        token.email = user.email || ''
        // Extract netid for JWT
        token.netid = user.email?.replace('@brown.edu', '') || ''
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token })
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.netid = token.netid as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl })
      // Always redirect to home page after successful sign in
      return `${baseUrl}/`
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  debug: true,
} 