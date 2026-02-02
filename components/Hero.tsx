'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { ShieldCheck, Leaf, FlaskConical, Users, Star, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!heroRef.current) return

    /* =====================
       Hero Entrance
    ===================== */
    gsap.fromTo(
      heroRef.current.children,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power3.out',
      }
    )

    /* =====================
       Trust Items Stagger
    ===================== */
    if (trustRef.current) {
      gsap.fromTo(
        trustRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          delay: 0.6,
          duration: 0.6,
          ease: 'power2.out',
        }
      )
    }

    /* =====================
       Counter Animation
    ===================== */
    if (counterRef.current) {
      gsap.fromTo(
        counterRef.current,
        { innerText: 0 },
        {
          innerText: 10000,
          duration: 2,
          ease: 'power1.out',
          snap: { innerText: 1 },
          onUpdate: function () {
            counterRef.current!.innerText =
              Math.floor(
                Number(counterRef.current!.innerText)
              ).toLocaleString()
          },
        }
      )
    }

    /* =====================
       Hero Parallax Image
    ===================== */
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50/30"
    >
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-10"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 py-12 md:py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* LEFT CONTENT */}
        <div className="flex flex-col justify-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full w-fit mb-6 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Terpercaya Sejak 2020</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6">
            Hidup Sehat Alami
            <br />
            <span className="text-green-600">dengan HerbalCare</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 leading-relaxed">
            Produk herbal berkualitas tinggi yang diformulasikan khusus untuk mendukung gaya hidup sehat Anda dan keluarga.
          </p>

          <p className="text-sm sm:text-base text-gray-500 mb-8 leading-relaxed">
            Kami menghadirkan solusi kesehatan alami dari bahan-bahan pilihan terbaik, diproses dengan teknologi modern dan standar internasional. Setiap produk dirancang untuk memberikan manfaat maksimal bagi kesehatan tubuh Anda secara menyeluruh.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">4.9/5.0</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-green-600" />
              <span>
                <span ref={counterRef} className="font-bold text-green-600">0</span>
                <span className="text-gray-500">+ Pelanggan Puas</span>
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
            <button 
              onClick={() => router.push('/product')}
              className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>Belanja Sekarang</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-green-600 hover:text-white transition-all duration-300"
              onClick={() => router.push('/reseller')}
            >
              Daftar Reseller
            </button>
          </div>

        </div>

        {/* RIGHT IMAGE - Mobile Responsive */}
        <div className="flex items-center justify-center lg:justify-end order-first lg:order-last">
          <div
            ref={imageRef}
            className="relative w-full max-w-lg lg:max-w-none rounded-3xl bg-gradient-to-br from-green-100 to-green-50 shadow-2xl overflow-hidden"
          >
            <div className="aspect-square lg:aspect-[5/5] relative">
              <Image
                src="/hero.png"
                alt="HerbalCare Products"
                fill
                className="object-cover"
                priority
              />
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/10 to-transparent"></div>
            </div>

            {/* Floating Badge */}
            <div className="absolute top-6 right-6 bg-white rounded-2xl shadow-xl p-4 backdrop-blur-sm bg-opacity-95">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-gray-600">100% Organic</span>
              </div>
              <p className="text-xl font-bold text-green-600">BPOM Certified</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* =====================
   Trust Item (Modern Card Style)
===================== */
function TrustItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex gap-3 sm:flex-col sm:gap-3 p-4 sm:p-5 rounded-2xl bg-white shadow-sm border border-gray-100 group hover:shadow-lg hover:border-green-200 transition-all duration-300 cursor-default">
      <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl bg-green-100 text-green-600 transition-all duration-300 group-hover:bg-green-600 group-hover:text-white group-hover:scale-110">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm sm:text-base font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
          {title}
        </p>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  )
}
