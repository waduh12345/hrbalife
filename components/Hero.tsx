'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { ShieldCheck, Leaf, FlaskConical, Users } from 'lucide-react'
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
      className="relative overflow-hidden bg-gradient-to-br from-[#F9FBFA] via-white to-[#EEF5F0]"
    >
      <div className="grid grid-cols-2 gap-16 py-28 max-w-7xl mx-auto px-8 relative z-10">
        {/* LEFT CONTENT */}
        <div>
          <h1 className="text-5xl font-semibold leading-tight text-primary">
            Hidup Sehat Alami
            <br /> dengan Herbal Care
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            Produk herbal berkualitas tinggi untuk mendukung gaya hidup sehat Anda.
          </p>

          {/* CTA */}
          <div className="mt-8 flex items-center gap-4">
            <button className="bg-accent text-white px-8 py-4 rounded-full shadow-soft hover:opacity-90 transition">
              Belanja Sekarang
            </button>

            <button
              className="border border-primary text-primary px-8 py-4 rounded-full hover:bg-primary hover:text-white transition"
              onClick={() => router.push('/reseller')}
            >
              Daftar Reseller
            </button>
          </div>

          {/* COUNTER */}
          <div className="mt-8 flex items-center gap-3 text-sm text-gray-600">
            <Users size={18} className="text-primary" />
            <span>
              Dipercaya oleh{' '}
              <span
                ref={counterRef}
                className="font-semibold text-primary"
              >
                0
              </span>
              + pelanggan
            </span>
          </div>

          {/* TRUST TAGLINES */}
          <div
            ref={trustRef}
            className="mt-10 grid grid-cols-3 gap-6"
          >
            <TrustItem
              icon={<Leaf size={20} />}
              title="100% Alami"
              desc="Bahan herbal pilihan tanpa bahan kimia berbahaya"
            />
            <TrustItem
              icon={<FlaskConical size={20} />}
              title="Teruji Klinis"
              desc="Diproses dengan standar kualitas tinggi"
            />
            <TrustItem
              icon={<ShieldCheck size={20} />}
              title="Aman & Bersertifikat"
              desc="BPOM, Halal, dan Organik"
            />
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div
          ref={imageRef}
          className="rounded-3xl bg-gray-100 shadow-soft overflow-hidden"
        >
          <Image
            src="/hero.png"
            alt="Hero Image"
            width={600}
            height={400}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </div>
    </section>
  )
}

/* =====================
   Trust Item (Hover Micro)
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
    <div className="flex gap-3 group cursor-default">
      <div className="text-primary mt-1 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold group-hover:text-primary transition">
          {title}
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  )
}
