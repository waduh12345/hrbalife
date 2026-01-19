'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Instagram, Facebook, Youtube, ArrowUp } from 'lucide-react'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger)

export default function Footer() {
  const contentRef = useRef<HTMLDivElement>(null)
  const [showTop, setShowTop] = useState(false)
  const [sending, setSending] = useState(false)

  /* =====================
     GSAP Reveal (ISOLATED)
  ===================== */
  useEffect(() => {
    if (!contentRef.current) return

    gsap.fromTo(
      contentRef.current.querySelectorAll('[data-footer-animate]'),
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top 85%',
        },
      }
    )
  }, [])

  /* =====================
     Back To Top
  ===================== */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const submitNewsletter = () => {
    setSending(true)
    setTimeout(() => setSending(false), 1200)
  }

  return (
    <footer
      /* 🔒 HARD RESET — TIDAK TERPENGARUH GLOBAL */
      style={{
        backgroundColor: '#1F3A2B',
        color: '#FFFFFF',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        isolation: 'isolate',
      }}
      className="relative mt-24"
    >
      {/* MAIN GRID */}
      <div
        ref={contentRef}
        className="max-w-7xl mx-auto px-6 md:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10"
      >
        {/* BRAND + NEWSLETTER */}
        <div data-footer-animate>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12 }}>
            HerbalCare
          </h3>
          <p style={{ opacity: 0.85, fontSize: 14, lineHeight: 1.6, maxWidth: 360 }}>
            Produk herbal premium berbahan alami untuk mendukung
            gaya hidup sehat dan berkelanjutan.
          </p>

          <div style={{ display: 'flex', gap: 8, marginTop: 16, maxWidth: 360 }}>
            <input
              placeholder="Email Anda"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 999,
                border: 'none',
                outline: 'none',
                color: '#111',
              }}
            />
            <button
              onClick={submitNewsletter}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                border: 'none',
                color: '#fff',
                backgroundColor: sending ? 'rgba(255,255,255,0.3)' : '#88B04B',
                cursor: sending ? 'wait' : 'pointer',
              }}
            >
              {sending ? 'Mengirim…' : 'Kirim'}
            </button>
          </div>
        </div>

        {/* PRODUK */}
        <div data-footer-animate>
          <h4 style={{ fontWeight: 600, marginBottom: 12 }}>Produk</h4>
          <ul style={{ display: 'grid', gap: 8, fontSize: 14, opacity: 0.85 }}>
            {['Pencernaan', 'Energi', 'Imunitas', 'Detoks'].map(i => (
              <li key={i} style={{ cursor: 'pointer' }}>{i}</li>
            ))}
          </ul>
        </div>

        {/* BANTUAN + SOSIAL */}
        <div data-footer-animate style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: 12 }}>Bantuan</h4>
            <ul style={{ display: 'grid', gap: 8, fontSize: 14, opacity: 0.85 }}>
              {['FAQ', 'Cara Pemesanan', 'Pengembalian', 'Hubungi Kami'].map(i => (
                <li key={i} style={{ cursor: 'pointer' }}>{i}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
            <Instagram size={20} />
            <Facebook size={20} />
            <Youtube size={20} />
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4"
             style={{ fontSize: 13, opacity: 0.75 }}>
          <p>© {new Date().getFullYear()} HerbalCare. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Image src="/halal.png" alt="Halal" width={36} height={36} />
            <Image src="/mui.png" alt="MUI" width={36} height={36} />
          </div>
        </div>
      </div>

      {/* BACK TO TOP */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: '#88B04B',
            color: '#fff',
            borderRadius: '50%',
            padding: 12,
            border: 'none',
            cursor: 'pointer',
            zIndex: 50,
          }}
          aria-label="Back to top"
        >
          <ArrowUp />
        </button>
      )}
    </footer>
  )
}
