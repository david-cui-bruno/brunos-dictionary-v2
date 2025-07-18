import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { supabaseAdmin } from '@/lib/supabase'

interface User {
  id: string
  username: string
  karma: number
}

interface Vote {
  value: number | null
  user_id: string
}

interface Definition {
  author_id: string | null
  votes: Vote[]
}

async function getLeaderboard() {
  // Get all words to count per user (2 points each)
  const { data: words, error: wordsError } = await supabaseAdmin
    .from('words')
    .select('created_by')

  if (wordsError) {
    console.error('Words fetch error:', wordsError)
    throw wordsError
  }

  // Count words per user
  const wordCounts = words.reduce((acc: {[key: string]: number}, word) => {
    const userId = word.created_by
    if (userId) {  // Add null check
      acc[userId] = (acc[userId] || 0) + 1
    }
    return acc
  }, {})

  // Get votes received on definitions with voter info (1 point each)
  const { data: votesReceived, error: votesReceivedError } = await supabaseAdmin
    .from('definitions')
    .select(`
      author_id,
      votes (
        value,
        user_id
      )
    `)

  if (votesReceivedError) {
    console.error('Votes received fetch error:', votesReceivedError)
    throw votesReceivedError
  }

  // Calculate karma for each user
  const karmaMap: { [key: string]: number } = {}

  // Add 2 points per word created
  Object.entries(wordCounts).forEach(([userId, count]) => {
    karmaMap[userId] = (karmaMap[userId] || 0) + (count * 2)
  })

  // Process votes - only count upvotes once whether given or received
  votesReceived.forEach((def: Definition) => {
    const authorId = def.author_id
    
    if (authorId) { // Add null check for author_id
      def.votes?.forEach((vote: Vote) => {
        const voterId = vote.user_id
        
        if (vote.value && vote.value > 0) {
          if (voterId === authorId) {
            // Self-vote: count only once as a vote given
            karmaMap[voterId] = (karmaMap[voterId] || 0) + 1
          } else {
            // Vote from another user: count once for receiver and once for giver
            karmaMap[authorId] = (karmaMap[authorId] || 0) + 1  // point for receiving
            karmaMap[voterId] = (karmaMap[voterId] || 0) + 1    // point for giving
          }
        }
      })
    }
  })

  // Get user details for top users
  const userIds = Object.keys(karmaMap).slice(0, 20) // Top 20 users
  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .select('id, username')
    .in('id', userIds)

  if (usersError) {
    console.error('Users fetch error:', usersError)
    throw usersError
  }

  // Combine user data with karma
  const leaderboard: User[] = users
    .map(user => ({
      id: user.id,
      username: user.username || 'Anonymous',
      karma: karmaMap[user.id] || 0
    }))
    .sort((a, b) => b.karma - a.karma)

  return leaderboard
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
        </div>
      </main>

      <Footer />
    </div>
  )
} 