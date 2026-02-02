'use client'

import { useEffect, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger)

/* =====================
   Types & Dummy Data
===================== */
interface ConcernItem {
  id: number
  title: string
  image: string
}

const concerns: ConcernItem[] = [
  {
    id: 1,
    title: 'Tidur Nyenyak',
    image: '/concern-1.png',
  },
  {
    id: 2,
    title: 'Detoks',
    image: '/concern-1.png',
  },
  {
    id: 3,
    title: 'Energi',
    image: '/concern-1.png',
  },
]

const AUTO_SLIDE_MS = 4000
const SLIDE_DURATION = 0.5

export default function ShopByConcern() {
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-slide on mobile
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % concerns.length)
    }, AUTO_SLIDE_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)

    gsap.from('.concern-card-desktop', {
      scrollTrigger: {
        trigger: '.concern-grid',
        start: 'top 80%',
      },
      opacity: 0,
      y: 60,
      scale: 0.96,
      stagger: 0.15,
      duration: 0.9,
      ease: 'power3.out',
    })

    return () => clearTimeout(t)
  }, [])

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 md:mb-10 text-gray-900">
        Shop by Concern
      </h2>

      {/* Mobile: Carousel - 1 per slide, auto-slide */}
      <div className="md:hidden overflow-hidden rounded-2xl">
        <motion.div
          className="flex"
          style={{ width: `${concerns.length * 100}%` }}
          animate={{
            x: `-${currentIndex * (100 / concerns.length)}%`,
          }}
          transition={{
            type: 'tween',
            duration: SLIDE_DURATION,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {loading
            ? concerns.map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0"
                  style={{ width: `${100 / concerns.length}%` }}
                >
                  <ConcernSkeleton />
                </div>
              ))
            : concerns.map(item => (
                <div
                  key={item.id}
                  className="flex-shrink-0"
                  style={{ width: `${100 / concerns.length}%` }}
                >
                  <ConcernCard item={item} />
                </div>
              ))}
        </motion.div>
        {/* Dots */}
        {!loading && (
          <div className="flex justify-center gap-2 mt-4">
            {concerns.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-6 bg-green-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Grid 3 columns */}
      <div className="concern-grid hidden md:grid grid-cols-3 gap-8">
        {loading
          ? Array(3)
              .fill(0)
              .map((_, i) => <ConcernSkeleton key={i} />)
          : concerns.map(item => (
              <div key={item.id} className="concern-card-desktop">
                <ConcernCard item={item} />
              </div>
            ))}
      </div>
    </section>
  )
}

/* =====================
   Concern Card
===================== */
function ConcernCard({ item }: { item: ConcernItem }) {
  return (
    <div className="concern-card group relative w-full h-72 rounded-2xl md:rounded-3xl overflow-hidden shadow-soft cursor-pointer">
      {/* Image */}
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      {/* Title */}
      <div className="absolute bottom-6 left-6">
        <span className="inline-block bg-primary text-white text-sm font-medium px-4 py-2 rounded-full">
          {item.title}
        </span>
      </div>
    </div>
  )
}

/* =====================
   Skeleton
===================== */
function ConcernSkeleton() {
  return (
    <div className="h-72 w-full rounded-2xl md:rounded-3xl bg-gray-200 animate-pulse" />
  )
}
