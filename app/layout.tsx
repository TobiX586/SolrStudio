import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { MainLayout } from '@/components/layout/main-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Solr Studio',
  description: 'Modern web application for managing Apache Solr',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MainLayout>
            {children}
          </MainLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}