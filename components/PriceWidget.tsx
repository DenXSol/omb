'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const CHONKY_TOKEN = process.env.NEXT_PUBLIC_CHONKY_TOKEN!

interface DexScreenerPair {
  priceUsd: string
  priceChange: {
    h24: number
  }
}

export function PriceWidget() {
  const [price, setPrice] = useState<number | null>(null)
  const [change24h, setChange24h] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrice()
    const interval = setInterval(fetchPrice, 30000) // Update every 30s
    return () => clearInterval(interval)
  }, [])

  async function fetchPrice() {
    try {
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${CHONKY_TOKEN}`
      )
      const data = await response.json()
      
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0] as DexScreenerPair
        setPrice(parseFloat(pair.priceUsd))
        setChange24h(pair.priceChange?.h24 || 0)
      }
    } catch (error) {
      console.error('Error fetching price:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 border-2 border-white/20 p-6">
        <p className="text-gray-400">Loading price data...</p>
      </div>
    )
  }

  const isPositive = (change24h || 0) >= 0

  return (
    <div className="bg-white/5 border-2 border-white/20 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm text-gray-400 mb-1">$CHONKY</h2>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              ${price?.toFixed(8) || '—'}
            </span>
            {change24h !== null && (
              <span className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? '+' : ''}{change24h.toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          
            href={`https://dexscreener.com/solana/${CHONKY_TOKEN}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border-2 border-white/20 text-sm font-bold transition-colors"
          >
            CHART
          </a>
          
            href={`https://jup.ag/swap/SOL-${CHONKY_TOKEN}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white text-black hover:bg-gray-200 text-sm font-bold transition-colors"
          >
            BUY
          </a>
        </div>
      </div>
    </div>
  )
}
