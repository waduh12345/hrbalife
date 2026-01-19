'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Heart } from 'lucide-react'
import { stagger } from '@/lib/animations'
import { flyToCart } from '@/lib/flyToCart'

gsap.registerPlugin(ScrollTrigger)

/* =====================
   Animation Variants
===================== */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const cardHover = {
  hover: {
    y: -6,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
}

/* =====================
   Dummy Product Data
===================== */
const products = [
  {
    id: 1,
    name: 'Herbal Immunity Boost',
    variants: {
      capsule: {
        label: 'Capsule',
        price: 149000,
        compareAt: 199000,
        image: '/produk-1.png',
        stock: 3,
      },
      cair: {
        label: 'Cair',
        price: 139000,
        compareAt: 189000,
        image: '/produk-2.png',
        stock: 12,
      },
    },
  },
  {
    id: 2,
    name: 'Detox Herbal Cleanse',
    variants: {
      capsule: {
        label: 'Capsule',
        price: 159000,
        compareAt: 209000,
        image: '/produk-3.png',
        stock: 5,
      },
      cair: {
        label: 'Cair',
        price: 149000,
        compareAt: 199000,
        image: '/produk-4.png',
        stock: 2,
      },
    },
  },
]

export default function BestSellers() {
  const [loading] = useState(false)
  const [quickView, setQuickView] = useState<any>(null)

  /* GSAP Scroll Reveal */
  useEffect(() => {
    gsap.from('.product-card', {
      scrollTrigger: {
        trigger: '.product-grid',
        start: 'top 80%',
      },
      opacity: 0,
      y: 40,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power3.out',
    })
  }, [])

  return (
    <>
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-8 py-20"
      >
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-semibold mb-12"
        >
          Best Sellers
        </motion.h2>

        <div className="product-grid grid grid-cols-4 gap-8">
          {loading
            ? Array(4)
                .fill(0)
                .map((_, i) => <ProductSkeleton key={i} />)
            : products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickView}
                />
              ))}
        </div>
      </motion.section>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickView && (
          <QuickView
            product={quickView}
            onClose={() => setQuickView(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/* =====================
   Product Card
===================== */
function ProductCard({ product, onQuickView }: any) {
  const variantKeys = Object.keys(product.variants)
  const [activeVariant, setActiveVariant] = useState(variantKeys[0])
  const [liked, setLiked] = useState(false)

  const variant = product.variants[activeVariant]
  const imageRef = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      variants={fadeUp}
      whileHover="hover"
      className="product-card bg-white rounded-2xl shadow-soft p-4"
    >
      {/* Image */}
      <motion.div
        variants={cardHover}
        ref={imageRef}
        className="relative w-full aspect-square rounded-xl overflow-hidden mb-4"
      >
        <Image
          src={variant.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </motion.div>

      {/* Wishlist */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => setLiked(v => !v)}
        className="absolute top-8 right-8"
      >
        <Heart
          fill={liked ? '#2D5A27' : 'none'}
          className={liked ? 'text-primary' : ''}
        />
      </motion.button>

      <span className="text-xs text-accent font-medium">
        Best Seller
      </span>

      <h3 className="mt-2 font-medium">{product.name}</h3>

      {/* Variant */}
      <div className="mt-1 text-sm text-gray-500 flex gap-2">
        {variantKeys.map(key => (
          <button
            key={key}
            onClick={() => setActiveVariant(key)}
            className={
              activeVariant === key
                ? 'text-primary font-medium'
                : 'hover:text-primary'
            }
          >
            {product.variants[key].label}
          </button>
        ))}
      </div>

      {/* Stock */}
      <p
        className={`text-xs mt-1 ${
          variant.stock <= 3
            ? 'text-red-500'
            : 'text-green-600'
        }`}
      >
        {variant.stock <= 3
          ? `Sisa ${variant.stock} stok`
          : 'Stok tersedia'}
      </p>

      {/* Price */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-primary font-semibold">
          Rp {variant.price.toLocaleString()}
        </span>
        <span className="text-sm text-gray-400 line-through">
          Rp {variant.compareAt.toLocaleString()}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          className="flex-1 border rounded-full py-2 text-sm hover:bg-primary hover:text-white"
          onClick={() => {
            const cartEl = document.getElementById('cart-icon')
            const img = imageRef.current?.querySelector('img')
            if (cartEl && img) {
              flyToCart(img, cartEl)
            }
          }}
        >
          Add to Cart
        </button>

        <button
          className="flex-1 text-sm text-primary"
          onClick={() => onQuickView(product)}
        >
          Quick View
        </button>
      </div>
    </motion.div>
  )
}

/* =====================
   Skeleton
===================== */
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-4 animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  )
}

/* =====================
   Quick View Modal
===================== */
function QuickView({ product, onClose }: any) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 w-[720px]"
        initial={{ scale: 0.95, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 40 }}
      >
        <h3 className="text-xl font-semibold mb-4">
          {product.name}
        </h3>
        <button onClick={onClose}>✕</button>
      </motion.div>
    </motion.div>
  )
}
