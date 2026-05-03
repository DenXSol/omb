'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, CouncilUser, ChatMessage } from '@/lib/supabase'
import { formatTimestamp } from '@/lib/utils'
import Image from 'next/image'
import { Send, Image as ImageIcon, Smile } from 'lucide-react'
import { GifPicker } from './GifPicker'

interface ChatPanelProps {
  user: CouncilUser
}

export function ChatPanel({ user }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [message, setMessage] = useState('')
  const [showGifPicker, setShowGifPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    subscribeToMessages()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadMessages() {
    const { data } = await supabase
      .from('council_chat')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)

    if (data) {
      setMessages(data)
    }
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel('council_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'council_chat' },
        (payload) => {
          setMessages((current) => [...current, payload.new as ChatMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    
    if (!message.trim()) return

    await supabase.from('council_chat').insert({
      wallet_address: user.wallet_address,
      display_name: user.display_name,
      message: message.trim(),
    })

    setMessage('')
  }

  async function sendGif(gifUrl: string) {
    await supabase.from('council_chat').insert({
      wallet_address: user.wallet_address,
      display_name: user.display_name,
      gif_url: gifUrl,
    })
    
    setShowGifPicker(false)
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">
                {msg.display_name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Message Content */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bold">{msg.display_name}</span>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(msg.created_at)}
                </span>
              </div>

              {msg.message && (
                <p className="text-gray-200">{msg.message}</p>
              )}

              {msg.gif_url && (
                <img
                  src={msg.gif_url}
                  alt="GIF"
                  className="max-w-xs rounded mt-2"
                />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t-2 border-white/20 p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowGifPicker(!showGifPicker)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border-2 border-white/20 text-white px-4 py-2 focus:outline-none focus:border-white"
          />

          <button
            type="submit"
            className="px-6 py-2 bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            SEND
          </button>
        </form>

        {showGifPicker && (
          <div className="mt-4">
            <GifPicker onSelect={sendGif} onClose={() => setShowGifPicker(false)} />
          </div>
        )}
      </div>
    </div>
  )
}
