'use client'

import { WalletProvider } from '@/components/WalletProvider'
import '../globals.css'
import '@solana/wallet-adapter-react-ui/styles.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <WalletProvider>{children}</WalletProvider>
}
