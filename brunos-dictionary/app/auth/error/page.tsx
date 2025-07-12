"use client"

import { useSearchParams } from "next/navigation"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return "There is a problem with the server configuration."
      case "AccessDenied":
        return "You must use a @brown.edu email address to access Bruno's Dictionary."
      case "Verification":
        return "The verification link has expired or has already been used."
      default:
        return "An unexpected error occurred during sign in. Please try again."
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bruno-card max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-[#B04A39] rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} className="text-white" />
          </div>

          <h1 className="text-2xl font-playfair font-bold text-[#B04A39]">Sign In Error</h1>

          <p className="text-[#8E8B82]">{getErrorMessage(error)}</p>
        </div>

        <div className="space-y-3">
          <a href="/auth/signin" className="bruno-button w-full inline-block">
            Try Again
          </a>

          <a href="/" className="block text-[#8E8B82] hover:text-[#4E3629] transition-colors">
            Return to Home
          </a>
        </div>

        {error === "AccessDenied" && (
          <div className="pt-4 border-t border-[#8E8B82]">
            <p className="text-sm text-[#8E8B82]">
              <strong>Need a Brown email?</strong>
              <br />
              Bruno's Dictionary is exclusively for Brown University students, faculty, and staff. Please use your
              official @brown.edu email address.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
