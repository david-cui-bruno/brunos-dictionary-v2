"use client"

import { useState } from "react"
import { Trash2, Edit3 } from "lucide-react"
import { WordCard } from "@/components/word-card"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"words" | "settings">("words")
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: "Alex Chen",
    classYear: "2025",
    concentration: "Computer Science",
  })

  const userWords = [
    {
      word: "Slugfest",
      definition:
        "An intense study session, usually before finals, characterized by long hours and excessive caffeine consumption.",
      example: "I'm going into full slugfest mode this week - see you after finals!",
      tags: ["academics", "studying", "finals"],
      votes: 45,
    },
    {
      word: "The Hill",
      definition:
        "College Hill, the historic area where Brown University is located, often used to refer to campus life in general.",
      example: "Life on The Hill is so different from high school - I love the independence!",
      tags: ["campus", "location", "life"],
      votes: 65,
    },
  ]

  const handleSaveProfile = () => {
    setIsEditing(false)
    // Save logic would go here
  }

  const handleDeleteAccount = () => {
    // Delete account logic would go here
    console.log("Account deletion requested")
    setShowDeleteConfirm(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bruno-card">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-[#4E3629] rounded-full flex items-center justify-center text-white text-2xl font-playfair font-bold">
            {userInfo.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-playfair font-bold text-[#4E3629] mb-2">{userInfo.name}</h1>
            <p className="text-[#8E8B82] mb-4">
              Class of {userInfo.classYear} • {userInfo.concentration}
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-[#FAF7F3] rounded-[2px] border border-[#8E8B82]">
                <div className="text-2xl font-bold text-[#4E3629]">{userWords.length}</div>
                <div className="text-sm text-[#8E8B82]">Words Submitted</div>
              </div>
              <div className="text-center p-4 bg-[#FAF7F3] rounded-[2px] border border-[#8E8B82]">
                <div className="text-2xl font-bold text-[#4C6B46]">
                  {userWords.reduce((sum, word) => sum + word.votes, 0)}
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

          {userWords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userWords.map((word, index) => (
                <WordCard
                  key={index}
                  word={word.word}
                  definition={word.definition}
                  example={word.example}
                  tags={word.tags}
                  votes={word.votes}
                />
              ))}
            </div>
          ) : (
            <div className="bruno-card text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">No words yet</h3>
              <p className="text-[#8E8B82] mb-6">Start contributing to Bruno's Dictionary by adding your first word!</p>
              <a href="/add" className="bruno-button inline-block">
                Add Your First Word
              </a>
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
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629]"
                />
              ) : (
                <p className="text-[#8E8B82]">{userInfo.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4E3629] mb-2">Graduation Year</label>
              {isEditing ? (
                <input
                  type="text"
                  value={userInfo.classYear}
                  onChange={(e) => setUserInfo((prev) => ({ ...prev, classYear: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629]"
                />
              ) : (
                <p className="text-[#8E8B82]">Class of {userInfo.classYear}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4E3629] mb-2">Concentration</label>
              {isEditing ? (
                <input
                  type="text"
                  value={userInfo.concentration}
                  onChange={(e) => setUserInfo((prev) => ({ ...prev, concentration: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629]"
                />
              ) : (
                <p className="text-[#8E8B82]">{userInfo.concentration}</p>
              )}
            </div>

            {isEditing && (
              <button onClick={handleSaveProfile} className="bruno-button">
                Save Changes
              </button>
            )}
          </div>

          {/* Delete Account Section */}
          <div className="bruno-card border-[#B04A39] bg-red-50">
            <h3 className="text-lg font-playfair font-bold text-[#B04A39] mb-2">Danger Zone</h3>
            <p className="text-[#8E8B82] mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#B04A39] text-white rounded-[2px] hover:bg-[#9A3E31] transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete Account</span>
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-[#B04A39] font-medium">Are you absolutely sure? This action cannot be undone.</p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-[#B04A39] text-white rounded-[2px] hover:bg-[#9A3E31] transition-colors"
                  >
                    Yes, Delete My Account
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-[#8E8B82] rounded-[2px] hover:bg-[#FAF7F3] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
