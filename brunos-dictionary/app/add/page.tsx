"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"

export default function AddWordPage() {
  const [formData, setFormData] = useState({
    word: "",
    definition: "",
    example: "",
    tags: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const createConfetti = () => {
    const colors = ["#B04A39", "#4C6B46", "#4E3629", "#8E8B82"]

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div")
      confetti.className = "confetti"
      confetti.style.left = Math.random() * 100 + "vw"
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.animationDelay = Math.random() * 3 + "s"
      document.body.appendChild(confetti)

      setTimeout(() => confetti.remove(), 3000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setShowSuccess(true)
    createConfetti()

    // Reset form
    setFormData({ word: "", definition: "", example: "", tags: "" })

    setTimeout(() => setShowSuccess(false), 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-playfair font-bold text-[#4E3629]">Add New Word</h1>
        <p className="text-[#8E8B82]">
          Contribute to Brown's slang dictionary and help fellow students learn the lingo
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bruno-card bg-[#4C6B46] text-white text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-playfair font-bold mb-2">Word Added Successfully!</h3>
          <p>Your contribution to Bruno's Dictionary has been submitted for review.</p>
        </div>
      )}

      {/* Add Word Form */}
      <form onSubmit={handleSubmit} className="bruno-card space-y-6">
        <div>
          <label htmlFor="word" className="block text-sm font-medium text-[#4E3629] mb-2">
            Word or Phrase *
          </label>
          <input
            type="text"
            id="word"
            name="word"
            value={formData.word}
            onChange={handleChange}
            required
            placeholder="e.g., Ratty, The Rock, Shopping Period"
            className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="definition" className="block text-sm font-medium text-[#4E3629] mb-2">
            Definition *
          </label>
          <textarea
            id="definition"
            name="definition"
            value={formData.definition}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Provide a clear, concise definition of the term..."
            className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent resize-vertical"
          />
        </div>

        <div>
          <label htmlFor="example" className="block text-sm font-medium text-[#4E3629] mb-2">
            Example Sentence *
          </label>
          <input
            type="text"
            id="example"
            name="example"
            value={formData.example}
            onChange={handleChange}
            required
            placeholder="Show how the word is used in context..."
            className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-[#4E3629] mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="campus, dining, academics, sports (separate with commas)"
            className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent"
          />
          <p className="text-sm text-[#8E8B82] mt-1">Add relevant tags to help others find your word (optional)</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.word || !formData.definition || !formData.example}
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
