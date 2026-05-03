export interface NFTData {
  mint: string
  name: string
  image: string
}

export async function verifyNFTOwnership(walletAddress: string): Promise<NFTData | null> {
  try {
    // Fetch whitelist from API
    const response = await fetch('/api/admin/wallets')
    const data = await response.json()
    
    if (!data.wallets.includes(walletAddress)) {
      console.log('Wallet not in whitelist:', walletAddress)
      return null
    }

    console.log('Wallet verified in whitelist!')
    
    return {
      mint: 'verified',
      name: 'OBESE MAXI BIZ',
      image: 'https://arweave.net/Ov-F5PcWk1fTq82LjeANPXHcGH_XUTDCQi-yFEa7x5E'
    }
  } catch (error) {
    console.error('Error verifying wallet:', error)
    return null
  }
}
