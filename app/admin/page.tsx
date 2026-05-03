'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

// Your admin wallet address
const ADMIN_WALLET = '28wN2g5ZP5fyGWaipNB3DKcU5yeFn1N7zVLqt9Xs1Gx7' // Replace with your wallet

export default function AdminPanel() {
  const { publicKey, connected } = useWallet()
  const [wallets, setWallets] = useState<string[]>([])
  const [newWallet, setNewWallet] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toString()
      if (walletAddress === ADMIN_WALLET) {
        setIsAdmin(true)
        loadWallets()
      } else {
        setIsAdmin(false)
      }
    }
  }, [connected, publicKey])

  async function loadWallets() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/wallets')
      const data = await response.json()
      setWallets(data.wallets)
    } catch (error) {
      console.error('Error loading wallets:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addWallet() {
    if (!newWallet.trim()) return

    try {
      const response = await fetch('/api/admin/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: newWallet.trim() })
      })

      if (response.ok) {
        setNewWallet('')
        loadWallets()
      }
    } catch (error) {
      console.error('Error adding wallet:', error)
    }
  }

  async function removeWallet(wallet: string) {
    if (!confirm(`Remove wallet ${wallet}?`)) return

    try {
      const response = await fetch('/api/admin/wallets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet })
      })

      if (response.ok) {
        loadWallets()
      }
    } catch (error) {
      console.error('Error removing wallet:', error)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-white">ADMIN PANEL</h1>
          <WalletMultiButton className="!bg-white !text-black hover:!bg-gray-200 !font-bold" />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-white">ACCESS DENIED</h1>
          <p className="text-gray-400">You are not authorized to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">WHITELIST ADMIN</h1>
          <WalletMultiButton className="!bg-white/10 !text-white hover:!bg-white/20" />
        </div>

        {/* Add Wallet Form */}
        <div className="bg-white/5 border-2 border-white/20 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Wallet</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              placeholder="Enter Solana wallet address..."
              className="flex-1 bg-white/10 border-2 border-white/20 text-white px-4 py-2 focus:outline-none focus:border-white"
            />
            <button
              onClick={addWallet}
              className="px-6 py-2 bg-white text-black font-bold hover:bg-gray-200 transition-colors"
            >
              ADD
            </button>
          </div>
        </div>

        {/* Wallet List */}
        <div className="bg-white/5 border-2 border-white/20 p-6">
          <h2 className="text-xl font-bold mb-4">
            Whitelisted Wallets ({wallets.length})
          </h2>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <div
                  key={wallet}
                  className="flex items-center justify-between bg-white/5 p-4 border border-white/10"
                >
                  <code className="text-sm">{wallet}</code>
                  <button
                    onClick={() => removeWallet(wallet)}
                    className="px-4 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 text-sm font-bold transition-colors"
                  >
                    REMOVE
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Council
          </a>
        </div>
      </div>
    </div>
  )
}
