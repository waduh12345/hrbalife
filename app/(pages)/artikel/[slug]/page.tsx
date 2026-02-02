"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Tag,
  Heart,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Leaf,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

/* =========================
   Animations
========================= */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

/* =========================
   Types & Dummy Data
========================= */
interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  authorAvatar: string;
  authorBio: string;
  publishDate: string;
  readTime: number;
  views: number;
  likes: number;
  tags: string[];
}

// Full article data with content
const ARTICLES_DATA: Record<string, Article> = {
  "manfaat-daun-sirih-untuk-kesehatan": {
    id: 1,
    slug: "manfaat-daun-sirih-untuk-kesehatan",
    title: "7 Manfaat Luar Biasa Daun Sirih untuk Kesehatan Tubuh",
    excerpt:
      "Daun sirih telah digunakan sejak ratusan tahun sebagai obat tradisional. Temukan manfaat luar biasa dari tanaman herbal ini untuk kesehatan Anda.",
    content: `
      <h2>Apa itu Daun Sirih?</h2>
      <p>Daun sirih (Piper betle) adalah tanaman merambat yang telah digunakan dalam pengobatan tradisional selama berabad-abad. Tanaman ini kaya akan senyawa bioaktif yang memberikan berbagai manfaat kesehatan.</p>

      <h2>Manfaat Daun Sirih untuk Kesehatan</h2>
      
      <h3>1. Meningkatkan Kesehatan Mulut</h3>
      <p>Daun sirih memiliki sifat antibakteri yang kuat yang dapat membantu melawan bakteri penyebab bau mulut dan kerusakan gigi. Mengunyah daun sirih secara teratur dapat membantu menjaga kesehatan mulut dan gigi.</p>

      <h3>2. Menyembuhkan Luka</h3>
      <p>Kandungan antiseptik dalam daun sirih membuatnya efektif untuk mempercepat penyembuhan luka. Anda dapat menggunakan air rebusan daun sirih untuk membersihkan luka.</p>

      <h3>3. Melancarkan Pencernaan</h3>
      <p>Daun sirih dapat membantu meningkatkan produksi enzim pencernaan dan mengurangi masalah pencernaan seperti kembung dan sembelit.</p>

      <h3>4. Mengontrol Kadar Gula Darah</h3>
      <p>Penelitian menunjukkan bahwa daun sirih dapat membantu mengatur kadar gula darah, menjadikannya bermanfaat bagi penderita diabetes.</p>

      <h3>5. Meningkatkan Daya Tahan Tubuh</h3>
      <p>Antioksidan dalam daun sirih membantu melindungi tubuh dari radikal bebas dan meningkatkan sistem kekebalan tubuh.</p>

      <h3>6. Menurunkan Kolesterol</h3>
      <p>Konsumsi daun sirih secara teratur dapat membantu menurunkan kadar kolesterol jahat (LDL) dalam darah.</p>

      <h3>7. Mengatasi Masalah Pernapasan</h3>
      <p>Daun sirih memiliki sifat anti-inflamasi yang dapat membantu meredakan gejala asma dan masalah pernapasan lainnya.</p>

      <h2>Cara Menggunakan Daun Sirih</h2>
      <p>Ada beberapa cara untuk menggunakan daun sirih:</p>
      <ul>
        <li>Mengunyah daun sirih segar</li>
        <li>Merebus daun sirih dan meminum airnya</li>
        <li>Menggunakan air rebusan untuk berkumur</li>
        <li>Mengoleskan daun sirih yang sudah ditumbuk pada luka</li>
      </ul>

      <h2>Peringatan</h2>
      <p>Meskipun daun sirih memiliki banyak manfaat, konsumsi berlebihan dapat menyebabkan efek samping. Konsultasikan dengan ahli kesehatan sebelum menggunakan daun sirih sebagai pengobatan.</p>
    `,
    image: "/images/artikel-sample.webp",
    category: "Herbal",
    author: "Dr. Siti Nurhaliza",
    authorAvatar: "/avatars/dr-siti.jpg",
    authorBio:
      "Dokter spesialis herbal dengan pengalaman 15 tahun dalam penelitian tanaman obat tradisional Indonesia.",
    publishDate: "2026-01-20",
    readTime: 5,
    views: 12500,
    likes: 1240,
    tags: ["Herbal", "Daun Sirih", "Kesehatan"],
  },
  "cara-mengatasi-stres-dengan-aromaterapi": {
    id: 2,
    slug: "cara-mengatasi-stres-dengan-aromaterapi",
    title: "Mengatasi Stres dengan Aromaterapi Alami: Panduan Lengkap",
    excerpt:
      "Stres adalah masalah umum di era modern. Pelajari bagaimana aromaterapi alami dapat membantu meredakan stres dan meningkatkan kualitas hidup Anda.",
    content: `
      <h2>Mengapa Aromaterapi Efektif untuk Mengatasi Stres?</h2>
      <p>Aromaterapi menggunakan minyak esensial dari tanaman untuk meningkatkan kesejahteraan fisik dan mental. Aroma dari minyak esensial dapat mempengaruhi sistem limbik otak, yang mengatur emosi dan respons stres.</p>

      <h2>Minyak Esensial Terbaik untuk Mengatasi Stres</h2>
      
      <h3>1. Lavender</h3>
      <p>Lavender adalah minyak esensial paling populer untuk relaksasi. Aromanya yang menenangkan dapat membantu mengurangi kecemasan dan meningkatkan kualitas tidur.</p>

      <h3>2. Peppermint</h3>
      <p>Peppermint memiliki efek menyegarkan yang dapat membantu meningkatkan fokus dan mengurangi ketegangan mental.</p>

      <h3>3. Chamomile</h3>
      <p>Chamomile dikenal karena sifat menenangkannya yang dapat membantu meredakan stres dan kecemasan.</p>

      <h3>4. Bergamot</h3>
      <p>Bergamot dapat membantu meningkatkan mood dan mengurangi gejala depresi ringan.</p>

      <h2>Cara Menggunakan Aromaterapi</h2>
      <p>Berikut adalah beberapa metode untuk menggunakan aromaterapi:</p>
      <ul>
        <li>Diffuser: Teteskan minyak esensial ke diffuser untuk menyebarkan aroma di ruangan</li>
        <li>Inhalasi langsung: Hirup langsung dari botol atau teteskan pada tisu</li>
        <li>Pijat: Campurkan dengan carrier oil untuk pijat relaksasi</li>
        <li>Mandi: Tambahkan beberapa tetes ke air mandi hangat</li>
      </ul>

      <h2>Tips Maksimalkan Manfaat Aromaterapi</h2>
      <ul>
        <li>Gunakan minyak esensial berkualitas tinggi</li>
        <li>Mulai dengan konsentrasi rendah</li>
        <li>Kombinasikan dengan teknik relaksasi lain seperti meditasi</li>
        <li>Buat rutinitas aromaterapi harian</li>
      </ul>
    `,
    image: "/images/artikel-sample.webp",
    category: "Wellness",
    author: "Ahmad Rizki, M.Psi",
    authorAvatar: "/avatars/ahmad.jpg",
    authorBio: "Psikolog klinis dan praktisi holistik yang berfokus pada terapi alami untuk kesehatan mental.",
    publishDate: "2026-01-18",
    readTime: 7,
    views: 9800,
    likes: 890,
    tags: ["Aromaterapi", "Stres", "Mental Health"],
  },
  // Add more articles as needed...
};

/* =========================
   Related Articles Data
========================= */
const RELATED_ARTICLES = [
  {
    slug: "jahe-merah-obat-alami-batuk-pilek",
    title: "Jahe Merah: Obat Alami Ampuh untuk Batuk dan Pilek",
    image: "/images/artikel-sample.webp",
    category: "Herbal",
  },
  {
    slug: "manfaat-kunyit-untuk-pencernaan",
    title: "Kunyit: Rahasia Kesehatan Pencernaan yang Optimal",
    image: "/images/artikel-sample.webp",
    category: "Herbal",
  },
  {
    slug: "gaya-hidup-sehat-ala-herbalcare",
    title: "5 Tips Gaya Hidup Sehat Ala HerbalCare",
    image: "/images/artikel-sample.webp",
    category: "Lifestyle",
  },
];

/* =========================
   Main Component
========================= */
export default function ArtikelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = ARTICLES_DATA[slug];

  const [liked, setLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Artikel tidak ditemukan</h1>
          <Link href="/artikel">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Artikel
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = article.title;

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        break;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-[60vh] bg-gray-900">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover opacity-80"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Back Button */}
        <div className="absolute top-8 left-4 md:left-8 z-10">
          <Link href="/artikel">
            <Button variant="secondary" size="sm" className="bg-white/90 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="container mx-auto max-w-4xl">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                <Badge className="bg-green-600 text-white">
                  {article.category}
                </Badge>
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readTime} menit baca
                </span>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight"
              >
                {article.title}
              </motion.h1>
              <motion.div variants={fadeUp} className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{article.author}</p>
                    <p className="text-sm text-white/70">
                      {formatDate(article.publishDate)}
                    </p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <span className="text-sm">{article.views.toLocaleString()} views</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar - Social Share */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24 flex lg:flex-col gap-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center justify-center gap-2 p-3 rounded-full border transition-all ${
                    liked
                      ? "bg-red-50 border-red-300 text-red-600"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                  <span className="lg:hidden text-sm">{article.likes + (liked ? 1 : 0)}</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center justify-center gap-2 p-3 rounded-full border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="lg:hidden text-sm">Share</span>
                  </button>
                  {showShareMenu && (
                    <div className="absolute left-0 lg:left-full lg:ml-2 top-full lg:top-0 mt-2 lg:mt-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-20 min-w-[200px]">
                      <button
                        onClick={() => handleShare("facebook")}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <span className="text-sm">Facebook</span>
                      </button>
                      <button
                        onClick={() => handleShare("twitter")}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Twitter className="w-5 h-5 text-sky-500" />
                        <span className="text-sm">Twitter</span>
                      </button>
                      <button
                        onClick={() => handleShare("linkedin")}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Linkedin className="w-5 h-5 text-blue-700" />
                        <span className="text-sm">LinkedIn</span>
                      </button>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={() => handleShare("copy")}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {copySuccess ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-600">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5 text-gray-600" />
                            <span className="text-sm">Salin Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-11 order-1 lg:order-2">
              <motion.article
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="bg-white rounded-2xl shadow-lg p-6 md:p-10"
              >
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-gray-200">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-green-600 border-green-600">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Article Content */}
                <div
                  className="prose prose-lg max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900
                    prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
                    prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                    prose-ul:my-6 prose-li:text-gray-700
                    prose-strong:text-gray-900 prose-strong:font-bold
                    prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Author Bio */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-start gap-4 bg-green-50 rounded-xl p-6">
                    <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-1">
                        {article.author}
                      </h3>
                      <p className="text-gray-700">{article.authorBio}</p>
                    </div>
                  </div>
                </div>
              </motion.article>

              {/* Related Articles */}
              <motion.section
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={stagger}
                className="mt-12"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Artikel Terkait</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {RELATED_ARTICLES.map((relatedArticle) => (
                    <motion.div key={relatedArticle.slug} variants={fadeUp}>
                      <Link href={`/artikel/${relatedArticle.slug}`}>
                        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 group">
                          <div className="relative h-40 overflow-hidden">
                            <Image
                              src={relatedArticle.image}
                              alt={relatedArticle.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                              unoptimized
                            />
                          </div>
                          <div className="p-4">
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-600 mb-2"
                            >
                              {relatedArticle.category}
                            </Badge>
                            <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                              {relatedArticle.title}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* CTA */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="mt-12 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white text-center"
              >
                <Leaf className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Tertarik dengan Produk HerbalCare?</h3>
                <p className="text-green-100 mb-6">
                  Temukan produk herbal berkualitas untuk kesehatan Anda
                </p>
                <Link href="/product">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                    Lihat Produk
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
