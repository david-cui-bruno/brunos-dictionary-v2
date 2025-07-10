import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import VoteButtons from '@/components/VoteButtons'
import AddDefinitionForm from '@/components/AddDefinitionForm'
import { getWordBySlug } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Vote, Flag, Plus } from 'lucide-react'

export default async function WordDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const { data: word, error } = await getWordBySlug(params.slug)

  if (error || !word) {
    console.error('Word not found:', params.slug, error)
    notFound()
  }

  return (
    <div className="min-h-screen bg-paper-white">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brown-primary mb-4">
            {word.word}
          </h1>
          
          {word.definitions && word.definitions.length > 0 ? (
            <div className="space-y-6">
              {word.definitions.map((definition) => (
                <div key={definition.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-lg text-gray-700 flex-1">{definition.body}</p>
                    <VoteButtons 
                      definitionId={definition.id}
                      initialScore={definition.score || 0}
                      initialUserVote={0}
                    />
                  </div>
                  
                  {definition.example && (
                    <div className="mt-4 p-4 bg-cream rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Example:</p>
                      <p className="italic">"{definition.example}"</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span>Score: {definition.score || 0}</span>
                    <span>•</span>
                    <span>{definition.created_at ? new Date(definition.created_at).toLocaleDateString() : 'Unknown date'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No definitions available for this word.</p>
          )}
        </div>

        {/* Add Definition Form */}
        <div className="mt-12">
          <AddDefinitionForm 
            wordId={word.id}
            wordName={word.word}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
} 