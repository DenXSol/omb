import { Connection, PublicKey } from '@solana/web3.js'

const COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_ADDRESS!
const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com'

export interface NFTData {
  mint: string
  name: string
  image: string
}

export async function verifyNFTOwnership(walletAddress: string): Promise<NFTData | null> {
  try {
    const connection = new Connection(RPC_ENDPOINT, 'confirmed')
    const publicKey = new PublicKey(walletAddress)
    
    // Get all token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    })

    console.log(`Found ${tokenAccounts.value.length} token accounts`)

    // Check each token for NFT (amount = 1, decimals = 0)
    for (const { account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed.info
      const amount = parsedInfo.tokenAmount.uiAmount
      
      if (amount === 1 && parsedInfo.tokenAmount.decimals === 0) {
        const mintAddress = parsedInfo.mint
        console.log(`Checking NFT: ${mintAddress}`)
        
        // Fetch metadata
        const nftData = await fetchNFTMetadata(connection, mintAddress)
        
        if (nftData) {
          console.log('Found matching NFT!', nftData)
          return nftData
        }
      }
    }
    
    console.log('No matching NFT found')
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
    
    if (!accountInfo) {
      console.log('No metadata account found')
      return null
    }
    
    const metadata = parseMetadata(accountInfo.data)
    console.log('Parsed metadata:', metadata)
    
    if (!metadata.uri) {
      console.log('No URI in metadata')
      return null
    }
    
    // Check collection
    if (metadata.collection?.key === COLLECTION_ADDRESS && metadata.collection?.verified) {
      console.log('Collection verified! Fetching JSON...')
      
      // Fetch JSON from Arweave
      const response = await fetch(metadata.uri)
      const json = await response.json()
      
      return {
        mint: mintAddress,
        name: json.name || metadata.name,
        image: json.image || null
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching metadata for', mintAddress, error)
    return null
  }
}

async function getMetadataPDA(mint: PublicKey): Promise<PublicKey> {
  const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  const [publicKey] = PublicKey.findProgramAddressSync(
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
  try {
    let offset = 1 + 32 + 32 // key + update authority + mint
    
    // Name
    const nameLength = data.readUInt32LE(offset)
    offset += 4
    const name = data.slice(offset, offset + nameLength).toString('utf-8').replace(/\0/g, '')
    offset += nameLength
    
    // Symbol
    const symbolLength = data.readUInt32LE(offset)
    offset += 4
    offset += symbolLength
    
    // URI
    const uriLength = data.readUInt32LE(offset)
    offset += 4
    const uri = data.slice(offset, offset + uriLength).toString('utf-8').replace(/\0/g, '')
    offset += uriLength
    
    // Seller fee
    offset += 2
    
    // Creators
    const hasCreators = data[offset]
    offset += 1
    if (hasCreators) {
      const creatorCount = data.readUInt32LE(offset)
      offset += 4
      offset += creatorCount * 34
    }
    
    // Primary sale + mutable
    offset += 2
    
    // Edition nonce
    const hasEditionNonce = data[offset]
    offset += 1
    if (hasEditionNonce) {
      offset += 1
    }
    
    // Token standard
    const hasTokenStandard = data[offset]
    offset += 1
    if (hasTokenStandard) {
      offset += 1
    }
    
    // Collection
    const hasCollection = data[offset]
    offset += 1
    let collection = null
    
    if (hasCollection) {
      const verified = data[offset] === 1
      offset += 1
      const key = new PublicKey(data.slice(offset, offset + 32)).toString()
      collection = { verified, key }
    }
    
    return { name, uri, collection }
  } catch (error) {
    console.error('Error parsing metadata:', error)
    return { name: '', uri: '', collection: null }
  }
}
