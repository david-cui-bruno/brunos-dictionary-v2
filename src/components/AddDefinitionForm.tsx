'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface AddDefinitionFormProps {
  wordId: string
  wordName: string
  onSuccess?: () => void
}

export default function AddDefinitionForm({ wordId, wordName, onSuccess }: AddDefinitionFormProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    definition: '',
    example: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      toast.error('Please log in to add definitions')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word_id: wordId,
          definition: formData.definition,
          example: formData.example
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create definition')
      }

      toast.success('Definition added successfully!')
      setFormData({ definition: '', example: '' })
      
      if (onSuccess) {
        onSuccess()
      }

    } catch (error) {
      setError((error as Error).message)
      toast.error('Failed to add definition')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Please log in to add definitions.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Definition for "{wordName}"</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
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
            {isSubmitting ? 'Adding...' : 'Add Definition'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 