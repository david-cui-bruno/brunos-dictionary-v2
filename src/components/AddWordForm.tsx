'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface AddWordFormProps {
  onSuccess?: () => void
}

export default function AddWordForm({ onSuccess }: AddWordFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    word: '',
    definition: '',
    example: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      toast.error('Please log in to add words')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('This word already exists in the dictionary')
        }
        throw new Error(data.error || 'Failed to create word')
      }

      toast.success('Word added successfully!')
      setFormData({ word: '', definition: '', example: '' })
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/search?q=${encodeURIComponent(data.word.word)}`)
      }

    } catch (error) {
      setError((error as Error).message)
      toast.error((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Please log in to add new words to the dictionary.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-cream card-shadow p-6 rounded-xl">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <label htmlFor="word" className="block text-sm font-medium text-gray-700 mb-1">
              Word *
            </label>
            <Input
              id="word"
              type="text"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              placeholder="Enter the slang word"
              required
            />
          </div>

          <div>
            <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-1">
              Definition *
            </label>
            <Textarea
              id="definition"
              value={formData.definition}
              onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
              placeholder="What does this word mean?"
              rows={3}
              required
            />
          </div>

          <div>
            <label htmlFor="example" className="block text-sm font-medium text-gray-700 mb-1">
              Example (optional)
            </label>
            <Textarea
              id="example"
              value={formData.example}
              onChange={(e) => setFormData({ ...formData, example: e.target.value })}
              placeholder="How is this word used in a sentence?"
              rows={2}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Word'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 