'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

import Image from 'next/image'

export default function BrandStory() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.story-item', {
        scrollTrigger: {
          trigger: '.story',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.2,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="story bg-white py-24"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-16 px-8">
        {/* Visual */}
        <Image src="/brand-story.png" alt="Brand Story" width={600} height={400} className="story-item bg-gray-100 rounded-3xl shadow-soft" />

        {/* Content */}
        <div>
          <h2 className="story-item text-3xl font-semibold text-primary mb-6">
            Dari Alam untuk Kesehatan Anda
          </h2>
          <p className="story-item text-gray-600 leading-relaxed">
            Kami menggunakan bahan herbal alami pilihan,
            diproses dengan standar kualitas tinggi untuk
            mendukung kesehatan jangka panjang.
          </p>
          <p className="story-item text-gray-600 leading-relaxed mt-4">
            Kami percaya bahwa kesehatan yang baik dimulai dari alam.
          </p>
          <p className="story-item text-gray-600 leading-relaxed mt-4">
            Dengan komitmen terhadap keberlanjutan, kami memastikan bahwa setiap produk
            yang kami tawarkan tidak hanya baik untuk Anda, tetapi juga untuk
            lingkungan.
          </p>

          <p className="story-item text-gray-600 leading-relaxed mt-4">
            Bergabunglah dengan kami dalam perjalanan menuju
            hidup yang lebih sehat dan harmonis dengan alam.
          </p>
        </div>
      </div>
    </section>
  )
}
