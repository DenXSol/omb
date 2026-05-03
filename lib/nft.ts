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
    
    // Get metadata account
    const metadataPDA = await getMetadataPDA(mintPubkey)
    const accountInfo = await connection.getAccountInfo(metadataPDA)
    
    if (!accountInfo) return null
    
    // Parse metadata
    const metadata = parseMetadata(accountInfo.data)
    
    if (!metadata.uri) return null
    
    // Fetch JSON metadata from URI
    const response = await fetch(metadata.uri)
    const json = await response.json()
    
    return {
      name: metadata.name,
      collection: metadata.collection?.key || null,
      image: json.image || null
    }
  } catch (error) {
    console.error('Error fetching NFT metadata:', error)
    return null
  }
}

async function getMetadataPDA(mint: PublicKey): Promise<PublicKey> {
  const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  const [publicKey] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  )
  return publicKey
}

function parseMetadata(data: Buffer) {
  // Simplified metadata parsing
  let offset = 1 + 32 + 32 // key + update authority + mint
  
  // Parse name
  const nameLength = data.readUInt32LE(offset)
  offset += 4
  const name = data.slice(offset, offset + nameLength).toString('utf-8').replace(/\0/g, '')
  offset += nameLength
  
  // Parse symbol
  const symbolLength = data.readUInt32LE(offset)
  offset += 4
  offset += symbolLength
  
  // Parse URI
  const uriLength = data.readUInt32LE(offset)
  offset += 4
  const uri = data.slice(offset, offset + uriLength).toString('utf-8').replace(/\0/g, '')
  offset += uriLength
  
  // Skip seller fee basis points
  offset += 2
  
  // Skip creators
  const hasCreators = data[offset]
  offset += 1
  if (hasCreators) {
    const creatorCount = data.readUInt32LE(offset)
    offset += 4
    offset += creatorCount * 34
  }
  
  // Skip primary sale happened and is mutable
  offset += 2
  
  // Skip edition nonce
  const hasEditionNonce = data[offset]
  offset += 1
  if (hasEditionNonce) {
    offset += 1
  }
  
  // Skip token standard
  const hasTokenStandard = data[offset]
  offset += 1
  if (hasTokenStandard) {
    offset += 1
  }
  
  // Parse collection
  const hasCollection = data[offset]
  offset += 1
  let collection = null
  if (hasCollection) {
    const verified = data[offset] === 1
    offset += 1
    const key = new PublicKey(data.slice(offset, offset + 32)).toString()
    offset += 32
    collection = { verified, key }
  }
  
  return { name, uri, collection }
}
