import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import AddWordForm from '@/components/AddWordForm'

export default function AddWordPage() {
  return (
    <div className="min-h-screen bg-paper-white">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brown-primary mb-4">
            Add New Word
          </h1>
          <p className="text-gray-600">
            Help expand the Brown Slang Dictionary by adding new words and definitions.
          </p>
        </div>

        <AddWordForm />
      </main>

      <Footer />
    </div>
  )
}
 