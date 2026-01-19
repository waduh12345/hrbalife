'use client'

import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CheckCircle, ArrowRight, UserPlus, ShieldCheck, Tag, ShoppingBag } from 'lucide-react'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger)

/* =====================
   Dummy Data
===================== */
const benefits = [
  'Margin reseller hingga 35%',
  'Produk herbal legal & bersertifikat',
  'Dukungan materi marketing',
  'Tanpa minimum order besar',
]

const steps = [
  'Daftar sebagai reseller',
  'Verifikasi data',
  'Akses harga khusus',
  'Mulai jual & dapatkan komisi',
]

const resellerLevels = [
  {
    level: 'Bronze',
    target: '0 – 30 produk / bulan',
    discount: 'Diskon 20%',
    perks: [
      'Akses harga reseller',
      'Materi promosi dasar',
      'Support CS reseller',
    ],
    highlight: false,
  },
  {
    level: 'Silver',
    target: '31 – 100 produk / bulan',
    discount: 'Diskon 30%',
    perks: [
      'Margin lebih besar',
      'Materi promosi premium',
      'Prioritas stok',
    ],
    highlight: true, // level favorit
  },
  {
    level: 'Gold',
    target: '100+ produk / bulan',
    discount: 'Diskon hingga 40%',
    perks: [
      'Harga terbaik',
      'Akun manager khusus',
      'Akses produk eksklusif',
    ],
    highlight: false,
  },
]


const stepIcons = [
  <UserPlus className="w-16 h-16 text-accent text-black top-1/2 transform -translate-y-1/2" />,      // Daftar
  <ShieldCheck className="w-16 h-16 text-accent text-black top-1/2 transform -translate-y-1/2" />,   // Verifikasi
  <Tag className="w-16 h-16 text-accent text-black top-1/2 transform -translate-y-1/2" />,           // Harga khusus
  <ShoppingBag className="w-16 h-16 text-accent text-black top-1/2 transform -translate-y-1/2" />,   // Mulai jual
]

export default function ResellerPage() {
  const [loading, setLoading] = useState(true)

  /* =====================
     Fake Loading (Skeleton)
  ===================== */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  /* =====================
     GSAP Reveal
  ===================== */
  useEffect(() => {
    gsap.utils.toArray('[data-reveal]').forEach((el: any) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
          },
        }
      )
    })
  }, [])

  const [showForm, setShowForm] = useState(false)


  if (loading) return <ResellerSkeleton />

  return (
    <>
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-24">
        {/* HERO */}
        <section className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div data-reveal>
            <h1 className="text-4xl md:text-5xl font-semibold text-primary leading-tight">
              Bangun Penghasilan
              <br /> Bersama HerbalCare
            </h1>
            <p className="mt-6 text-gray-600 max-w-md">
              Bergabunglah sebagai reseller resmi dan dapatkan
              peluang bisnis herbal yang terus berkembang.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-8 inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-full shadow-soft hover:opacity-90"
            >
              Daftar Reseller
              <ArrowRight />
            </button>

            <p className="mt-4 text-sm text-gray-500">
              🔥 Lebih dari <strong>1.200+</strong> reseller aktif
            </p>
          </div>

          <div
            data-reveal
            className="bg-white rounded-3xl shadow-card p-10"
          >
            <h3 className="font-semibold mb-6">
              Kenapa jadi Reseller?
            </h3>
            <ul className="space-y-4">
              {benefits.map(b => (
                <li key={b} className="flex gap-3">
                  <CheckCircle className="text-accent" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section data-reveal className="mb-24">
          <h2 className="text-3xl font-semibold mb-10">
            Cara Bergabung
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div
                key={s}
                className="bg-white rounded-2xl shadow-soft p-0 flex flex-col items-start text-left overflow-hidden"
              >
                <div className="w-full h-42 relative">
                  <Image
                    src="/concern-1.png"
                    alt={`Step ${i + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 100vw"
                    priority={i === 0}
                  />
                </div>
                <div className="p-4 flex gap-2">
                  <span className="text-accent font-semibold text-black text-lg">
                    0{i + 1}
                  </span>
                  <p className="font-medium">{s}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EARNING SIMULATION */}
        {/* LEVEL MEMBER */}
        <section data-reveal className="mb-24">
          <h2 className="text-3xl font-semibold mb-10 text-center">
            Level Member Reseller
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {resellerLevels.map(level => (
              <div
                key={level.level}
                className={`
                  rounded-3xl p-8 shadow-soft transition
                  ${
                    level.highlight
                      ? 'bg-primary text-white scale-[1.03]'
                      : 'bg-white'
                  }
                `}
              >
                {/* LEVEL NAME */}
                <h3
                  className={`text-2xl font-semibold mb-2 ${
                    level.highlight ? 'text-white' : 'text-primary'
                  }`}
                >
                  {level.level}
                </h3>

                {/* TARGET */}
                <p
                  className={`text-sm mb-6 ${
                    level.highlight ? 'text-white/80' : 'text-gray-500'
                  }`}
                >
                  Target penjualan: {level.target}
                </p>

                {/* DISCOUNT */}
                <div className="mb-6">
                  <p
                    className={`text-4xl font-semibold ${
                      level.highlight ? 'text-white' : 'text-primary'
                    }`}
                  >
                    {level.discount}
                  </p>
                  <p
                    className={`text-sm ${
                      level.highlight ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    Harga khusus reseller
                  </p>
                </div>

                {/* PERKS */}
                <ul className="space-y-3">
                  {level.perks.map(perk => (
                    <li key={perk} className="flex gap-3 items-start">
                      <CheckCircle
                        className={`w-5 h-5 mt-0.5 ${
                          level.highlight ? 'text-accent' : 'text-accent'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          level.highlight ? 'text-white/90' : 'text-gray-700'
                        }`}
                      >
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => setShowForm(true)}
                  className={`
                    mt-8 w-full py-3 rounded-full font-medium transition
                    ${
                      level.highlight
                        ? 'bg-accent text-white hover:opacity-90'
                        : 'border border-primary text-primary hover:bg-primary hover:text-white'
                    }
                  `}
                >
                  Pilih Level {level.level}
                </button>
              </div>
            ))}
          </div>
        </section>


        {/* FINAL CTA */}
        <section
          data-reveal
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-semibold mb-4">
            Siap Mulai Sekarang?
          </h2>
          <p className="text-gray-600 mb-8">
            Daftar sebagai reseller dan mulai bangun
            penghasilan dari produk herbal terpercaya.
          </p>
          <button className="bg-accent text-white px-10 py-4 rounded-full shadow-soft hover:opacity-90" onClick={() => setShowForm(true)}>
            Daftar Reseller Sekarang
          </button>
        </section>
      </main>
      {showForm && <ResellerStepper onClose={() => setShowForm(false)} />}
    </>
  )
}

/* =====================
   Skeleton Loader
===================== */
function ResellerSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-24 animate-pulse space-y-12">
      <div className="h-10 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-64 bg-gray-200 rounded-3xl" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-2xl"
            />
          ))}
      </div>
    </div>
  )
}

function ResellerStepper({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const totalStep = 3

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-8 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400"
        >
          ✕
        </button>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                step >= i ? 'bg-accent' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* STEP CONTENT */}
        {step === 1 && (
          <>
            <h3 className="text-xl font-semibold mb-4">
              Data Pribadi
            </h3>
            <input className="w-full mb-3" placeholder="Nama Lengkap" />
            <input className="w-full mb-3" placeholder="No WhatsApp" />
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-xl font-semibold mb-4">
              Data Bisnis
            </h3>
            <input className="w-full mb-3" placeholder="Kota / Domisili" />
            <select className="w-full mb-3">
              <option>Online</option>
              <option>Offline</option>
              <option>Online & Offline</option>
            </select>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="text-xl font-semibold mb-4">
              Konfirmasi
            </h3>
            <p className="text-gray-600 text-sm">
              Tim kami akan menghubungi Anda maksimal 1x24 jam
              setelah pendaftaran.
            </p>
          </>
        )}

        {/* ACTION */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="text-gray-500"
            >
              Kembali
            </button>
          )}
          <button
            onClick={() =>
              step < totalStep ? setStep(step + 1) : onClose()
            }
            className="bg-accent text-white px-6 py-2 rounded-full"
          >
            {step < totalStep ? 'Lanjut' : 'Kirim'}
          </button>
        </div>
      </div>
    </div>
  )
}
