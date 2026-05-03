import { Connection, PublicKey } from '@solana/web3.js'

const COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_ADDRESS!
const HELIUS_RPC = 'https://api.mainnet-beta.solana.com'

export interface NFTData {
  mint: string
  name: string
  image: string
}

export async function verifyNFTOwnership(walletAddress: string): Promise<NFTData | null> {
  try {
    const connection = new Connection(HELIUS_RPC)
    const publicKey = new PublicKey(walletAddress)
    
    // Get token accounts owned by wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    })

    // Check each token account for NFTs
    for (const { account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed.info
      const amount = parsedInfo.tokenAmount.uiAmount
      
      // NFTs have amount = 1 and 0 decimals
      if (amount === 1 && parsedInfo.tokenAmount.decimals === 0) {
        const mintAddress = parsedInfo.mint
        
        // Fetch metadata for this mint
        const nftData = await fetchNFTMetadata(mintAddress)
        
        if (nftData && nftData.collection === COLLECTION_ADDRESS) {
          return {
            mint: mintAddress,
            name: nftData.name,
            image: nftData.image
          }
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error verifying NFT ownership:', error)
    return null
  }
}

async function fetchNFTMetadata(mintAddress: string) {
  try {
    const connection = new Connection(HELIUS_RPC)
    const mintPubkey = new PublicKey(mintAddress)
    
    // Get metadata
