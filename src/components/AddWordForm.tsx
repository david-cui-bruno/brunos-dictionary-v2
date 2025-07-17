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
import { Plus } from 'lucide-react'

interface AddWordFormProps {
  onSuccess?: () => void
}

// Character limits
const LIMITS = {
  word: 50,
  definition: 500,
  example: 200
}

export default function AddWordForm({ onSuccess }: AddWordFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    word: '',
    definition: '',
    example: ''
  })
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

    // Clear previous field errors
    setFieldErrors({ word: '', definition: '', example: '' })
    let hasErrors = false

    // Validate that required fields are not empty
    if (!formData.word.trim()) {
      setFieldErrors(prev => ({ ...prev, word: 'Word or phrase is required' }))
      hasErrors = true
    }
    if (!formData.definition.trim()) {
      setFieldErrors(prev => ({ ...prev, definition: 'Definition is required' }))
      hasErrors = true
    }
    // Note: example is now optional, so no validation needed

    if (hasErrors) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate character limits
    if (formData.word.length > LIMITS.word) {
      toast.error(`Word must be ${LIMITS.word} characters or less`)
      return
    }
    if (formData.definition.length > LIMITS.definition) {
      toast.error(`Definition must be ${LIMITS.definition} characters or less`)
      return
    }
    if (formData.example && formData.example.length > LIMITS.example) {
      toast.error(`Example must be ${LIMITS.example} characters or less`)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: formData.word.trim(),
          definition: formData.definition.trim(),
          example: formData.example.trim() || null // Send null if empty
        })
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
      setFieldErrors({ word: '', definition: '', example: '' })
      
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

  // Helper function to get character count color
  const getCharCountColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100
    if (percentage >= 90) return 'text-red-500'
    if (percentage >= 75) return 'text-orange-500'
    return 'text-[#8E8B82]'
  }

  // Helper function to check if form has any content
  const hasAnyContent = () => {
    return formData.word || formData.definition || formData.example
  }

  if (!session) {
    return (
      <div className="bruno-card text-center py-12">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">
          Sign in to contribute
        </h3>
        <p className="text-[#8E8B82] mb-6">
          Please log in to add new words to the dictionary.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Word Form */}
      <form onSubmit={handleSubmit} className="bruno-card space-y-6">
        {error && (
          <Alert className="border-[#B04A39] bg-red-50">
            <AlertDescription className="text-[#B04A39]">{error}</AlertDescription>
          </Alert>
        )}
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="word" className="block text-sm font-medium text-[#4E3629]">
              Word or Phrase *
            </label>
            <span className={`text-xs ${getCharCountColor(formData.word.length, LIMITS.word)}`}>
              {formData.word.length}/{LIMITS.word}
            </span>
          </div>
          <Input
            id="word"
            type="text"
            value={formData.word}
            onChange={(e) => setFormData({ ...formData, word: e.target.value })}
            placeholder="e.g., Ratty, Scili"
            required
            maxLength={LIMITS.word}
            className={`w-full px-4 py-3 border rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent ${
              fieldErrors.word 
                ? 'border-red-500 bg-red-50' 
                : formData.word.length > LIMITS.word 
                ? 'border-red-500' 
                : 'border-[#8E8B82]'
            }`}
          />
          {fieldErrors.word && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.word}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="definition" className="block text-sm font-medium text-[#4E3629]">
              Definition *
            </label>
            <span className={`text-xs ${getCharCountColor(formData.definition.length, LIMITS.definition)}`}>
              {formData.definition.length}/{LIMITS.definition}
            </span>
          </div>
          <Textarea
            id="definition"
            value={formData.definition}
            onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
            placeholder="Type your definition here..."
            rows={4}
            required
            maxLength={LIMITS.definition}
            className={`w-full px-4 py-3 border rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent resize-vertical ${
              fieldErrors.definition 
                ? 'border-red-500 bg-red-50' 
                : formData.definition.length > LIMITS.definition 
                ? 'border-red-500' 
                : 'border-[#8E8B82]'
            }`}
          />
          {fieldErrors.definition && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.definition}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="example" className="block text-sm font-medium text-[#4E3629]">
              Example Sentence
            </label>
            <span className={`text-xs ${getCharCountColor(formData.example.length, LIMITS.example)}`}>
              {formData.example.length}/{LIMITS.example}
            </span>
          </div>
          <Input
            id="example"
            type="text"
            value={formData.example}
            onChange={(e) => setFormData({ ...formData, example: e.target.value })}
            placeholder="Provide an example of how it's used in a sentence... (optional)"
            maxLength={LIMITS.example}
            className={`w-full px-4 py-3 border rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent ${
              fieldErrors.example 
                ? 'border-red-500 bg-red-50' 
                : formData.example.length > LIMITS.example 
                ? 'border-red-500' 
                : 'border-[#8E8B82]'
            }`}
          />
          {fieldErrors.example && (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.example}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bruno-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Plus size={20} />
              <span>Add Word to Dictionary</span>
            </>
          )}
        </button>
      </form>

      {/* Guidelines */}
      <div className="bruno-card bg-[#FFFFFF] border-l-4 border-[#4C6B46]">
        <h3 className="font-playfair font-bold text-[#4E3629] mb-3">Submission Guidelines</h3>
        <ul className="space-y-2 text-sm text-[#8E8B82]">
          <li>• Words should be specific to Brown University culture</li>
          <li>• Keep definitions clear and don't use offensive or explicit language</li>
          <li>• Examples should show authentic usage</li>
          <li>• All submissions are reviewed before publication</li>
          <li>• This is a community resource, so please be respectful</li>
        </ul>
      </div>
    </div>
  )
} 