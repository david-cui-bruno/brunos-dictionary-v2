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
import { LogOut, Edit3, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import WordCard from "@/components/WordCard"
import { supabaseAdmin } from "@/lib/supabase"
import Image from 'next/image'
import { BearAvatar } from "@/components/ui/bear-avatar"

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

  // Add karma state
  const [karma, setKarma] = useState(0)

  // Load more state
  const [displayedWords, setDisplayedWords] = useState<Word[]>([])
  const [wordsToShow, setWordsToShow] = useState(4)

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData()
    }
  }, [session])

  // Add this effect to refresh karma when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.user?.id) {
        // Refresh karma when user returns to the page
        fetchUserData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [session?.user?.id])

  useEffect(() => {
    // Update form fields when profile data loads
    if (userProfile) {
      setUsername(userProfile.username || '')
      setGradYear(userProfile.grad_year?.toString() || '')
      // Keep as array for ConcentrationSelector
      setConcentrations(userProfile.concentration ? userProfile.concentration.split('|') : [])
    }
  }, [userProfile])

  // Update displayed words when myWords changes
  useEffect(() => {
    setDisplayedWords(myWords.slice(0, wordsToShow))
  }, [myWords, wordsToShow])

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

      // Fetch karma
      const karmaResponse = await fetch('/api/profile/karma')
      const karmaData = await karmaResponse.json()
      
      if (karmaResponse.ok) {
        setKarma(karmaData.karma)
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
          concentration: concentrations.join('|'), // Use pipe separator for storage
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

  const handleLoadMore = () => {
    setWordsToShow(prev => prev + 4)
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
              <BearAvatar size="lg" />
              <div className="flex flex-1 justify-between">
                <div>
                  <h1 className="text-3xl font-playfair font-bold text-[#4E3629] mb-2">
                    {userProfile?.username || userProfile?.name}
                  </h1>
                  <p className="text-[#8E8B82] text-sm mb-4">
                    Class of {userProfile?.grad_year} • {concentrations.join(', ')}
                  </p>
                </div>

                <div className="flex gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-end gap-2">
                      <div className="text-2xl font-bold text-[#4E3629] w-8 text-right">{myWords.length}</div>
                      <div className="text-sm text-[#4E3629]">words submitted</div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Link href="/leaderboard">
                        <div className={`text-2xl font-bold w-8 text-right hover:opacity-80 transition-opacity cursor-pointer ${
                          karma > 0 ? 'text-[#4C6B46]' : 
                          karma < 0 ? 'text-[#B04A39]' : 
                          'text-[#4E3629]'
                        }`}>
                          {karma}
                        </div>
                      </Link>
                      <div className="text-sm text-[#4E3629]">total karma</div>
                    </div>
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
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayedWords.map((word) => (
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
                  <div className="flex justify-center mt-16 gap-6">
                    {displayedWords.length < myWords.length && (
                      <button
                        onClick={handleLoadMore}
                        className="flex items-center text-[#8E8B82] font-medium hover:underline focus:outline-none bg-transparent border-none p-0 cursor-pointer"
                        style={{ boxShadow: "none" }}
                      >
                        Load More
                        <ChevronDown className="ml-1" size={18} />
                      </button>
                    )}
                    {displayedWords.length > 4 && (
                      <button
                        onClick={() => setWordsToShow(4)}
                        className="flex items-center text-[#8E8B82] font-medium hover:underline focus:outline-none bg-transparent border-none p-0 cursor-pointer"
                        style={{ boxShadow: "none" }}
                      >
                        Show Less
                        <ChevronUp className="ml-1" size={18} />
                      </button>
                    )}
                  </div>
                </>
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
                      className="min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-brown-primary focus:border-brown-primary"
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
                    <p className="text-[#8E8B82]">
                      {userProfile?.concentration?.split('|').join(', ')}
                    </p>
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
              <div className="bruno-card border-[#B04A39] bg-[#FFFFFF]">
                <div className="flex space-x-2">
                  {!showDeleteConfirm ? (
                    <>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => signOut({ callbackUrl: '/' })}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-3 w-full">
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
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}