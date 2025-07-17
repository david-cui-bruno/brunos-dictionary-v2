'use client'

import { useState } from 'react'
import AdminButton from '@/components/AdminButton'
import AdminDashboard from '@/components/AdminDashboard'

export default function AdminWrapper() {
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false)

  return (
    <>
      <AdminButton onOpen={() => setIsAdminDashboardOpen(true)} />
      <AdminDashboard 
        isOpen={isAdminDashboardOpen} 
        onClose={() => setIsAdminDashboardOpen(false)} 
      />
    </>
  )
} 