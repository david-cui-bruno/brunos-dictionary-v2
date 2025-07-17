'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

interface Definition {
  id: string
  body: string
  example?: string
  words: {
    word: string
  }
  users: {
    name: string
    username: string
  }
  created_at: string
}

const FLAG_REASONS = [
  { value: 'inappropriate', label: 'Inappropriate / hateful' },
  { value: 'spam', label: 'Spam / low effort' },
  { value: 'inaccurate', label: 'Misleading or inaccurate' },
  { value: 'duplicate', label: 'Duplicate entry' },
  { value: 'other', label: 'Other' }
]

export default function FlagFormPage({ params }: { params: { definitionId: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [definition, setDefinition] = useState<Definition | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [additionalComments, setAdditionalComments] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/auth/signin')
      return
    }

    fetchDefinition()
  }, [session, params.definitionId])

  const fetchDefinition = async () => {
    try {
      const response = await fetch(`/api/definitions/${params.definitionId}`)
      if (response.ok) {
        const data = await response.json()
        setDefinition(data)
      } else {
        setError('Definition not found')
      }
    } catch (error) {
      setError('Failed to load definition')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Flag form submitted')
    console.log('📝 Form data:', {
      definitionId: params.definitionId,
      selectedReason,
      additionalComments
    })
    
    if (!selectedReason) {
      console.log('❌ No reason selected')
      toast.error('Please select a reason for reporting')
      return
    }

    setSubmitting(true)
    console.log('⏳ Starting submission...')

    try {
      console.log('📡 Sending POST request to /api/flag')
      const response = await fetch('/api/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          definition_id: params.definitionId,
          reason: selectedReason,
          additional_comments: additionalComments
        })
      })

      console.log(' Response status:', response.status)
      console.log('📨 Response ok:', response.ok)

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Success response:', responseData)
        toast.success('Report submitted successfully')
        router.push('/flag/success')
      } else {
        const data = await response.json()
        console.log('❌ Error response:', data)
        toast.error(data.error || 'Failed to submit report')
      }
    } catch (error) {
      console.error('💥 Exception during submission:', error)
      toast.error('Failed to submit report')
    } finally {
      console.log('🏁 Submission finished')
      setSubmitting(false)
    }
  }

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
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !definition) {
    return (
      <div className="min-h-screen bg-[#FAF7F3]">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert>
              <AlertDescription>
                {error || 'Definition not found'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-playfair font-bold text-[#4E3629] mb-2">
              Report a Definition
            </h1>
            <p className="text-[#8E8B82]">
              Help keep Bruno's Dictionary accurate and appropriate
            </p>
          </div>

          {/* Guidelines */}
          <Card className="bg-white border-[#8E8B82]">
            <CardHeader>
              <CardTitle className="text-[#4E3629] text-lg">
                Content Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-[#8E8B82] space-y-2">
                <p>Use this form to report definitions that...</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Are inside jokes with no context</li>
                  <li>Include terms that don't actually seem real</li>
                  <li>Include someone's full name or other personal information</li>
                  <li>Include hate speech, bullying, or discriminatory content</li>
                  <li>Go against any of our other content guidelines</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Definition Summary */}
          <Card className="bg-white border-[#8E8B82]">
            <CardHeader>
              <CardTitle className="text-[#4E3629] text-lg">
                Definition Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-[#4E3629]">Word: </span>
                  <span className="text-[#8E8B82]">{definition.words.word}</span>
                </div>
                <div>
                  <span className="font-medium text-[#4E3629]">Definition: </span>
                  <span className="text-[#8E8B82]">"{definition.body}"</span>
                </div>
                {definition.example && (
                  <div>
                    <span className="font-medium text-[#4E3629]">Example: </span>
                    <span className="text-[#8E8B82]">"{definition.example}"</span>
                  </div>
                )}
                <div className="text-xs text-[#8E8B82] pt-2 border-t border-[#8E8B82]/20">
                  Added by {definition.users.username || 'Anonymous'} on {new Date(definition.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flag Form */}
          <Card className="bg-white border-[#8E8B82]">
            <CardHeader>
              <CardTitle className="text-[#4E3629] text-lg">
                Report Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reason Selection */}
                <div className="space-y-3">
                  <Label className="text-[#4E3629] font-medium">
                    Why should this definition be removed?
                  </Label>
                  <RadioGroup
                    value={selectedReason}
                    onValueChange={setSelectedReason}
                    className="space-y-3"
                  >
                    {FLAG_REASONS.map((reason) => (
                      <div key={reason.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={reason.value} id={reason.value} />
                        <Label htmlFor={reason.value} className="text-[#8E8B82] cursor-pointer">
                          {reason.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Additional Comments */}
                {selectedReason === 'other' && (
                  <div className="space-y-3">
                    <Label className="text-[#4E3629] font-medium">
                      Additional Comments
                    </Label>
                    <Textarea
                      value={additionalComments}
                      onChange={(e) => setAdditionalComments(e.target.value)}
                      placeholder="Please provide more details about why this definition should be removed..."
                      className="min-h-[100px] bg-white"
                      maxLength={500}
                    />
                    <div className="text-xs text-[#8E8B82] text-right">
                      {additionalComments.length}/500
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!selectedReason || submitting}
                  className="w-full bg-[#B04A39] hover:bg-[#B04A39]/90 text-white"
                  onClick={() => console.log('🔘 Submit button clicked')}
                >
                  {submitting ? 'Submitting...' : ' Report to Bruno\'s Dictionary'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
} 