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
          <label htmlFor="word" className="block text-sm font-medium text-[#4E3629] mb-2">
            Word or Phrase *
          </label>
          <Input
            id="word"
            type="text"
            value={formData.word}
            onChange={(e) => setFormData({ ...formData, word: e.target.value })}
            placeholder="e.g., Ratty, The Rock, Shopping Period"
            required
            className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="definition" className="block text-sm font-medium text-[#4E3629] mb-2">
            Definition *
          </label>
          <Textarea
            id="definition"
            value={formData.definition}
            onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
            placeholder="Provide a clear, concise definition of the term..."
            rows={4}
            required
            className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent resize-vertical"
          />
        </div>

        <div>
          <label htmlFor="example" className="block text-sm font-medium text-[#4E3629] mb-2">
            Example Sentence (optional)
          </label>
          <Input
            id="example"
            type="text"
            value={formData.example}
            onChange={(e) => setFormData({ ...formData, example: e.target.value })}
            placeholder="Show how the word is used in context..."
            className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.word || !formData.definition}
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
      <div className="bruno-card bg-[#FAF7F3] border-l-4 border-[#4C6B46]">
        <h3 className="font-playfair font-bold text-[#4E3629] mb-3">Submission Guidelines</h3>
        <ul className="space-y-2 text-sm text-[#8E8B82]">
          <li>• Words should be specific to Brown University culture</li>
          <li>• Keep definitions clear and family-friendly</li>
          <li>• Examples should show authentic usage</li>
          <li>• All submissions are reviewed before publication</li>
        </ul>
      </div>
    </div>
  )
} 