import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function verifyAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (error || !user) {
    throw new Error('User not found')
  }

  if (!user.is_admin) {
    throw new Error('Admin access required')
  }

  return {
    userId,
    isAdmin: true
  }
}

export async function requireAdmin() {
  try {
    return await verifyAdmin()
  } catch (error) {
    throw new Error('Admin access required')
  }
} 