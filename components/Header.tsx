'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Heart, ShoppingBag, ChevronDown } from 'lucide-react'
import { useSidebar } from '@/components/sidebar/SidebarProvider'


export default function Header() {
  const [open, setOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const { setActive } = useSidebar()

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed w-full top-0 bg-white z-50 shadow-sm"
    >
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <div className="text-2xl font-semibold text-primary">
          HerbalCare
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Navigation */}
        <nav>
          <ul className="flex items-center gap-6 text-sm font-medium">
            {/* SHOP MENU */}
            <li
              className="relative flex items-center gap-1 cursor-pointer hover:text-primary"
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
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-6 w-[720px] bg-white rounded-2xl shadow-soft p-10"
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
            <li className="hover:text-primary cursor-pointer">Tentang Kami</li>
            <li className="hover:text-primary cursor-pointer">Artikel</li>
            <span className="text-gray-300">|</span>
          </ul>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-6 text-gray-600 ml-8">
          <Search
            className="cursor-pointer"
            onClick={() => setActive('search')}
          />
          <User className="cursor-pointer" />
          <Heart
            className="cursor-pointer"
            onClick={() => setActive('wishlist')}
          />
          <ShoppingBag
            id="cart-icon"
            className="cursor-pointer"
            onClick={() => setActive('cart')}
          />
        </div>
      </div>
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
      <h4 className="mb-4 font-semibold text-primary">{title}</h4>
      <ul className="space-y-2 text-sm text-gray-600">
        {items.map(item => (
          <li
            key={item}
            className="hover:text-primary cursor-pointer transition"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
