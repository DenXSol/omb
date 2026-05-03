'use client'

import { useState, useEffect } from 'react'
import { supabase, CouncilUser, Idea } from '@/lib/supabase'
import { formatTimestamp } from '@/lib/utils'
import { Send, ThumbsUp } from 'lucide-react'

interface IdeasPanelProps {
  user: CouncilUser
}

export function IdeasPanel({ user }: IdeasPanelProps) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [newIdea, setNewIdea] = useState('')
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadIdeas()
    subscribeToIdeas()
  }, [])

  async function loadIdeas() {
    const { data } = await supabase
      .from('council_ideas')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setIdeas(data)
    }
  }

  function subscribeToIdeas() {
    const channel = supabase
      .channel('council_ideas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'council_ideas' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIdeas((current) => [payload.new as Idea, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setIdeas((current) =>
              current.map((idea) =>
                idea.id === payload.new.id ? (payload.new as Idea) : idea
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function submitIdea(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newIdea.trim()) return

    await supabase.from('council_ideas').insert({
      wallet_address: user.wallet_address,
      display_name: user.display_name,
      idea: newIdea.trim(),
    })

    setNewIdea('')
  }

  async function upvoteIdea(ideaId: string) {
    if (upvoted.has(ideaId)) return

    const idea = ideas.find((i) => i.id === ideaId)
    if (!idea) return

    await supabase
      .from('council_ideas')
      .update({ upvotes: idea.upvotes + 1 })
      .eq('id', ideaId)

    setUpvoted((current) => new Set(current).add(ideaId))
  }

  return (
    <div className="space-y-6">
      {/* Submit Form */}
      <form onSubmit={submitIdea} className="space-y-4">
        <textarea
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          placeholder="Share your idea to move $CHONKY forward..."
          rows={4}
          className="w-full bg-white/10 border-2 border-white/20 text-white px-4 py-2 focus:outline-none focus:border-white resize-none"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          SUBMIT IDEA
        </button>
      </form>

      {/* Ideas List */}
      <div className="space-y-4">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white/5 border-2 border-white/20 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-bold">{idea.display_name}</span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(idea.created_at)}
                  </span>
                </div>
                <p className="text-gray-200">{idea.idea}</p>
              </div>

              <button
                onClick={() => upvoteIdea(idea.id)}
                disabled={upvoted.has(idea.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 border-2 transition-colors ${
                  upvoted.has(idea.id)
                    ? 'bg-white/20 border-white/40 cursor-not-allowed'
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-bold">{idea.upvotes}</span>
              </button>
            </div>
          </div>
        ))}

        {ideas.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No ideas yet. Be the first to share!
          </p>
        )}
      </div>
    </div>
  )
}
