"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, ShoppingCart, Eye, Star, Leaf } from "lucide-react";

// Hooks & Services
import { useGetProductListQuery } from "@/services/product.service";
import CartSuccessAlert from "./ui/cart-success-alert";

// Shared Components
import QuickViewModal, {
  ProductWithMedia,
} from "@/components/ui/quick-view-modal";

// Types
import type { Product } from "@/types/admin/product";

gsap.registerPlugin(ScrollTrigger);

/* =====================
   Animation Variants
===================== */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

/* =====================
   Helpers
===================== */

const toNumber = (val: string | number | null | undefined): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return val;
  const parsed = parseFloat(val);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatCurrencyShort = (n: number) => {
  if (n >= 1000000) {
    return `Rp${(n / 1000000).toFixed(1)}jt`;
  }
  if (n >= 1000) {
    return `Rp${(n / 1000).toFixed(0)}rb`;
  }
  return `Rp${n}`;
};

const IMG_FALLBACK = "https://via.placeholder.com/400x400?text=No+Image";

/* =====================
   Main Component
===================== */
interface ApiResponse<T> {
  data?: T;
}

export default function BestSellers() {
  // Fetch 4 produk untuk grid 4 kolom
  const { data: listResp, isLoading } = useGetProductListQuery({
    orderBy: "products.sales",
    order: "desc",
    paginate: 4,
  });

  const products = useMemo(
    () => (listResp as ApiResponse<Product[]>)?.data ?? [],
    [listResp],
  );

  // State untuk modal
  const [quickViewProduct, setQuickViewProduct] =
    useState<ProductWithMedia | null>(null);

  useEffect(() => {
    if (!isLoading && products.length > 0) {
      ScrollTrigger.refresh();

      gsap.fromTo(
        ".product-card",
        { opacity: 0, y: 40 },
        {
          scrollTrigger: {
            trigger: ".product-grid",
            start: "top 85%",
          },
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
        },
      );
    }
  }, [isLoading, products]);

  return (
    <>
      {/* Global Alert */}
      <CartSuccessAlert />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16 md:py-20">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-6 sm:mb-8 md:mb-12 text-center sm:text-left"
        >
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-green-600 uppercase tracking-wider">
              Pilihan Terbaik
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Best Sellers</h2>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
            Produk favorit pilihan pelanggan kami.
          </p>
        </motion.div>

        {/* Product Grid - 2 columns on mobile, 4 on desktop */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 lg:gap-8"
        >
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, i) => <ProductSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
        </motion.div>
      </section>

      {/* Reusable Modal Component */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            productBase={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* =====================
   Product Card
===================== */
function ProductCard({
  product,
  onQuickView,
}: {
  product: ProductWithMedia;
  onQuickView: (p: ProductWithMedia) => void;
}) {
  const [liked, setLiked] = useState(false);

  const imageUrl =
    typeof product.image === "string" ? product.image : IMG_FALLBACK;
  const price = toNumber(product.price);
  const markupPrice = toNumber(product.markup_price);
  const isDiscount = markupPrice > price;
  const discountPercent = isDiscount
    ? Math.round(((markupPrice - price) / markupPrice) * 100)
    : 0;

  // Click anywhere on card to open modal
  const handleCardClick = () => {
    onQuickView(product);
  };

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      onClick={handleCardClick}
      className="product-card group relative bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square sm:aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 mb-2 sm:mb-3 md:mb-4">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges - Mobile: Smaller, Desktop: Normal */}
        <div className="absolute top-1.5 sm:top-2 md:top-3 left-1.5 sm:left-2 md:left-3 flex flex-col gap-1 sm:gap-1.5 md:gap-2">
          {isDiscount && (
            <span className="bg-red-500 text-white text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              -{discountPercent}%
            </span>
          )}
          <span className="bg-green-600 text-white text-[8px] sm:text-[9px] md:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5">
            <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current" />
            <span className="hidden sm:inline">Best Seller</span>
            <span className="sm:hidden">Top</span>
          </span>
        </div>

        {/* Hover Overlay - Desktop only */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center gap-2 md:gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="bg-white text-gray-800 p-2 md:p-3 rounded-full hover:bg-green-600 hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg"
            title="Quick View"
          >
            <Eye className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="bg-white text-gray-800 p-2 md:p-3 rounded-full hover:bg-green-600 hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75 shadow-lg"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-1.5 sm:top-2 md:top-3 right-1.5 sm:right-2 md:right-3 p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10 shadow-sm"
        >
          <Heart
            className={`w-3 h-3 sm:w-4 sm:h-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`}
          />
        </button>

        {/* Mobile Tap Indicator */}
        <div className="absolute bottom-1.5 right-1.5 sm:hidden bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
          <Eye className="w-3 h-3 text-green-600" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-0.5 sm:space-y-1">
        {/* Product Name */}
        <h3 className="font-medium text-gray-900 text-xs sm:text-sm md:text-base line-clamp-2 leading-tight group-hover:text-green-600 transition-colors">
          {product.name}
        </h3>

        {/* Category - Hidden on mobile for compact view */}
        <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
          {product.category_name}
        </p>

        {/* Price Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 pt-0.5 sm:pt-1">
          <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">
            {/* Mobile: Short format, Desktop: Full format */}
            <span className="sm:hidden">{formatCurrencyShort(price)}</span>
            <span className="hidden sm:inline">{formatCurrency(price)}</span>
          </span>
          {isDiscount && (
            <span className="text-[10px] sm:text-xs text-gray-400 line-through">
              <span className="sm:hidden">{formatCurrencyShort(markupPrice)}</span>
              <span className="hidden sm:inline">{formatCurrency(markupPrice)}</span>
            </span>
          )}
        </div>

        {/* Mobile Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="w-full mt-1.5 sm:mt-2 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-xs md:text-sm font-semibold py-1.5 sm:py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Beli</span>
        </button>
      </div>
    </motion.div>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 shadow-sm border border-gray-100 animate-pulse">
      <div className="aspect-square sm:aspect-[3/4] bg-gray-200 rounded-lg sm:rounded-xl mb-2 sm:mb-3 md:mb-4" />
      <div className="space-y-1.5 sm:space-y-2">
        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-6 sm:h-8 bg-gray-200 rounded-lg mt-1.5 sm:mt-2" />
      </div>
    </div>
  );
}