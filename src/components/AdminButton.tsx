'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AdminButtonProps {
  onOpen: () => void
}

export default function AdminButton({ onOpen }: AdminButtonProps) {
  const { data: session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const checkAdminStatus = useCallback(async () => {
    if (!session?.user?.id) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/verify')
      if (response.ok) {
        setIsAdmin(true)
        // Fetch pending count
        const pendingResponse = await fetch('/api/admin/queue/count')
        if (pendingResponse.ok) {
          const data = await pendingResponse.json()
          setPendingCount(data.count || 0)
        }
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    checkAdminStatus()
  }, [checkAdminStatus])

  // Don't render if not admin or still loading
  if (loading || !isAdmin) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onOpen}
        className="relative bg-[#B04A39] hover:bg-[#B04A39]/90 text-white rounded-full w-14 h-14 shadow-lg"
        aria-label="Admin Dashboard"
      >
        <Shield size={24} />
        
        {/* Notification Badge */}
        {pendingCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center"
          >
            {pendingCount > 99 ? '99+' : pendingCount}
          </Badge>
        )}
      </Button>
    </div>
  )
} 