'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useEffect, useState } from 'react'
import { verifyNFTOwnership, NFTData } from '@/lib/nft'
import { supabase, CouncilUser } from '@/lib/supabase'
import { ProfileSetup } from './ProfileSetup'
import { CouncilDashboard } from './CouncilDashboard'
import { Loader2 } from 'lucide-react'

export function CouncilHub() {
  const { publicKey, connected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [nftData, setNftData] = useState<NFTData | null>(null)
  const [user, setUser] = useState<CouncilUser | null>(null)
  const [needsProfile, setNeedsProfile] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      checkAccess()
    } else {
      setHasAccess(false)
      setUser(null)
      setNeedsProfile(false)
    }
  }, [connected, publicKey])

  async function checkAccess() {
    if (!publicKey) return
    
    setLoading(true)
    try {
      const walletAddress = publicKey.toString()
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('council_users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()
      
      if (existingUser) {
        setUser(existingUser)
        setHasAccess(true)
        setNeedsProfile(false)
        
        // Update last_seen
        await supabase
          .from('council_users')
          .update({ last_seen: new Date().toISOString() })
          .eq('wallet_address', walletAddress)
        
        return
      }
      
      // Verify NFT ownership
      const nft = await verifyNFTOwnership(walletAddress)
      
      if (nft) {
        setNftData(nft)
        setHasAccess(true)
        setNeedsProfile(true)
      } else {
        setHasAccess(false)
      }
    } catch (error) {
      console.error('Error checking access:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleProfileComplete(profileData: Omit<CouncilUser, 'wallet_address' | 'created_at' | 'last_seen'>) {
    if (!publicKey || !nftData) return
    
    const walletAddress = publicKey.toString()
    
    const { data, error } = await supabase
      .from('council_users')
      .insert({
        wallet_address: walletAddress,
        ...profileData,
        nft_image_url: nftData.image,
        nft_mint_address: nftData.mint,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating profile:', error)
      return
    }
    
    setUser(data)
    setNeedsProfile(false)
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-white sketch-text">
            ENTER THE COUNCIL
          </h1>
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-white !text-black hover:!bg-gray-200 !font-bold !text-lg !px-8 !py-4" />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto" />
          <p className="text-white text-lg">Verifying NFT ownership...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-5xl font-bold text-white">SORRY</h1>
          <p className="text-2xl text-gray-300">Bag work harder to make it</p>
          <p className="text-gray-400">
            You need to hold an OBESE MAXI BIZ NFT to access the council
          </p>
          <a
            href="https://www.mallow.art/collection/Cv4rbXWkdUwmz6qs1UkKNvSb8xJaY9HKGqnbitMAeTFD"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-black font-bold px-6 py-3 hover:bg-gray-200 transition-colors"
          >
            View Collection
          </a>
        </div>
      </div>
    )
  }

  if (needsProfile && nftData) {
    return <ProfileSetup nftData={nftData} onComplete={handleProfileComplete} />
  }

  if (user) {
    return <CouncilDashboard user={user} />
  }

  return null
}
