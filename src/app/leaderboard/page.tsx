import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { supabaseAdmin } from '@/lib/supabase'

interface User {
  id: string
  username: string
  karma: number
}

async function getLeaderboard() {
  // Get all users with their karma calculated by the database function
  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .select('id, username')

  if (usersError) {
    console.error('Users fetch error:', usersError)
    throw usersError
  }

  // Calculate karma for each user using the database function
  const leaderboard: User[] = []
  
  for (const user of users) {
    try {
      const { data: karma, error: karmaError } = await supabaseAdmin
        .rpc('calculate_user_karma', { input_user_id: user.id })
      
      if (karmaError) {
        console.error(`Karma calculation error for user ${user.id}:`, karmaError)
        continue
      }
      
      // Only include users with karma > 0
      if (karma && karma > 0) {
        leaderboard.push({
          id: user.id,
          username: user.username || 'Anonymous',
          karma: karma
        })
      }
    } catch (error) {
      console.error(`Error calculating karma for user ${user.id}:`, error)
      continue
    }
  }

  // Sort by karma (descending)
  return leaderboard.sort((a, b) => b.karma - a.karma)
}

export default async function LeaderboardPage() {
  const users = await getLeaderboard()

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