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
      className="story bg-white py-12 sm:py-16 md:py-24"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 px-0 sm:px-4 md:px-8">
        {/* Visual - Full width on mobile, then title & description below */}
        <div className="story-item w-full relative aspect-[4/3] md:aspect-[4/3] md:min-h-[400px] overflow-hidden md:rounded-3xl bg-gray-100">
          <Image
            src="/brand-story.png"
            alt="Brand Story"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Content - Below image on mobile, right column on desktop */}
        <div className="px-4 sm:px-6 md:px-0 flex flex-col justify-center">
          <h2 className="story-item text-2xl sm:text-3xl font-semibold text-green-700 mb-4 sm:mb-6">
            Dari Alam untuk Kesehatan Anda
          </h2>
          <p className="story-item text-gray-600 leading-relaxed text-sm sm:text-base">
            Kami menggunakan bahan herbal alami pilihan,
            diproses dengan standar kualitas tinggi untuk
            mendukung kesehatan jangka panjang.
          </p>
          <p className="story-item text-gray-600 leading-relaxed mt-4 text-sm sm:text-base">
            Kami percaya bahwa kesehatan yang baik dimulai dari alam.
          </p>
          <p className="story-item text-gray-600 leading-relaxed mt-4 text-sm sm:text-base">
            Dengan komitmen terhadap keberlanjutan, kami memastikan bahwa setiap produk
            yang kami tawarkan tidak hanya baik untuk Anda, tetapi juga untuk
            lingkungan.
          </p>
          <p className="story-item text-gray-600 leading-relaxed mt-4 text-sm sm:text-base">
            Bergabunglah dengan kami dalam perjalanan menuju
            hidup yang lebih sehat dan harmonis dengan alam.
          </p>
        </div>
      </div>
    </section>
  )
}
