import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WHITELIST_FILE = path.join(process.cwd(), 'data', 'whitelist.json')
const ADMIN_WALLET = '28wN2g5ZP5fyGWaipNB3DKcU5yeFn1N7zVLqt9Xs1Gx7' // Your wallet

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(WHITELIST_FILE)) {
    fs.writeFileSync(WHITELIST_FILE, JSON.stringify({
      wallets: [
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
    }, null, 2))
  }
}

function readWhitelist() {
  ensureDataDir()
  const data = fs.readFileSync(WHITELIST_FILE, 'utf-8')
  return JSON.parse(data)
}

function writeWhitelist(data: any) {
  fs.writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2))
}

// GET - Fetch all wallets
export async function GET(request: NextRequest) {
  try {
    const data = readWhitelist()
    return NextResponse.json({ wallets: data.wallets })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load wallets' }, { status: 500 })
  }
}

// POST - Add wallet
export async function POST(request: NextRequest) {
  try {
    const { wallet } = await request.json()
    
    if (!wallet || typeof wallet !== 'string') {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const data = readWhitelist()
    
    if (data.wallets.includes(wallet)) {
      return NextResponse.json({ error: 'Wallet already exists' }, { status: 400 })
    }

    data.wallets.push(wallet)
    writeWhitelist(data)

    return NextResponse.json({ success: true, wallets: data.wallets })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add wallet' }, { status: 500 })
  }
}

// DELETE - Remove wallet
export async function DELETE(request: NextRequest) {
  try {
    const { wallet } = await request.json()
    
    if (!wallet || typeof wallet !== 'string') {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const data = readWhitelist()
    data.wallets = data.wallets.filter((w: string) => w !== wallet)
    writeWhitelist(data)

    return NextResponse.json({ success: true, wallets: data.wallets })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove wallet' }, { status: 500 })
  }
}
