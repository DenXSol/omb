import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface CouncilUser {
  wallet_address: string
  display_name: string
  twitter?: string
  telegram?: string
  discord?: string
  nft_image_url?: string
  nft_mint_address?: string
  last_seen: string
  created_at: string
}

export interface ChatMessage {
  id: string
  wallet_address: string
  display_name: string
  message?: string
  gif_url?: string
  created_at: string
}

export interface Idea {
  id: string
  wallet_address: string
  display_name: string
  idea: string
  upvotes: number
  created_at: string
}

export interface Raid {
  id: string
  wallet_address: string
  display_name: string
  tweet_url: string
  created_at: string
}
