"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import useCart from "@/hooks/use-cart"; // Pastikan path ini sesuai
import { useRouter } from "next/navigation";

// --- 1. Definisi Tipe untuk Context ---
type SidebarType = "search" | "cart" | "wishlist" | null;

interface SidebarContextType {
  active: SidebarType;
  setActive: Dispatch<SetStateAction<SidebarType>>;
}

// Inisialisasi Context dengan tipe yang aman (bukan any)
const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<SidebarType>(null);
  const [isMobile, setIsMobile] = useState(false);

  /* =====================
      Detect Mobile
  ===================== */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* =====================
      ESC to Close
  ===================== */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

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
                ${
                  isMobile
                    ? "bottom-0 left-0 w-full h-[85%] rounded-t-3xl"
                    : "top-0 right-0 h-full w-[420px]"
                }
              `}
              initial={isMobile ? { y: "100%" } : { x: "100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <HeaderSidebar onClose={() => setActive(null)} />

              {active === "search" && <SearchSidebar />}
              {active === "cart" && <CartSidebar />}
              {active === "wishlist" && <WishlistSidebar />}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </SidebarContext.Provider>
  );
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
  );
}

function SearchSidebar() {
  const loading = false;

  return (
    <div className="p-6">
      <input
        autoFocus
        placeholder="Cari produk herbal..."
        className="w-full border rounded-full px-4 py-3 mb-6"
      />

      <h4 className="font-medium mb-4">Rekomendasi</h4>

      <div className="grid grid-cols-2 gap-4">
        {(loading ? Array(4).fill(0) : [1, 2, 3, 4]).map((_, i) => (
          <div
            key={i}
            className={`rounded-xl h-28 ${
              loading ? "bg-gray-200 animate-pulse" : "bg-gray-100"
            }`}
          />
        ))}
      </div>

      <button className="mt-6 text-primary font-medium">
        Lihat semua produk →
      </button>
    </div>
  );
}

/* =====================
   CART SIDEBAR (UPDATED)
===================== */
function CartSidebar() {
  const {
    cartItems,
    increaseItemQuantity,
    decreaseItemQuantity,
    getTotalPrice,
  } = useCart();

  const router = useRouter();

  // Mencegah hydration error
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const total = getTotalPrice();

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto pb-32">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <p>Keranjang belanja kosong</p>
          </div>
        ) : (
          cartItems.map((item) => {
            // Helper untuk menampilkan gambar
            const imageUrl =
              typeof item.image === "string"
                ? item.image
                : "https://via.placeholder.com/150";

            // --- PERBAIKAN LOGIC VARIANT & SIZE ---
            // Menggabungkan variant_name dan size_name jika keduanya ada
            // Filter(Boolean) akan menghapus value null/undefined/string kosong
            const details = [item.variant_name, item.size_name]
              .filter((val) => val) // Ambil yang ada isinya saja
              .join(" - "); // Gabungkan dengan strip

            // Logic compare price
            const compareAt = Number(item.markup_price) || 0;
            const hasDiscount = compareAt > item.price;

            return (
              <div key={item.cartId} className="flex gap-4">
                {/* Image Container */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="font-medium line-clamp-2 leading-tight">
                    {item.name}
                  </p>

                  {/* Render detail variant & size */}
                  {details && (
                    <p className="text-sm text-gray-500 mt-1">{details}</p>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-primary">
                      {formatCurrency(item.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs line-through text-gray-400">
                        {formatCurrency(compareAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decreaseItemQuantity(item.cartId)}
                        className="border rounded-full p-1 hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="min-w-[1.5ch] text-center font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseItemQuantity(item.cartId)}
                        className="border rounded-full p-1 hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t p-6 md:mb-[60px] bg-white">
        <div className="flex justify-between mb-4">
          <span>Total</span>
          <span className="font-semibold">{formatCurrency(total)}</span>
        </div>
        <button
        onClick={() => (router.push("/cart"))}
          className="w-full bg-accent text-white rounded-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={cartItems.length === 0}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

function WishlistSidebar() {
  return (
    <div className="p-6 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg" />
          <div>
            <p className="font-medium">Produk Favorit</p>
            <p className="text-sm text-gray-500">Herbal Wellness</p>
          </div>
        </div>
      ))}
    </div>
  );
}