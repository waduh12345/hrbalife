'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Heart, ShoppingBag, ChevronDown, Menu, X, Leaf, Home, FileText, Info } from 'lucide-react'
import Link from 'next/link'
import { useSidebar } from '@/components/sidebar/SidebarProvider'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { setActive } = useSidebar()
  const { data: session, status } = useSession()

  const isLoggedIn = status === 'authenticated' && !!session

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed w-full top-0 bg-white z-50 shadow-sm"
    >
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
        {/* Logo - Desktop: Full logo, Mobile: Icon only */}
        <div className="text-2xl font-semibold text-primary">
          <Link href="/">
            {/* Desktop Logo */}
            <Image 
              src="/logo-herbal-care.webp" 
              alt="HerbalCare" 
              width={160} 
              height={40} 
              className="hidden sm:block"
            />
            {/* Mobile Logo */}
            <Image 
              src="/logo-herbal-care.webp" 
              alt="HerbalCare" 
              width={160} 
              height={40} 
              className="sm:hidden"
            />
          </Link>
        </div>

        {/* Spacer - Desktop only */}
        <div className="hidden sm:block flex-1" />

        {/* Navigation - Desktop only */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm font-medium">
            {/* SHOP MENU */}
            <li
              className="relative flex items-center gap-1 cursor-pointer hover:text-green-600 transition-colors"
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              Shop <ChevronDown size={16} />
              {/* Mega Menu */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-6 w-[720px] bg-white rounded-2xl shadow-xl border border-green-100 p-10"
                  >
                    <div className="grid grid-cols-4 gap-8">
                      <MenuColumn
                        title="Pencernaan"
                        items={['Maag', 'Asam Lambung', 'Detoks']}
                      />
                      <MenuColumn
                        title="Energi"
                        items={['Stamina', 'Daya Tahan', 'Pemulihan']}
                      />
                      <MenuColumn
                        title="Berat Badan"
                        items={['Diet Alami', 'Metabolisme', 'Lemak']}
                      />
                      <MenuColumn
                        title="Imun Tubuh"
                        items={['Antioksidan', 'Imunitas', 'Herbal Harian']}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
            <li>
              <Link href="/tentang-kami" className="hover:text-green-600 transition-colors cursor-pointer">Tentang Kami</Link>
            </li>
            <li>
              <Link href="/artikel" className="hover:text-green-600 transition-colors cursor-pointer">Artikel</Link>
            </li>
            <li>
              <span className="text-gray-300">|</span>
            </li>
          </ul>
        </nav>

        {/* Icons - Desktop only */}
        <div className="hidden md:flex items-center gap-5 text-gray-600 ml-8">
          <Search
            className="cursor-pointer hover:text-green-600 transition-colors w-5 h-5"
            onClick={() => setActive('search')}
          />
          <Link href={isLoggedIn ? '/me' : '/login'}>
            <User className="cursor-pointer hover:text-green-600 transition-colors w-5 h-5" />
          </Link>
          <Heart
            className="cursor-pointer hover:text-green-600 transition-colors w-5 h-5"
            onClick={() => setActive('wishlist')}
          />
          <ShoppingBag
            id="cart-icon"
            className="cursor-pointer hover:text-green-600 transition-colors w-5 h-5"
            onClick={() => setActive('cart')}
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-green-50 transition-colors"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-50 shadow-2xl md:hidden"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-green-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">HerbalCare</span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Mobile Menu Icons Row */}
            <div className="p-4 border-b border-green-100">
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    closeMobileMenu()
                    setActive('search')
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <Search className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Cari</span>
                </button>
                <Link
                  href={isLoggedIn ? '/me' : '/login'}
                  onClick={closeMobileMenu}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <User className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">{isLoggedIn ? 'Akun' : 'Masuk'}</span>
                </Link>
                <button
                  onClick={() => {
                    closeMobileMenu()
                    setActive('wishlist')
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <Heart className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Wishlist</span>
                </button>
                <button
                  onClick={() => {
                    closeMobileMenu()
                    setActive('cart')
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Keranjang</span>
                </button>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Menu</p>
              <nav className="space-y-1">
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors"
                >
                  <Home className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-700">Beranda</span>
                </Link>
                <Link
                  href="/product"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-700">Produk</span>
                </Link>
                <Link
                  href="/tentang-kami"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors"
                >
                  <Info className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-700">Tentang Kami</span>
                </Link>
                <Link
                  href="/artikel"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-700">Artikel</span>
                </Link>
              </nav>
            </div>

            {/* Mobile Menu Categories */}
            <div className="p-4 border-t border-green-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Kategori</p>
              <div className="grid grid-cols-2 gap-2">
                {['Pencernaan', 'Energi', 'Berat Badan', 'Imun Tubuh'].map((cat) => (
                  <Link
                    key={cat}
                    href={`/product?category=${cat.toLowerCase().replace(' ', '-')}`}
                    onClick={closeMobileMenu}
                    className="p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-green-50 hover:text-green-700 transition-colors text-center"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Menu Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-100 bg-white">
              {isLoggedIn ? (
                <Link
                  href="/me"
                  onClick={closeMobileMenu}
                  className="block w-full text-center py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  Akun Saya
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="block w-full text-center py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  Masuk / Daftar
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* =========================
   Mega Menu Column Component
========================= */
function MenuColumn({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div>
      <h4 className="mb-4 font-semibold text-green-700">{title}</h4>
      <ul className="space-y-2 text-sm text-gray-600">
        {items.map(item => (
          <li
            key={item}
            className="hover:text-green-600 cursor-pointer transition-colors"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
