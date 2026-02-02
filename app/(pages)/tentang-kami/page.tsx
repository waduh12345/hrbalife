"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  Users,
  Award,
  Heart,
  Star,
  CheckCircle,
  Leaf,
  Microscope,
  TrendingUp,
  Clock,
  Zap,
  Brain,
  Target,
  Quote,
  ArrowRight,
  Play,
} from "lucide-react";

/* =========================
   Animations
========================= */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

/* =========================
   UI Components
========================= */
const SectionTitle = ({
  title,
  subtitle,
  centered = true,
}: {
  title: string;
  subtitle?: string;
  centered?: boolean;
}) => (
  <div className={`mx-auto max-w-4xl ${centered ? 'text-center' : ''}`}>
    <motion.h2
      variants={fadeUp}
      className="text-3xl md:text-5xl font-extrabold tracking-tight text-black mb-4"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p
        variants={fadeUp}
        className="text-lg text-gray-600 leading-relaxed"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

const TrustBadge = ({ icon: Icon, text }: { icon: LucideIcon; text: string }) => (
  <motion.div
    variants={fadeUp}
    className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2"
  >
    <Icon className="h-4 w-4 text-green-600" />
    <span className="text-sm font-medium text-green-800">{text}</span>
  </motion.div>
);

const TestimonialCard = ({
  quote,
  name,
  role,
  avatar,
  rating = 5,
}: {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating?: number;
}) => (
  <motion.div
    variants={fadeUp}
    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
  >
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <Quote className="h-8 w-8 text-green-600 mb-4" />
    <p className="text-gray-700 mb-4 leading-relaxed">{quote}</p>
    <div className="flex items-center gap-3">
      <Image
        src={avatar}
        alt={name}
        width={48}
        height={48}
        className="rounded-full"
      />
      <div>
        <p className="font-semibold text-black">{name}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  </motion.div>
);

const NeuroscienceInsight = ({
  icon: Icon,
  title,
  insight,
  application,
}: {
  icon: LucideIcon;
  title: string;
  insight: string;
  application: string;
}) => (
  <motion.div
    variants={fadeUp}
    className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-100"
  >
    <div className="flex items-start gap-4">
      <div className="bg-blue-100 p-3 rounded-xl">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <h4 className="font-bold text-black mb-2">{title}</h4>
        <p className="text-blue-700 text-sm mb-3">{insight}</p>
        <p className="text-gray-600 text-sm">{application}</p>
      </div>
    </div>
  </motion.div>
);

const ValueProposition = ({
  icon: Icon,
  title,
  description,
  benefit,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  benefit: string;
}) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -4 }}
    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
  >
    <div className="bg-green-100 p-3 rounded-xl w-fit mb-4">
      <Icon className="h-6 w-6 text-green-600" />
    </div>
    <h4 className="text-xl font-bold text-black mb-3">{title}</h4>
    <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
    <div className="bg-green-50 rounded-lg p-3">
      <p className="text-green-800 text-sm font-medium">{benefit}</p>
    </div>
  </motion.div>
);

const StatCard = ({ value, label, trend }: { value: string; label: string; trend?: string }) => (
  <motion.div
    variants={fadeUp}
    className="text-center"
  >
    <div className="text-4xl md:text-5xl font-extrabold text-green-600 mb-2">
      {value}
    </div>
    <p className="text-gray-600 font-medium">{label}</p>
    {trend && <p className="text-green-600 text-sm font-medium">{trend}</p>}
  </motion.div>
);

/* =========================
   Main Page Component
========================= */
export default function TentangKamiPage() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Hero Section - Authority & Trust Building */}
      <section className="relative pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="text-center mb-12"
          >
            {/* Trust Badges - Social Proof */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              <TrustBadge icon={ShieldCheck} text="Halal Certified" />
              <TrustBadge icon={Award} text="BPOM Approved" />
              <TrustBadge icon={Users} text="50,000+ Customers" />
              <TrustBadge icon={Star} text="4.9/5 Rating" />
            </motion.div>

            {/* Main Headline - Emotional Connection */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-extrabold text-black mb-6"
            >
              HerbalCare
              <span className="block text-green-600">Kesehatan Alami Anda</span>
            </motion.h1>

            {/* Value Proposition - Scarcity & Urgency */}
            <motion.p
              variants={fadeUp}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Dalam dunia yang penuh racun modern, <strong>98% pelanggan kami melaporkan peningkatan energi yang signifikan dalam 30 hari pertama</strong>.
              Bergabunglah dengan ribuan orang yang telah memilih jalan kesehatan alami.
            </motion.p>

            {/* Call to Action - Reciprocity */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/product"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Mulai Perjalanan Kesehatan Anda
                <ArrowRight className="inline ml-2 h-5 w-5" />
              </Link>
              <button
                onClick={() => setShowVideo(true)}
                className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-green-300 px-6 py-4 rounded-2xl font-semibold text-gray-700 transition-all duration-300"
              >
                <Play className="h-5 w-5" />
                Lihat Kisah Sukses
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Stats - Social Proof Numbers */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            <StatCard value="50K+" label="Pelanggan Puas" trend="+25% per bulan" />
            <StatCard value="98%" label="Tingkat Kepuasan" trend="Berdasarkan survey" />
            <StatCard value="30" label="Hari Hasil" trend="Rata-rata" />
            <StatCard value="4.9" label="Rating" trend="Dari 10,000+ ulasan" />
          </motion.div>
        </div>
      </section>

      {/* Neuroscience Section - Authority Building */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <SectionTitle
              title="Ilmu di Balik HerbalCare"
              subtitle="Pendekatan berbasis neuroscience untuk kesehatan yang terbukti secara ilmiah"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <NeuroscienceInsight
                icon={Brain}
                title="Neuroplasticity & Adaptasi"
                insight="Otak manusia dapat beradaptasi dengan pola hidup sehat dalam 21 hari"
                application="Formula HerbalCare dirancang untuk membangun kebiasaan kesehatan jangka panjang"
              />
              <NeuroscienceInsight
                icon={Heart}
                title="Stress Response System"
                insight="85% penyakit modern berasal dari respons stres kronis yang tidak terkelola"
                application="Kombinasi herbal kami menenangkan sistem saraf dan meningkatkan resiliensi"
              />
              <NeuroscienceInsight
                icon={Target}
                title="Dopamine Reward System"
                insight="Otak melepaskan dopamine saat tubuh menerima nutrisi yang dibutuhkan"
                application="Setiap kapsul HerbalCare memberikan sinyal positif untuk motivasi kesehatan"
              />
              <NeuroscienceInsight
                icon={Zap}
                title="Cellular Energy Production"
                insight="90% energi sel dihasilkan melalui proses mitochondrial yang optimal"
                application="Antioksidan herbal kami meningkatkan produksi energi pada level seluler"
              />
              <NeuroscienceInsight
                icon={ShieldCheck}
                title="Immune Memory Formation"
                insight="Sistem imun belajar dan mengingat ancaman melalui paparan bertahap"
                application="Imunomodulator alami kami melatih sistem imun untuk respons yang lebih kuat"
              />
              <NeuroscienceInsight
                icon={TrendingUp}
                title="Biohacking Principles"
                insight="Optimasi biologis terjadi melalui kombinasi nutrisi, istirahat, dan stimulasi"
                application="Pendekatan holistik HerbalCare mengoptimalkan semua aspek kesehatan"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Propositions - Emotional Connection */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <SectionTitle
              title="Mengapa 50,000+ Orang Memilih HerbalCare"
              subtitle="Bukan hanya suplemen, tapi investasi untuk kesehatan jangka panjang Anda"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              <ValueProposition
                icon={Leaf}
                title="100% Alami & Berkelanjutan"
                description="Setiap bahan dipilih dari petani lokal dengan praktik pertanian organik yang bertanggung jawab."
                benefit="Mendukung kesehatan Anda sambil menjaga lingkungan"
              />
              <ValueProposition
                icon={Microscope}
                title="Terbukti Ilmiah"
                description="Formula dikembangkan bersama ahli farmasi dan herbalis dengan dukungan penelitian klinis."
                benefit="Efektivitas terbukti, bukan hanya klaim marketing"
              />
              <ValueProposition
                icon={Clock}
                title="Hasil Jangka Panjang"
                description="Fokus pada perbaikan sistemik tubuh, bukan hanya gejala sementara."
                benefit="Kesehatan yang bertahan seumur hidup, bukan sementara"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section - Customer Testimonials */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <SectionTitle
              title="Kisah Nyata dari Pelanggan Kami"
              subtitle="Bergabunglah dengan komunitas kesehatan yang terus berkembang"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              <TestimonialCard
                quote="Setelah 3 bulan minum HerbalCare, energi saya meningkat drastis. Sudah tidak pernah lagi capek di siang hari. Dokter saya sampai kagum dengan peningkatan kesehatan saya."
                name="Dr. Sarah Wijaya"
                role="Ibu Rumah Tangga, Jakarta"
                avatar="/avatars/avatar-1.jpeg"
              />
              <TestimonialCard
                quote="Sebagai atlet, saya butuh performa maksimal. HerbalCare membantu saya recover lebih cepat dan maintain stamina selama latihan intensif. Highly recommended!"
                name="Ahmad Rahman"
                role="Atlet Profesional, Bandung"
                avatar="/avatars/avatar-2.jpeg"
              />
              <TestimonialCard
                quote="Saya skeptis awalnya, tapi hasilnya melebihi ekspektasi. Sistem imun saya lebih kuat, jarang sakit meski musim hujan. Investasi terbaik untuk kesehatan keluarga."
                name="Maya Sari"
                role="Wiraswasta, Surabaya"
                avatar="/avatars/avatar-3.jpeg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Authority & Credibility Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <SectionTitle
              title="Didukung oleh Para Ahli"
              subtitle="Kepercayaan dari profesional kesehatan terkemuka"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <motion.div
                variants={fadeUp}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <Image
                    src="/avatars/expert-1.jpeg"
                    alt="Dr. Hendra Kusuma"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-bold text-black mb-2">Dr. Hendra Kusuma, M.Kes</h4>
                    <p className="text-green-600 text-sm font-medium mb-3">Kepala Departemen Farmakologi UI</p>
                    <p className="text-gray-600 leading-relaxed">
                      &quot;Formulasi HerbalCare menunjukkan hasil yang mengagumkan dalam penelitian klinis kami.
                      Kombinasi bahan alami yang tepat dapat memberikan efek sinergis yang signifikan untuk kesehatan modern.&quot;
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <Image
                    src="/avatars/expert-2.jpeg"
                    alt="Prof. Dr. Lisa Tan"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-bold text-black mb-2">Prof. Dr. Lisa Tan, Apt</h4>
                    <p className="text-green-600 text-sm font-medium mb-3">Guru Besar Farmasi UGM</p>
                    <p className="text-gray-600 leading-relaxed">
                      &quot;HerbalCare berhasil menggabungkan pengetahuan tradisional dengan pendekatan modern.
                      Standar kualitas dan konsistensinya patut dijadikan benchmark industri suplementasi herbal.&quot;
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section - Scarcity & Urgency */}
      <section className="py-16 px-6 bg-green-600 text-white mb-[-130px]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-extrabold mb-6"
            >
              Siap Mulai Perjalanan Kesehatan Anda?
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-xl mb-8 text-green-100"
            >
              Bergabunglah dengan 50,000+ orang yang telah merasakan manfaat kesehatan alami.
              <strong className="text-white"> Tawaran terbatas: Diskon 20% untuk 100 pembeli pertama hari ini.</strong>
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/product"
                className="bg-white text-green-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Pesan Sekarang - Diskon 20%
                <ArrowRight className="inline ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-green-600 transition-all duration-300"
              >
                Konsultasi Gratis
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 text-green-200"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Garansi Uang Kembali 30 Hari</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Gratis Ongkir Seluruh Indonesia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Konsultasi Ahli Gratis</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold">Kisah Sukses Pelanggan HerbalCare</h3>
              <button
                onClick={() => setShowVideo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <p className="text-gray-500">Video testimonial akan dimuat di sini</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}