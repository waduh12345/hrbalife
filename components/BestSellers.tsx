"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, ShoppingCart, Eye } from "lucide-react";

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

      <section className="max-w-7xl mx-auto px-6 md:px-8 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900">Best Sellers</h2>
          <p className="text-gray-500 mt-2">
            Produk favorit pilihan pelanggan kami.
          </p>
        </motion.div>

        <div className="product-grid grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
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
        </div>
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

  const handleAddToCartSimple = () => {
    // Selalu buka modal agar user memilih varian/size dengan benar
    onQuickView(product);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="product-card group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-4">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isDiscount && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
              -{Math.round(((markupPrice - price) / markupPrice) * 100)}%
            </span>
          )}
          <span className="bg-[#88B04B] text-white text-[10px] font-bold px-2 py-1 rounded-full">
            Best Seller
          </span>
        </div>

        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onQuickView(product)}
            className="bg-white text-black p-3 rounded-full hover:bg-black hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg"
            title="Quick View"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={handleAddToCartSimple}
            className="bg-white text-black p-3 rounded-full hover:bg-[#88B04B] hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75 shadow-lg"
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
        >
          <Heart
            size={16}
            className={liked ? "fill-red-500 text-red-500" : "text-gray-600"}
          />
        </button>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-[#88B04B] transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 mb-2">
          {product.category_name}
        </p>

        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">
            {formatCurrency(price)}
          </span>
          {isDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(markupPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
      <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-8 bg-gray-200 rounded-full" />
    </div>
  );
}