import '../../styles/globals.css'

import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { ReactNode } from 'react'

import { SidebarProvider } from '@/components/sidebar/SidebarProvider'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

/* =====================
   Fonts
===================== */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const typography = {
  h1: 'text-5xl font-semibold',
  h2: 'text-3xl font-semibold',
  h3: 'text-xl font-medium',
  body: 'text-base leading-relaxed',
  small: 'text-sm',
}


/* =====================
   Metadata (SEO Ready)
===================== */
export const metadata: Metadata = {
  title: 'HerbalCare | Premium Herbal Wellness',
  description:
    'Premium herbal wellness products untuk mendukung gaya hidup sehat secara alami.',
  icons: {
    icon: '/favicon.ico',
  },
}

/* =====================
   Root Layout
===================== */
export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`
          ${inter.variable}
          ${montserrat.variable}
          bg-background
          text-gray-800
          antialiased
          font-sans
        `}
      >
        <SidebarProvider>
          {/* App Wrapper */}
          <div className="min-h-screen flex flex-col overflow-x-hidden">
            <main className="bg-background font-sans text-gray-800">
              <Header />
              {children}
              <Footer />
            </main>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              className="fixed bottom-6 right-6 z-40 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:opacity-90"
            >
              💬 Chat WhatsApp
            </a>

          </div>
        </SidebarProvider> 
      </body>
    </html>
  )
}
