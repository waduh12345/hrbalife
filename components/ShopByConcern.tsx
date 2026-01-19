'use client'

import { useEffect, useState } from 'react'
import gsap from 'gsap'
import Image from 'next/image'

/* =====================
   Dummy Data
===================== */
const concerns = [
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

export default function ShopByConcern() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fake loading (UX polish)
    const t = setTimeout(() => setLoading(false), 600)

    // GSAP cinematic reveal
    gsap.from('.concern-card', {
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

  return (
    <section className="max-w-7xl mx-auto px-8 py-20">
      <h2 className="text-3xl font-semibold mb-10">
        Shop by Concern
      </h2>

      <div className="concern-grid grid grid-cols-3 gap-8">
        {loading
          ? Array(3)
              .fill(0)
              .map((_, i) => <ConcernSkeleton key={i} />)
          : concerns.map(item => (
              <ConcernCard key={item.id} item={item} />
            ))}
      </div>
    </section>
  )
}

/* =====================
   Concern Card
===================== */
function ConcernCard({ item }: any) {
  return (
    <div className="concern-card group relative h-72 rounded-3xl overflow-hidden shadow-soft cursor-pointer">
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
    <div className="h-72 rounded-3xl bg-gray-200 animate-pulse" />
  )
}
