'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

interface User {
  id: string
  username: string
  karma: number
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLeaderboard = async () => {
    try {
      // Get all users
      const usersResponse = await fetch('/api/users')
      const usersData = await usersResponse.json()
      
      if (!usersResponse.ok) throw new Error('Failed to fetch users')
      
      // Calculate karma for each user
      const leaderboard: User[] = []
      
      for (const user of usersData.users) {
        try {
          const karmaResponse = await fetch(`/api/profile/karma?user_id=${user.id}`)
          const karmaData = await karmaResponse.json()
          
          if (karmaResponse.ok && karmaData.karma > 0) {
            leaderboard.push({
              id: user.id,
              username: user.username || 'Anonymous',
              karma: karmaData.karma
            })
          }
        } catch (error) {
          console.error(`Error calculating karma for user ${user.id}:`, error)
        }
      }

      // Sort by karma (descending)
      setUsers(leaderboard.sort((a, b) => b.karma - a.karma))
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [])

  // Listen for vote updates
  useEffect(() => {
    const handleVoteUpdate = () => {
      // Refresh leaderboard when votes change
      fetchLeaderboard()
    }

    window.addEventListener('voteUpdate', handleVoteUpdate)
    return () => window.removeEventListener('voteUpdate', handleVoteUpdate)
  }, [])

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

  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-playfair font-bold text-[#4E3629] mb-2">
              Leaderboard
            </h1>
            <p className="text-[#8E8B82]">
              Top contributors to Bruno's Dictionary
            </p>
          </div>

          {users.length > 0 ? (
            <div className="bruno-card">
              <div className="space-y-4">
                {users.map((user: User, index: number) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-[#FAF7F3] rounded-[2px] border border-[#8E8B82]">
                    <div className="flex items-center space-x-4">
                      <span className="text-[#4E3629] text-lg font-bold w-8 text-center">
                        {index + 1}
                      </span>
                      <span className="text-lg font-playfair font-semibold text-[#4E3629]">
                        {user.username}
                      </span>
                    </div>
                    <div className="text-[#8E8B82] font-medium">
                      {user.karma} points
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bruno-card text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">
                No contributors yet
              </h3>
              <p className="text-[#8E8B82]">Be the first to earn karma points!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
} 