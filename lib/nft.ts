import { Connection, PublicKey } from '@solana/web3.js'

const COLLECTION_HASH = '2877987dc7db186f0349737e7d26415ddadff5faa01cddec5962a342b51dc11c'
const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com'

export interface NFTData {
  mint: string
  name: string
  image: string
}

export async function verifyNFTOwnership(walletAddress: string): Promise<NFTData | null> {
  try {
    const connection = new Connection(RPC_ENDPOINT)
    const publicKey = new PublicKey(walletAddress)
    
    // Get all token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    })

    // Check each token for NFT (amount = 1, decimals = 0)
    for (const { account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed.info
      const amount = parsedInfo.tokenAmount.uiAmount
      
      if (amount === 1 && parsedInfo.tokenAmount.decimals === 0) {
        const mintAddress = parsedInfo.mint
        
        // Fetch metadata
        const nftData = await fetchNFTMetadata(connection, mintAddress)
        
        if (nftData) {
          return nftData
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error verifying NFT ownership:', error)
    return null
  }
}

async function fetchNFTMetadata(connection: Connection, mintAddress: string) {
  try {
    const mintPubkey = new PublicKey(mintAddress)
    const metadataPDA = await getMetadataPDA(mintPubkey)
    const accountInfo = await connection.getAccountInfo(metadataPDA)
    
    if (!accountInfo) return null
    
    const metadata = parseMetadata(accountInfo.data)
    if (!metadata.uri) return null
    
    // Fetch JSON from URI
    const response = await fetch(metadata.uri)
    const json = await response.json()
    
    // Check if this NFT matches our collection by checking the URI or metadata
    const uriLower = metadata.uri.toLowerCase()
    if (uriLower.includes(COLLECTION_HASH.toLowerCase()) || 
        uriLower.includes('obese') ||
        json.collection?.name?.includes('OBESE MAXI BIZ')) {
      return {
        mint: mintAddress,
        name: json.name || metadata.name,
        image: json.image || null
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching metadata:', error)
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
  let offset = 1 + 32 + 32
  
  const nameLength = data.readUInt32LE(offset)
  offset += 4
  const name = data.slice(offset, offset + nameLength).toString('utf-8').replace(/\0/g, '')
  offset += nameLength
  
  const symbolLength = data.readUInt32LE(offset)
  offset += 4
  offset += symbolLength
  
  const uriLength = data.readUInt32LE(offset)
  offset += 4
  const uri = data.slice(offset, offset + uriLength).toString('utf-8').replace(/\0/g, '')
  
  return { name, uri }
}
