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
import { LogOut } from "lucide-react"

interface UserProfile {
  id: string
  netid: string
  name: string
  email: string
  username?: string
  grad_year?: number
  concentration?: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [myWords, setMyWords] = useState([])
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
      // Parse concentration string back to array
      setConcentrations(userProfile.concentration ? userProfile.concentration.split(', ') : [])
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
          concentration: concentrations.join(', ') // Join for storage
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
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileSetup />
        </main>
        <Footer />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  const initials = userProfile?.name?.split(' ').map(n => n[0]).join('') || 'U'

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-brown-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-white">
                {initials}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-brown-primary">
                {userProfile?.username || userProfile?.name}
              </h1>
              <p className="text-muted-foreground">
                Class of {userProfile?.grad_year} • {userProfile?.concentration}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-8 text-center">
            <div>
              <div className="text-2xl font-semibold text-brown-primary">
                {myWords.length}
              </div>
              <div className="text-sm text-muted-foreground">Words Added</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-brown-primary">
                {myVotes.length}
              </div>
              <div className="text-sm text-muted-foreground">Karma</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="words" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="words" className="focus-ring">My Words</TabsTrigger>
            <TabsTrigger value="settings" className="focus-ring">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="words" className="space-y-4">
            {myWords.length > 0 ? (
              myWords.map((word) => (
                <Card key={word.id} className="bg-cream card-shadow p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-brown-primary mb-1">
                        {word.word}
                      </h3>
                      <p className="text-foreground text-sm mb-2">
                        {word.definitions?.[0]?.body || "No definition available"}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {word.definitions?.[0]?.score || 0} votes
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No words added yet.</p>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-cream card-shadow p-6 rounded-xl">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brown-primary mb-4">
                    Edit Profile
                  </h3>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="settings-username">Username</Label>
                      <Input
                        id="settings-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        required
                        minLength={3}
                        maxLength={15}
                      />
                    </div>

                    <div>
                      <Label htmlFor="settings-gradYear">Graduation Year</Label>
                      <YearSelector
                        value={gradYear}
                        onChange={setGradYear}
                        placeholder="Select graduation year"
                      />
                    </div>

                    <div>
                      <Label htmlFor="settings-concentration">Pick your Brown concentration(s)</Label>
                      <ConcentrationSelector
                        value={concentrations}
                        onChange={setConcentrations}
                        placeholder="Add concentration(s)"
                      />
                    </div>

                    {updateError && (
                      <p className="text-red-500 text-sm">{updateError}</p>
                    )}

                    {updateSuccess && (
                      <p className="text-green-500 text-sm">Profile updated successfully!</p>
                    )}

                    <Button 
                      type="submit" 
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {isUpdating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </div>
                
                <div className="pt-6 border-t border-border">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      size="sm"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                    
                    {!showDeleteConfirm ? (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete Account
                      </Button>
                    ) : (
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        size="sm"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                      </Button>
                    )}
                  </div>
                  
                  {showDeleteConfirm && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-gray-600">
                        Are you sure? This action cannot be undone. All your contributions will remain anonymous.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowDeleteConfirm(false)}
                        size="sm"
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
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
} 