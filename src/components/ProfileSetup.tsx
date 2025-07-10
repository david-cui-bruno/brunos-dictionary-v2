'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import ConcentrationSelector from './ConcentrationSelector'
import YearSelector from './YearSelector'

export default function ProfileSetup() {
  const { data: session } = useSession()
  const [username, setUsername] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [concentrations, setConcentrations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          gradYear: parseInt(gradYear),
          concentration: concentrations.join(', ') // Join for storage
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update profile')
      } else {
        // Refresh the session to get updated user data
        window.location.reload()
      }
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-brown-primary mb-6">
          Complete Your Profile
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              minLength={3}
              maxLength={15}
            />
          </div>

          <div>
            <Label htmlFor="gradYear">Graduation Year</Label>
            <YearSelector
              value={gradYear}
              onChange={setGradYear}
              placeholder="Select graduation year"
            />
          </div>

          <div>
            <Label htmlFor="concentration">Pick your Brown concentration(s)</Label>
            <ConcentrationSelector
              value={concentrations}
              onChange={setConcentrations}
              placeholder="Add concentration(s)"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </Card>
    </div>
  )
} 