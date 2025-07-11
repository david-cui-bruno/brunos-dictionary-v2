'use client'

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import ProfileSetup from "@/components/ProfileSetup"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import ConcentrationSelector from '@/components/ConcentrationSelector'
import YearSelector from '@/components/YearSelector'
import { LogOut, Edit3, Trash2 } from "lucide-react"
import Link from "next/link"
import WordCard from "@/components/WordCard"

interface UserProfile {
  id: string
  netid: string
  name: string
  email: string
  username?: string
  grad_year?: number
  concentration?: string
}

interface Word {
  id: string
  word: string
  slug: string
  definitions?: Array<{
    body: string
    score: number
    example?: string
    id?: string
  }>
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [myWords, setMyWords] = useState<Word[]>([])
  const [myVotes, setMyVotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Settings form state
  const [username, setUsername] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [concentrations, setConcentrations] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // Delete account state
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [isEditing, setIsEditing] = useState(false);

  const [activeTab, setActiveTab] = useState<"words" | "settings">("words");

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData()
    }
  }, [session])

  useEffect(() => {
    // Update form fields when profile data loads
    if (userProfile) {
      setUsername(userProfile.username || '')
      setGradYear(userProfile.grad_year?.toString() || '')
      // Keep as array for ConcentrationSelector
      setConcentrations(userProfile.concentration ? userProfile.concentration.split('|') : [])
    }
  }, [userProfile])

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const profileResponse = await fetch('/api/profile')
      const profileData = await profileResponse.json()
      
      if (profileResponse.ok) {
        setUserProfile(profileData.profile)
      }

      // Fetch contributions
      const contributionsResponse = await fetch('/api/profile/contributions')
      const contributionsData = await contributionsResponse.json()
      
      if (contributionsResponse.ok) {
        setMyWords(contributionsData.words || [])
        setMyVotes(contributionsData.votes || [])
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setUpdateError('')
    setUpdateSuccess(false)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          gradYear: parseInt(gradYear),
          concentration: concentrations.join('|') // Store with | delimiter
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setUpdateError(data.error || 'Failed to update profile')
      } else {
        setUpdateSuccess(true)
        // Refresh user data
        await fetchUserData()
        // Clear success message after 3 seconds
        setTimeout(() => setUpdateSuccess(false), 3000)
      }
    } catch (err) {
      setUpdateError('Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setDeleteError('')

    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        setDeleteError(data.error || 'Failed to delete account')
      } else {
        // Sign out the user and redirect to home
        await signOut({ callbackUrl: '/' })
      }
    } catch (err) {
      setDeleteError('Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  // Show profile setup if user hasn't completed their profile
  if (!isLoading && userProfile && (!userProfile.username || !userProfile.grad_year || !userProfile.concentration)) {
    return (
      <div className="min-h-screen bg-[#FAF7F3]">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <ProfileSetup />
        </main>
        <Footer />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F3]">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  const initials = userProfile?.name?.split(' ').map(n => n[0]).join('') || 'U'

  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="bruno-card">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-[#4E3629] rounded-full flex items-center justify-center text-white text-2xl font-playfair font-bold">
                {initials}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-playfair font-bold text-[#4E3629] mb-2">
                  {userProfile?.username || userProfile?.name}
                </h1>
                <p className="text-[#8E8B82] mb-4">
                  Class of {userProfile?.grad_year} • {concentrations.join(', ')}
                </p>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-[#FAF7F3] rounded-[2px] border border-[#8E8B82]">
                    <div className="text-2xl font-bold text-[#4E3629]">{myWords.length}</div>
                    <div className="text-sm text-[#8E8B82]">Words Submitted</div>
                  </div>
                  <div className="text-center p-4 bg-[#FAF7F3] rounded-[2px] border border-[#8E8B82]">
                    <div className="text-2xl font-bold text-[#4C6B46]">
                      {myVotes.length}
                    </div>
                    <div className="text-sm text-[#8E8B82]">Total Karma</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-[#8E8B82] p-1 rounded-[2px]">
            <button
              onClick={() => setActiveTab("words")}
              className={`flex-1 py-2 px-4 rounded-[2px] font-medium transition-colors ${
                activeTab === "words" ? "bg-white text-[#4E3629]" : "text-white hover:bg-white/10"
              }`}
            >
              My Words
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-2 px-4 rounded-[2px] font-medium transition-colors ${
                activeTab === "settings" ? "bg-white text-[#4E3629]" : "text-white hover:bg-white/10"
              }`}
            >
              Settings
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "words" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-playfair font-bold text-[#4E3629]">Words You've Added</h2>

              {myWords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myWords.map((word) => (
                    <WordCard
                      key={word.id}
                      word={word.word}
                      definition={word.definitions?.[0]?.body || "No definition available"}
                      example={word.definitions?.[0]?.example}
                      slug={word.slug}
                      definitionId={word.definitions?.[0]?.id}
                      score={word.definitions?.[0]?.score || 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="bruno-card text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">No words yet</h3>
                  <p className="text-[#8E8B82] mb-6">Start contributing to Bruno's Dictionary by adding your first word!</p>
                  <Link href="/add" className="bruno-button inline-block">
                    Add Your First Word
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-playfair font-bold text-[#4E3629]">Account Settings</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 border border-[#8E8B82] rounded-[2px] hover:bg-[#FAF7F3] transition-colors"
                >
                  <Edit3 size={16} />
                  <span>{isEditing ? "Cancel" : "Edit"}</span>
                </button>
              </div>

              <div className="bruno-card space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#4E3629] mb-2">Full Name</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629]"
                    />
                  ) : (
                    <p className="text-[#8E8B82]">{userProfile?.username || userProfile?.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4E3629] mb-2">Graduation Year</label>
                  {isEditing ? (
                    <YearSelector
                      value={gradYear}
                      onChange={setGradYear}
                      placeholder="Select graduation year"
                    />
                  ) : (
                    <p className="text-[#8E8B82]">Class of {userProfile?.grad_year}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4E3629] mb-2">Concentration</label>
                  {isEditing ? (
                    <ConcentrationSelector
                      value={concentrations}
                      onChange={setConcentrations}
                      placeholder="Add concentration(s)"
                    />
                  ) : (
                    <p className="text-[#8E8B82]">{userProfile?.concentration}</p>
                  )}
                </div>

                {updateError && (
                  <p className="text-red-500 text-sm">{updateError}</p>
                )}

                {updateSuccess && (
                  <p className="text-green-500 text-sm">Profile updated successfully!</p>
                )}

                {isEditing && (
                  <Button 
                    type="button"
                    onClick={handleProfileUpdate}
                    disabled={isUpdating}
                    className="w-full bruno-button"
                  >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </Button>
                )}
              </div>

              {/* Delete Account Section */}
              <div className="bruno-card border-[#B04A39] bg-red-50">
                <h3 className="text-lg font-playfair font-bold text-[#B04A39] mb-2">Danger Zone</h3>
                <p className="text-[#8E8B82] mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                {!showDeleteConfirm ? (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      size="sm"
                      className="w-full"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeleteConfirm(false)}
                      size="sm"
                      className="w-full"
                    >
                      Cancel
                    </Button>
                    {deleteError && (
                      <p className="text-red-500 text-sm">{deleteError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}