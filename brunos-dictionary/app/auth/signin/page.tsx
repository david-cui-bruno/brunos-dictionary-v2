import { Chrome } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bruno-card max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="text-6xl">🐻</div>
          <h1 className="text-3xl font-playfair font-bold text-[#4E3629]">Sign in to Bruno's Dictionary</h1>
          <p className="text-[#8E8B82]">
            Join the Brown University community and start contributing to our slang dictionary
          </p>
        </div>

        <button className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white border-2 border-[#8E8B82] rounded-[2px] hover:bg-[#FAF7F3] transition-colors group">
          <div className="w-5 h-5 bg-[#4285f4] rounded-sm flex items-center justify-center">
            <Chrome size={12} className="text-white" />
          </div>
          <span className="font-medium text-[#4E3629]">Sign in with Google</span>
        </button>

        <p className="text-sm text-[#8E8B82]">
          <strong>@brown.edu email addresses only</strong>
          <br />
          This ensures our dictionary stays authentic to the Brown community
        </p>

        <div className="pt-4 border-t border-[#8E8B82]">
          <p className="text-xs text-[#8E8B82]">
            By signing in, you agree to contribute respectfully to Bruno's Dictionary and follow Brown University's
            community standards.
          </p>
        </div>
      </div>
    </div>
  )
}
