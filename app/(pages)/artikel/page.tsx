"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Clock,
  User,
  Tag,
  TrendingUp,
  Heart,
  Share2,
  ArrowRight,
  Leaf,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* =========================
   Animations
========================= */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

/* =========================
   Types
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
  publishDate: string;
  readTime: number;
  views: number;
  likes: number;
  isFeatured?: boolean;
  tags: string[];
}

/* =========================
   Dummy Data
========================= */
const DUMMY_ARTICLES: Article[] = [
  {
    id: 1,
    slug: "manfaat-daun-sirih-untuk-kesehatan",
    title: "7 Manfaat Luar Biasa Daun Sirih untuk Kesehatan Tubuh",
    excerpt:
      "Daun sirih telah digunakan sejak ratusan tahun sebagai obat tradisional. Temukan manfaat luar biasa dari tanaman herbal ini untuk kesehatan Anda.",
    content: "",
    image: "/images/artikel-sample.webp",
    category: "Herbal",
    author: "Dr. Siti Nurhaliza",
    authorAvatar: "/avatars/dr-siti.jpg",
    publishDate: "2026-01-20",
    readTime: 5,
    views: 12500,
    likes: 1240,
    isFeatured: true,
    tags: ["Herbal", "Daun Sirih", "Kesehatan"],
  },
  {
    id: 2,
    slug: "cara-mengatasi-stres-dengan-aromaterapi",
    title: "Mengatasi Stres dengan Aromaterapi Alami: Panduan Lengkap",
    excerpt:
      "Stres adalah masalah umum di era modern. Pelajari bagaimana aromaterapi alami dapat membantu meredakan stres dan meningkatkan kualitas hidup Anda.",
    content: "",
    image: "/images/artikel-sample.webp",
    category: "Wellness",
    author: "Ahmad Rizki, M.Psi",
    authorAvatar: "/avatars/ahmad.jpg",
    publishDate: "2026-01-18",
    readTime: 7,
    views: 9800,
    likes: 890,
    isFeatured: true,
    tags: ["Aromaterapi", "Stres", "Mental Health"],
  },
  {
    id: 3,
    slug: "jahe-merah-obat-alami-batuk-pilek",
    title: "Jahe Merah: Obat Alami Ampuh untuk Batuk dan Pilek",
    excerpt:
      "Jahe merah memiliki kandungan antioksidan tinggi yang efektif mengatasi batuk, pilek, dan meningkatkan daya tahan tubuh secara alami.",
    content: "",
    image: "/images/artikel-sample.webp",
    category: "Herbal",
    author: "Dr. Budi Santoso",
    authorAvatar: "/avatars/dr-budi.jpg",
    publishDate: "2026-01-15",
    readTime: 6,
    views: 15200,
    likes: 1560,
    isFeatured: false,
    tags: ["Jahe", "Batuk", "Pilek", "Imunitas"],
  },
  {
    id: 4,
    slug: "manfaat-kunyit-untuk-pencernaan",
    title: "Kunyit: Rahasia Kesehatan Pencernaan yang Optimal",
    excerpt:
      "Kunyit bukan hanya bumbu dapur, tetapi juga obat herbal yang ampuh untuk menjaga kesehatan pencernaan dan mencegah berbagai penyakit.",
    content: "",
    image: "/images/artikel-sample.webp",
    category: "Herbal",
    author: "Dr. Dewi Lestari",
    authorAvatar: "/avatars/dr-dewi.jpg",
    publishDate: "2026-01-12",
    readTime: 5,
    views: 8900,
    likes: 720,
    isFeatured: false,
    tags: ["Kunyit", "Pencernaan", "Anti-inflamasi"],
  },
  {
    id: 5,
    slug: "gaya-hidup-sehat-ala-herbalcare",
    title: "5 Tips Gaya Hidup Sehat Ala HerbalCare untuk Hidup Lebih Baik",
    excerpt:
      "Menerapkan gaya hidup sehat tidak harus sulit. Ikuti 5 tips sederhana ini untuk meningkatkan kualitas hidup Anda dengan cara alami.",
    content: "",
    image: "/images/artikel-sample.webp",
    category: "Lifestyle",
    author: "Rudi Hermawan",
    authorAvatar: "/avatars/rudi.jpg",
    publishDate: "2026-01-10",
    readTime: 8,
    views: 11200,
    likes: 980,
    isFeatured: false,
    tags: ["Lifestyle", "Kesehatan", "Tips"],
  },
  {
    id: 6,
    slug: "manfaat-madu-untuk-kecantikan-kulit",
    title: "Madu: Rahasia Kecantikan Kulit Alami dari Alam",
    excerpt:
      "Madu memiliki kandungan nutrisi yang luar biasa untuk merawat kulit. Pelajari cara menggunakan madu untuk mendapatkan kulit sehat dan bercahaya.",
    content: "",
    image: "/images/artikel-sample.webp",
    category: "Beauty",
    author: "Siti Aminah",
    authorAvatar: "/avatars/siti.jpg",
    publishDate: "2026-01-08",
    readTime: 6,
    views: 13400,
    likes: 1320,
    isFeatured: false,
    tags: ["Madu", "Kecantikan", "Perawatan Kulit"],
  },
  {
    id: 7,
    slug: "teh-hijau-antioksidan-tinggi",
    title: "Teh Hijau: Minuman Antioksidan Tinggi untuk Kesehatan Optimal",
    excerpt:
      "Teh hijau kaya akan antioksidan yang dapat membantu mencegah berbagai penyakit dan menjaga kesehatan tubuh secara menyeluruh.",
    content: "",
    image: "/images/artikel-sample.webp",
    category: "Wellness",
    author: "Dr. Siti Nurhaliza",
    authorAvatar: "/avatars/dr-siti.jpg",
    publishDate: "2026-01-05",
    readTime: 5,
    views: 10500,
    likes: 890,
    isFeatured: false,
    tags: ["Teh Hijau", "Antioksidan", "Kesehatan"],
  },
  {
    id: 8,
    slug: "panduan-detox-alami-7-hari",
    title: "Panduan Detox Alami 7 Hari untuk Tubuh Lebih Sehat",
    excerpt:
      "Program detox alami 7 hari ini akan membantu membersihkan racun dalam tubuh dan meningkatkan metabolisme Anda secara efektif.",
    content: "",
    image: "/images/artikel-sample.webp",
    category: "Wellness",
    author: "Ahmad Rizki, M.Psi",
    authorAvatar: "/avatars/ahmad.jpg",
    publishDate: "2026-01-03",
    readTime: 10,
    views: 16800,
    likes: 1680,
    isFeatured: true,
    tags: ["Detox", "Kesehatan", "Program"],
  },
];

const CATEGORIES = ["Semua", "Herbal", "Wellness", "Lifestyle", "Beauty"];

/* =========================
   Main Component
========================= */
export default function ArtikelPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Filter articles
  const filteredArticles = useMemo(() => {
    let filtered = DUMMY_ARTICLES;

    // Filter by category
    if (selectedCategory !== "Semua") {
      filtered = filtered.filter((article) => article.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const featuredArticles = DUMMY_ARTICLES.filter((a) => a.isFeatured);
  const latestArticles = filteredArticles.slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/topography.svg')] opacity-10"></div>
        <div className="absolute top-20 right-10 w-64 h-64 bg-green-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-green-500 rounded-full blur-3xl opacity-20"></div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mb-6">
              <Leaf className="w-6 h-6" />
              <span className="text-green-200 font-medium">HerbalCare Blog</span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
            >
              Artikel Kesehatan & Herbal
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-green-100 mb-8">
              Temukan informasi terbaru seputar kesehatan alami, herbal, dan gaya hidup sehat
              untuk meningkatkan kualitas hidup Anda.
            </motion.p>

            {/* Search Bar */}
            <motion.div variants={fadeUp} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari artikel, tips kesehatan, atau topik herbal..."
                  className="pl-12 h-14 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-green-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Articles */}
        {selectedCategory === "Semua" && !searchQuery && (
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-6 h-6 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900">Artikel Pilihan</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <motion.div key={article.id} variants={scaleIn}>
                  <Link href={`/artikel/${article.slug}`}>
                    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                      <div className="relative h-56 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          unoptimized
                        />
                        <Badge className="absolute top-4 left-4 z-20 bg-green-600 text-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {article.category}
                          </Badge>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime} min
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700">{article.author}</span>
                          </div>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.publishDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* All Articles */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {searchQuery
                ? `Hasil Pencarian "${searchQuery}"`
                : selectedCategory === "Semua"
                ? "Semua Artikel"
                : `Artikel ${selectedCategory}`}
            </h2>
            <span className="text-gray-500">{filteredArticles.length} artikel</span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Artikel tidak ditemukan
              </h3>
              <p className="text-gray-600 mb-6">
                Coba gunakan kata kunci lain atau ubah filter kategori
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Semua");
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  variants={scaleIn}
                  custom={index}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/artikel/${article.slug}`}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {article.category}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime} min
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-green-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {article.likes}
                            </span>
                            <span>{article.views.toLocaleString()} views</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-16 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500 rounded-full blur-3xl opacity-20"></div>
          <div className="relative z-10">
            <Leaf className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tertarik dengan Produk HerbalCare?
            </h2>
            <p className="text-green-100 text-lg mb-6 max-w-2xl mx-auto">
              Temukan berbagai produk herbal berkualitas tinggi untuk mendukung gaya hidup sehat
              Anda
            </p>
            <Link href="/product">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold text-lg px-8 py-6 rounded-2xl shadow-xl"
              >
                Lihat Produk Kami
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
