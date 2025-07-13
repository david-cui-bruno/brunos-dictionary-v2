import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { supabaseAdmin } from '@/lib/supabase'

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
  votesReceived.forEach((def: any) => {
    const authorId = def.author_id
    
    def.votes?.forEach((vote: any) => {
      const voterId = vote.user_id
      
      if (vote.value > 0) {
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
  })

  // Get user details and combine with karma
  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .select('id, netid, name, grad_year')

  if (!users || usersError) {
    throw usersError || new Error('No users found')
  }

  // Combine user data with karma and sort
  type User = {
    id: string;
    netid: string;
    name?: string;
    grad_year?: number;
    concentration?: string;
  }

  const leaderboard = users.map(user => ({
    ...user,
    karma: karmaMap[user.id] || 0
  }))
    .sort((a, b) => b.karma - a.karma)
    .slice(0, 50)

  return leaderboard
}

export default async function LeaderboardPage() {
  const users = await getLeaderboard()

  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-playfair font-bold text-[#4E3629]">
              Karma Leaderboard
            </h1>
            <p className="text-[#8E8B82]">
              Top contributors to Bruno's Dictionary
            </p>
          </div>

          {/* Leaderboard */}
          <div className="bruno-card">
            <div className="space-y-2">
              {users.map((user: any, index: number) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between py-0.25 border-b border-[#8E8B82]/20 last:border-0"
                >
                  {/* Rank & User Info */}
                  <div className="flex items-center gap-6">
                    <div className="text-3xl font-bold text-[#000000] w-8">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-[#4E3629]">
                        {user.username || user.name}
                      </div>
                      <div className="text-xs text-[#8E8B82]">
                        Class of {user.grad_year}
                      </div>
                    </div>
                  </div>

                  {/* Karma Score */}
                  <div className={`text-xl font-bold ${
                    user.karma > 0 ? 'text-[#4C6B46]' : 
                    user.karma < 0 ? 'text-[#B04A39]' : 
                    'text-[#4E3629]'
                  }`}>
                    {user.karma}
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