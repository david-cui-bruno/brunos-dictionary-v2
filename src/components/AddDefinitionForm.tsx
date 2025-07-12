'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface AddDefinitionFormProps {
  wordId: string
  word: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AddDefinitionForm({ wordId, word, onSuccess, onCancel }: AddDefinitionFormProps) {
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
          body: formData.definition,
          example: formData.example || null
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
      toast.error((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="bruno-card text-center py-8">
        <p className="text-[#8E8B82]">
          Please log in to add definitions to the dictionary.
        </p>
      </div>
    )
  }

  return (
    <div className="bruno-card space-y-6">
      <div>
        <h3 className="text-lg font-playfair font-bold text-[#4E3629] mb-2">
          Add Definition for "{word}"
        </h3>
        <p className="text-[#8E8B82] text-sm">
          Help expand the definition of this word with your knowledge.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert className="border-[#B04A39] bg-red-50">
            <AlertDescription className="text-[#B04A39]">{error}</AlertDescription>
          </Alert>
        )}
        
        <div>
          <label htmlFor="definition" className="block text-sm font-medium text-[#4E3629] mb-2">
            Definition *
          </label>
          <Textarea
            id="definition"
            value={formData.definition}
            onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
            placeholder="Provide a clear, concise definition..."
            rows={4}
            required
            className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent resize-vertical"
          />
        </div>

        <div>
          <label htmlFor="example" className="block text-sm font-medium text-[#4E3629] mb-2">
            Example Sentence (optional)
          </label>
          <Textarea
            id="example"
            value={formData.example}
            onChange={(e) => setFormData({ ...formData, example: e.target.value })}
            placeholder="Show how the word is used in context..."
            rows={2}
            className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent resize-vertical"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting || !formData.definition}
            className="flex-1 bruno-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Definition'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-[#8E8B82] text-[#4E3629] rounded-[2px] font-medium transition-colors hover:bg-[#FAF7F3]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
} 