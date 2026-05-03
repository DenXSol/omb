'use client'

import { useState } from 'react'
import { NFTData } from '@/lib/nft'
import Image from 'next/image'
import { CouncilUser } from '@/lib/supabase'

interface ProfileSetupProps {
  nftData: NFTData
  onComplete: (data: Omit<CouncilUser, 'wallet_address' | 'created_at' | 'last_seen'>) => void
}

export function ProfileSetup({ nftData, onComplete }: ProfileSetupProps) {
  const [displayName, setDisplayName] = useState('')
  const [twitter, setTwitter] = useState('')
  const [telegram, setTelegram] = useState('')
  const [discord, setDiscord] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!displayName.trim()) {
      alert('Display name is required')
      return
    }
    
    onComplete({
      display_name: displayName,
      twitter: twitter || undefined,
      telegram: telegram || undefined,
      discord: discord || undefined,
    })
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 border-2 border-white/20 p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">WELCOME TO THE COUNCIL</h1>
          <p className="text-gray-400">Set up your profile</p>
        </div>

        <div className="flex justify-center">
          {nftData.image && (
            <div className="w-32 h-32 relative sketch-border">
              <Image
                src={nftData.image}
                alt={nftData.name}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-bold mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-white/10 border-2 border-white/20 text-white px-4 py-2 focus:outline-none focus:border-white"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2">
              Twitter
            </label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full bg-white/10 border-2 border-white/20 text-white px-4 py-2 focus:outline-none focus:border-white"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2">
              Telegram
            </label>
            <input
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              className="w-full bg-white/10 border-2 border-white/20 text-white px-4 py-2 focus:outline-none focus:border-white"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2">
              Discord
            </label>
            <input
              type="text"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              className="w-full bg-white/10 border-2 border-white/20 text-white px-4 py-2 focus:outline-none focus:border-white"
              placeholder="username#0000"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-bold py-3 hover:bg-gray-200 transition-colors"
          >
            ENTER COUNCIL
          </button>
        </form>
      </div>
    </div>
  )
}
