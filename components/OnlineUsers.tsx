'use client'

import { useState, useEffect } from 'react'
import { supabase, CouncilUser } from '@/lib/supabase'
import { Circle } from 'lucide-react'

interface OnlineUsersProps {
  currentUser: CouncilUser
}

export function OnlineUsers({ currentUser }: OnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<CouncilUser[]>([])

  useEffect(() => {
    loadOnlineUsers()
    
    // Update current user's last_seen every 30 seconds
    const heartbeat = setInterval(updateLastSeen, 30000)
    
    // Subscribe to user changes
    const subscription = subscribeToUsers()

    return () => {
      clearInterval(heartbeat)
      subscription()
    }
  }, [])

  async function loadOnlineUsers() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    const { data } = await supabase
      .from('council_users')
      .select('*')
      .gte('last_seen', fiveMinutesAgo)
      .order('last_seen', { ascending: false })

    if (data) {
      setOnlineUsers(data)
    }
  }

  async function updateLastSeen() {
    await supabase
      .from('council_users')
      .update({ last_seen: new Date().toISOString() })
      .eq('wallet_address', currentUser.wallet_address)
  }

  function subscribeToUsers() {
    const channel = supabase
      .channel('council_users')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'council_users' },
        () => {
          loadOnlineUsers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return (
    <div className="bg-white/5 border-2 border-white/20 p-4 sticky top-4">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Circle className="w-3 h-3 fill-green-400 text-green-400" />
        Online ({onlineUsers.length})
      </h3>

      <div className="space-y-2">
        {onlineUsers.map((user) => (
          <div
            key={user.wallet_address}
            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors"
          >
            {/* Avatar */}
            {user.nft_image_url ? (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={user.nft_image_url}
                  alt={user.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">
                  {user.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">
                {user.display_name}
                {user.wallet_address === currentUser.wallet_address && (
                  <span className="text-xs text-gray-500 ml-1">(you)</span>
                )}
              </p>
              {user.twitter && (
                <p className="text-xs text-gray-500 truncate">
                  @{user.twitter.replace('@', '')}
                </p>
              )}
            </div>

            {/* Status */}
            <Circle className="w-2 h-2 fill-green-400 text-green-400 flex-shrink-0" />
          </div>
        ))}

        {onlineUsers.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No one else online
          </p>
        )}
      </div>
    </div>
  )
}
