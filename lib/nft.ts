const WHITELISTED_WALLETS = [
  '28wN2g5ZP5fyGWaipNB3DKcU5yeFn1N7zVLqt9Xs1Gx7',
  'Csgu5FzNzhmseqwvKZyg9Wo5VASnccjEPBGsSrtq3U7N',
  'BUFv3Bw1ibgthuEbem6siGoNmMGwEReoWg557LGG3zvC',
  'ChoNkPTdvfVg3C48DfQ9tUKkYnMY7bpoKKf2AaPmya9o',
  '5ApZgkDhz2xoZeWYPFTzcKvxg2TqWZehpAK7ynN1GYRU',
  '4TjHNkjyoiz7cdusdZ6unzKG2epvnc2UawY46f24X4rd',
  'CQjQjrBxn3S8jGWrJ39B4fiJkAwiXpyGtKAcF7LrxBEu',
  '4eNH3HqF9zwVsBH5u4Fr6pTkJct9zriWQday8h9Texad',
  '8D7k4JBrpEQeSm6mmLGP2AVBZEQ72hgVciibCKDo7get',
  '56b57LGTb491sLC5n8Gmkx5SJJ32qnQDFH7aPw9ogbo1',
  '2pLK6sKiHpsoyPJpGxaK8ztELy5P935BRhgs84z4x2MX',
  '3bcqPRuV9QfjrTgcjP85wmtQcKAeEn14qXwrQpH7TEQY',
  'HycUC3WAbHh7JdvDAPCtyhpX4Qnnk3NxBsicutNhEHeu'
]

export interface NFTData {
  mint: string
  name: string
  image: string
}

export async function verifyNFTOwnership(walletAddress: string): Promise<NFTData | null> {
  try {
    // Check if wallet is in whitelist
    if (!WHITELISTED_WALLETS.includes(walletAddress)) {
      console.log('Wallet not in whitelist:', walletAddress)
      return null
    }

    console.log('Wallet verified in whitelist!')
    
    // Return dummy NFT data for whitelisted wallets
    return {
      mint: 'verified',
      name: 'OBESE MAXI BIZ',
      image: 'https://arweave.net/Ov-F5PcWk1fTq82LjeANPXHcGH_XUTDCQi-yFEa7x5E' // Using one of your NFT images
    }
  } catch (error) {
    console.error('Error verifying wallet:', error)
    return null
  }
}
