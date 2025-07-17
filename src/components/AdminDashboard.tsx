'use client'

import { useState, useEffect } from 'react'
import { X, Check, XCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface PendingItem {
  id: string
  definition_id: string
  status: string
  flagged_at: string
  definition: {
    id: string
    body: string
    example?: string
    score: number
    status: string
    words: {
      word: string
    }
    users: {
      name: string
      username: string
    }
  }
  flags: Array<{
    reason: string
    created_at: string
    users: {
      name: string
      username: string
    }
  }>
}

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchPendingItems()
    }
  }, [isOpen])

  const fetchPendingItems = async () => {
    try {
      const response = await fetch('/api/admin/queue')
      if (response.ok) {
        const data = await response.json()
        setPendingItems(data.items || [])
      } else {
        toast.error('Failed to load pending items')
      }
    } catch (error) {
      toast.error('Failed to load pending items')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (definitionId: string, action: 'approve' | 'reject') => {
    setProcessing(definitionId)
    
    try {
      const response = await fetch(`/api/admin/definitions/${definitionId}/${action}`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success(`Definition ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
        // Remove the item from the list
        setPendingItems(prev => prev.filter(item => item.definition_id !== definitionId))
      } else {
        const data = await response.json()
        toast.error(data.error || `Failed to ${action} definition`)
      }
    } catch (error) {
      toast.error(`Failed to ${action} definition`)
    } finally {
      setProcessing(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#FAF7F3] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#8E8B82]/20">
          <div>
            <h2 className="text-2xl font-playfair font-bold text-[#4E3629]">
              Admin Dashboard
            </h2>
            <p className="text-[#8E8B82] text-sm">
              {pendingItems.length} pending items to review
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-[#8E8B82] hover:text-[#4E3629]"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="text-center py-12">
              <EyeOff size={48} className="mx-auto text-[#8E8B82] mb-4" />
              <h3 className="text-lg font-medium text-[#4E3629] mb-2">
                No pending items
              </h3>
              <p className="text-[#8E8B82]">
                All flagged content has been reviewed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingItems.map((item) => (
                <Card key={item.id} className="bg-white border-[#8E8B82]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-[#4E3629] text-lg">
                          {item.definition.words.word}
                        </CardTitle>
                        <p className="text-[#8E8B82] text-sm">
                          Flagged {new Date(item.flagged_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        {item.flags.length} flag{item.flags.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Definition Content */}
                    <div>
                      <p className="text-[#8E8B82] mb-2">
                        <span className="font-medium text-[#4E3629]">Definition: </span>
                        "{item.definition.body}"
                      </p>
                      {item.definition.example && (
                        <p className="text-[#8E8B82]">
                          <span className="font-medium text-[#4E3629]">Example: </span>
                          "{item.definition.example}"
                        </p>
                      )}
                      <p className="text-xs text-[#8E8B82] mt-2">
                        By {item.definition.users.username || 'Anonymous'} • Score: {item.definition.score}
                      </p>
                    </div>

                    {/* Flag Reasons */}
                    <div>
                      <h4 className="font-medium text-[#4E3629] mb-2">Flag Reasons:</h4>
                      <div className="space-y-2">
                        {item.flags.map((flag, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-[#8E8B82]">
                              {flag.reason} - {flag.users.username || 'Anonymous'}
                            </span>
                            <span className="text-xs text-[#8E8B82]">
                              {new Date(flag.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-[#8E8B82]/20">
                      <Button
                        onClick={() => handleAction(item.definition_id, 'approve')}
                        disabled={processing === item.definition_id}
                        className="flex-1 bg-[#317a22] hover:bg-[#317a22]/90 text-white"
                      >
                        {processing === item.definition_id ? (
                          'Processing...'
                        ) : (
                          <>
                            <Check size={16} className="mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleAction(item.definition_id, 'reject')}
                        disabled={processing === item.definition_id}
                        className="flex-1 bg-[#ad4545] hover:bg-[#ad4545]/90 text-white"
                      >
                        {processing === item.definition_id ? (
                          'Processing...'
                        ) : (
                          <>
                            <XCircle size={16} className="mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 