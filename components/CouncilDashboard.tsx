'use client'

import { useState, useEffect } from 'react'
import { CouncilUser } from '@/lib/supabase'
import { ChatPanel } from './ChatPanel'
import { PriceWidget } from './PriceWidget'
import { IdeasPanel } from './IdeasPanel'
import { RaidPanel } from './RaidPanel'
import { OnlineUsers } from './OnlineUsers'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

interface CouncilDashboardProps {
  user: CouncilUser
}

export function CouncilDashboard({ user }: CouncilDashboardProps) {
  const { disconnect } = useWallet()
  const [activeTab, setActiveTab] = useState<'chat' | 'ideas' | 'raid'>('chat')

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b-2 border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">CHONKY COUNCIL</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              {user.display_name}
            </span>
            <WalletMultiButton className="!bg-white/10 !text-white hover:!bg-white/20" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Price Widget */}
            <PriceWidget />

            {/* Tabs */}
            <div className="flex gap-2 border-b-2 border-white/20">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-3 font-bold transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                CHAT
              </button>
              <button
                onClick={() => setActiveTab('ideas')}
                className={`px-6 py-3 font-bold transition-colors ${
                  activeTab === 'ideas'
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                IDEAS
              </button>
              <button
                onClick={() => setActiveTab('raid')}
                className={`px-6 py-3 font-bold transition-colors ${
                  activeTab === 'raid'
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                RAID
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white/5 border-2 border-white/20 p-4 min-h-[600px]">
              {activeTab === 'chat' && <ChatPanel user={user} />}
              {activeTab === 'ideas' && <IdeasPanel user={user} />}
              {activeTab === 'raid' && <RaidPanel user={user} />}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <OnlineUsers currentUser={user} />
          </div>
        </div>
      </div>
    </div>
  )
}
