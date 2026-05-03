'use client'

import { useState, useEffect } from 'react'
import { supabase, CouncilUser, Raid } from '@/lib/supabase'
import { formatTimestamp, getTweetIdFromUrl } from '@/lib/utils'
import { Send, ExternalLink } from 'lucide-react'

interface RaidPanelProps {
  user: CouncilUser
}

export function RaidPanel({ user }: RaidPanelProps) {
  const [raids, setRaids] = useState<Raid[]>([])
  const [tweetUrl, setTweetUrl] = useState('')

  useEffect(() => {
    loadRaids()
    subscribeToRaids()
  }, [])

  async function loadRaids() {
    const { data } = await supabase
      .from('council_raids')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setRaids(data)
    }
  }

  function subscribeToRaids() {
    const channel = supabase
      .channel('council_raids')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'council_raids' },
        (payload) => {
          setRaids((current) => [payload.new as Raid, ...current])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function submitRaid(e: React.FormEvent) {
    e.preventDefault()
    
    if (!tweetUrl.trim()) return

    const tweetId = getTweetIdFromUrl(tweetUrl)
    if (!tweetId) {
      alert('Invalid tweet URL')
      return
    }

    await supabase.from('council_raids').insert({
      wallet_address: user.wallet_address,
      display_name: user.display_name,
      tweet_url: tweetUrl.trim(),
    })

    setTweetUrl('')
  }

  return (
    <div className="space-y-6">
      {/* Submit Form */}
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-lg mb-2">Submit Tweet to Raid</h3>
          <p className="text-sm text-gray-400 mb-4">
            Paste a tweet URL and the council will raid it with likes and engagement
          </p>
        </div>

        <form onSubmit={submitRaid} className="flex gap-2">
          <input
            type="url"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
            placeholder="https://twitter.com/username/status/..."
            className="flex-1 bg-white/10 border-2 border-white/20 text-white px-4 py-2 focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            ADD
          </button>
        </form>
      </div>

      {/* Raids List */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Active Raids</h3>

        {raids.map((raid) => (
          <div
            key={raid.id}
            className="bg-white/5 border-2 border-white/20 p-4"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold">{raid.display_name}</span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(raid.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tweet Embed Preview */}
            <div className="bg-white/10 border-2 border-white/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Tweet</span>
                <a
                  href={raid.tweet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <a
                href={raid.tweet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white/5 hover:bg-white/10 border-2 border-white/20 transition-colors"
              >
                <p className="text-sm text-gray-300 break-all">
                  {raid.tweet_url}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Click to engage →
                </p>
              </a>
            </div>
          </div>
        ))}

        {raids.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No raids yet. Be the first to submit!
          </p>
        )}
      </div>
    </div>
  )
}
