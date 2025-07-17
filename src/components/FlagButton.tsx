'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface FlagButtonProps {
  definitionId: string
  className?: string
}

export default function FlagButton({ 
  definitionId, 
  className = ""
}: FlagButtonProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [showAlreadyFlaggedModal, setShowAlreadyFlaggedModal] = useState(false)

  const handleFlagClick = async () => {
    if (!session?.user?.id) {
      router.push('/auth/signin')
      return
    }

    // Check if user has already flagged this definition
    try {
      const response = await fetch('/api/flag/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          definition_id: definitionId
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.alreadyFlagged) {
          // Show the already flagged modal
          setShowAlreadyFlaggedModal(true)
        } else {
          // Navigate to flag form page
          router.push(`/flag/${definitionId}`)
        }
      } else {
        // If check fails, still navigate to flag form
        router.push(`/flag/${definitionId}`)
      }
    } catch (error) {
      console.error('Flag check error:', error)
      // If check fails, still navigate to flag form
      router.push(`/flag/${definitionId}`)
    }
  }

  return (
    <>
      <button
        onClick={handleFlagClick}
        className={`p-2 rounded-[2px] hover:bg-[#8E8B82] hover:text-white transition-colors ${className}`}
        aria-label="Flag definition"
      >
        <Flag size={16} />
      </button>

      {/* Already Flagged Modal */}
      {showAlreadyFlaggedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🚩</div>
              <h3 className="text-lg font-playfair font-bold text-[#4E3629] mb-2">
                Already Flagged
              </h3>
              <p className="text-[#8E8B82] mb-6">
                You have already flagged this definition for review. Our team will review it shortly.
              </p>
              <button
                onClick={() => setShowAlreadyFlaggedModal(false)}
                className="bg-[#B04A39] hover:bg-[#B04A39]/90 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 