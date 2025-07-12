import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import AddWordForm from '@/components/AddWordForm'

export default function AddWordPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-playfair font-bold text-[#4E3629]">Add New Word</h1>
            <p className="text-[#8E8B82]">
              Contribute to Brown's slang dictionary and help fellow students learn the lingo
            </p>
          </div>

          <AddWordForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
 