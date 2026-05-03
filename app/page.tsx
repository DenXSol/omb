'use client'

import { WalletProvider } from '@/components/WalletProvider'
import { CouncilHub } from '@/components/CouncilHub'

export default function Home() {
  return (
    <WalletProvider>
      <CouncilHub />
    </WalletProvider>
  )
}
