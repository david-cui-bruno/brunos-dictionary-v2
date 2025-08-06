import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function verifyAdmin() {
  console.log('verifyAdmin: Starting verification') // Debug log
  
  const session = await getServerSession(authOptions)
  console.log('verifyAdmin: Session:', { userId: session?.user?.id }) // Debug log
  
  if (!session?.user?.id) {
    console.log('verifyAdmin: No session or user ID') // Debug log
    throw new Error('Unauthorized')
  }

  const userId = session.user.id
  console.log('verifyAdmin: User ID:', userId) // Debug log

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single()

  console.log('verifyAdmin: User query result:', { user, error }) // Debug log

  if (error || !user) {
    console.log('verifyAdmin: User not found') // Debug log
    throw new Error('User not found')
  }

  if (!user.is_admin) {
    console.log('verifyAdmin: User is not admin') // Debug log
    throw new Error('Admin access required')
  }

  console.log('verifyAdmin: Admin verification successful') // Debug log
  return {
    userId,
    isAdmin: true
  }
}

export async function requireAdmin() {
  try {
    return await verifyAdmin()
  } catch (error) {
    console.log('requireAdmin: Error:', error) // Debug log
    throw new Error('Admin access required')
  }
} 