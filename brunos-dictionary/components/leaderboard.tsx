interface LeaderboardProps {
  words: Array<{
    word: string
    votes: number
    rank: number
  }>
}

export function Leaderboard({ words }: LeaderboardProps) {
  const getBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bruno-badge-gold"
      case 2:
        return "bruno-badge-silver"
      case 3:
        return "bruno-badge-bronze"
      default:
        return "bg-[#8E8B82] text-white"
    }
  }

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return `#${rank}`
    }
  }

  return (
    <div className="bruno-card">
      <h2 className="text-2xl font-playfair font-bold text-[#4E3629] mb-6">Top Words Leaderboard</h2>

      <div className="space-y-4">
        {words.map((item) => (
          <div
            key={item.word}
            className="flex items-center justify-between p-4 bg-[#FAF7F3] rounded-[2px] border border-[#8E8B82]"
          >
            <div className="flex items-center space-x-4">
              <span className={`bruno-badge ${getBadgeClass(item.rank)} text-lg font-bold min-w-[3rem] text-center`}>
                {getRankEmoji(item.rank)}
              </span>
              <span className="text-lg font-playfair font-semibold text-[#4E3629]">{item.word}</span>
            </div>

            <div className="text-right">
              <span className="text-lg font-bold text-[#4C6B46]">{item.votes}</span>
              <span className="text-sm text-[#8E8B82] ml-1">votes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
