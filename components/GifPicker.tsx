'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface GifPickerProps {
  onSelect: (url: string) => void
  onClose: () => void
}

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [search, setSearch] = useState('')
  const [gifs, setGifs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function searchGifs(query: string) {
    if (!query.trim()) {
      setGifs([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(query)}&limit=12`
      )
      const data = await response.json()
      setGifs(data.data || [])
    } catch (error) {
      console.error('Error searching GIFs:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    searchGifs(search)
  }

  return (
    <div className="bg-white/10 border-2 border-white/20 p-4 rounded">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Search GIFs</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search GIPHY..."
          className="flex-1 bg-white/10 border-2 border-white/20 text-white px-4 py-2 focus:outline-none focus:border-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-white text-black font-bold hover:bg-gray-200 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>

      {loading && (
        <p className="text-center text-gray-400">Loading...</p>
      )}

      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {gifs.map((gif) => (
          <button
            key={gif.id}
            onClick={() => onSelect(gif.images.fixed_height.url)}
            className="aspect-square overflow-hidden rounded hover:opacity-75 transition-opacity"
          >
            <img
              src={gif.images.fixed_height.url}
              alt={gif.title}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {gifs.length === 0 && !loading && search && (
        <p className="text-center text-gray-400">No GIFs found</p>
      )}
    </div>
  )
}
