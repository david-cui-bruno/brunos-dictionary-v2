'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import ConcentrationSelector from './ConcentrationSelector'
import YearSelector from './YearSelector'

interface ProfileSetupProps {
  onComplete?: () => void
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    gradYear: '',
    concentration: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id) {
      toast.error('Please log in to complete your profile')
      return
    }

    if (!formData.username || !formData.gradYear || formData.concentration.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          gradYear: parseInt(formData.gradYear),
          concentration: formData.concentration.join(', ')
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      toast.success('Profile setup complete!')
      
      if (onComplete) {
        onComplete()
      }

    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-playfair font-bold text-[#4E3629]">Complete Your Profile</h1>
        <p className="text-[#8E8B82]">
          Help us personalize your Bruno's Dictionary experience
        </p>
      </div>

      {/* Profile Setup Form */}
      <form onSubmit={handleSubmit} className="bruno-card space-y-6">
        <div>
          <Label htmlFor="username" className="block text-sm font-medium text-[#4E3629] mb-2">
            Username *
          </Label>
          <Input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Choose a username"
            required
            minLength={3}
            maxLength={15}
            className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent"
          />
        </div>

        <div>
          <Label htmlFor="gradYear" className="block text-sm font-medium text-[#4E3629] mb-2">
            Graduation Year *
          </Label>
          <YearSelector
            value={formData.gradYear}
            onChange={(value) => setFormData({ ...formData, gradYear: value })}
            placeholder="Select graduation year"
          />
        </div>

        <div>
          <Label htmlFor="concentration" className="block text-sm font-medium text-[#4E3629] mb-2">
            Pick your Brown concentration(s) *
          </Label>
          <ConcentrationSelector
            value={formData.concentration}
            onChange={(concentrations) => setFormData({ ...formData, concentration: concentrations })}
            placeholder="Add concentration(s)"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.username || !formData.gradYear || formData.concentration.length === 0}
          className="w-full bruno-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Setting up profile...</span>
            </>
          ) : (
            <>
              <span>Complete Profile Setup</span>
            </>
          )}
        </button>
      </form>

      {/* Info Card */}
      <div className="bruno-card bg-[#FAF7F3] border-l-4 border-[#4C6B46]">
        <h3 className="font-playfair font-bold text-[#4E3629] mb-3">Why complete your profile?</h3>
        <ul className="space-y-2 text-sm text-[#8E8B82]">
          <li>• Track your contributions to the dictionary</li>
          <li>• Connect with other students in your concentration</li>
          <li>• Get personalized word recommendations</li>
          <li>• Build your Brown University community presence</li>
        </ul>
      </div>
    </div>
  )
} 