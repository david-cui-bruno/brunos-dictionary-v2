'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/verify')
        if (response.ok) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
          router.push('/')
        }
      } catch (error) {
        setIsAdmin(false)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      checkAdminStatus()
    } else {
      setLoading(false)
      setIsAdmin(false)
    }
  }, [session, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F3]">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#FAF7F3] border-[#8E8B82]">
            <CardHeader>
              <CardTitle className="text-[#4E3629] text-2xl">
                Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#8E8B82]">
                Welcome to the admin dashboard. This page is only accessible to administrators.
              </p>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 text-sm">
                  ✅ Admin authentication is working correctly!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
} 