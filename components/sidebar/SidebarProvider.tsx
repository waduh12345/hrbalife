'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, X } from 'lucide-react'

type SidebarType = 'search' | 'cart' | 'wishlist' | null

const SidebarContext = createContext<any>(null)

export function useSidebar() {
  return useContext(SidebarContext)
}

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [active, setActive] = useState<SidebarType>(null)
  const [isMobile, setIsMobile] = useState(false)

  /* =====================
     Detect Mobile
  ===================== */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* =====================
     ESC to Close
  ===================== */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  return (
    <SidebarContext.Provider value={{ active, setActive }}>
      {children}

      <AnimatePresence>
        {active && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
            />

            {/* Drawer */}
            <motion.aside
              className={`fixed z-50 bg-white shadow-xl
                ${isMobile
                  ? 'bottom-0 left-0 w-full h-[85%] rounded-t-3xl'
                  : 'top-0 right-0 h-full w-[420px]'}
              `}
              initial={
                isMobile ? { y: '100%' } : { x: '100%' }
              }
              animate={
                isMobile ? { y: 0 } : { x: 0 }
              }
              exit={
                isMobile ? { y: '100%' } : { x: '100%' }
              }
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <HeaderSidebar onClose={() => setActive(null)} />

              {active === 'search' && <SearchSidebar />}
              {active === 'cart' && <CartSidebar />}
              {active === 'wishlist' && <WishlistSidebar />}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </SidebarContext.Provider>
  )
}

/* =====================
   SHARED HEADER
===================== */
function HeaderSidebar({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <h3 className="font-semibold text-lg">Menu</h3>
      <button onClick={onClose}>
        <X />
      </button>
    </div>
  )
}

function SearchSidebar() {
  const loading = false

  return (
    <div className="p-6">
      <input
        autoFocus
        placeholder="Cari produk herbal..."
        className="w-full border rounded-full px-4 py-3 mb-6"
      />

      <h4 className="font-medium mb-4">Rekomendasi</h4>

      <div className="grid grid-cols-2 gap-4">
        {(loading ? Array(4).fill(0) : [1, 2, 3, 4]).map(
          (_, i) => (
            <div
              key={i}
              className={`rounded-xl h-28 ${
                loading
                  ? 'bg-gray-200 animate-pulse'
                  : 'bg-gray-100'
              }`}
            />
          )
        )}
      </div>

      <button className="mt-6 text-primary font-medium">
        Lihat semua produk →
      </button>
    </div>
  )
}

function CartSidebar() {
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Kunyit Putih',
      variant: '30 Capsules',
      price: 149000,
      compareAt: 199000,
      qty: 1,
    },
  ])

  const updateQty = (id: number, delta: number) => {
    setItems(items =>
      items.map(i =>
        i.id === id
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i
      )
    )
  }

  const total = items.reduce(
    (s, i) => s + i.price * i.qty,
    0
  )

  return (
    <div className="flex flex-col h-full">
      {/* Tambahan button Checkout di atas */}
      <div className="flex-1 p-6 space-y-6">
        {items.map(item => (
          <div key={item.id} className="flex gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg" />

            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.variant}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="font-semibold text-primary">
                  Rp {item.price.toLocaleString()}
                </span>
                <span className="text-sm line-through text-gray-400">
                  Rp {item.compareAt.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() =>
                    updateQty(item.id, -1)
                  }
                  className="border rounded-full p-1"
                >
                  <Minus size={14} />
                </button>

                <span>{item.qty}</span>

                <button
                  onClick={() =>
                    updateQty(item.id, 1)
                  }
                  className="border rounded-full p-1"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-6 md:mb-[60px]">
        <div className="flex justify-between mb-4">
          <span>Total</span>
          <span className="font-semibold">
            Rp {total.toLocaleString()}
          </span>
        </div>
        <button className="w-full bg-accent text-white rounded-full py-3">
          Checkout
        </button>
      </div>
    </div>
  )
}

function WishlistSidebar() {
  return (
    <div className="p-6 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg" />
          <div>
            <p className="font-medium">Produk Favorit</p>
            <p className="text-sm text-gray-500">
              Herbal Wellness
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
