import type { Metadata } from 'next'
import './globals.css'
import '@solana/wallet-adapter-react-ui/styles.css'

export const metadata: Metadata = {
  title: 'CHONKY Council | OBESE MAXI BIZ',
  description: 'Exclusive hub for OBESE MAXI BIZ holders',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
