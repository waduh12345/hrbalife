"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { X, Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import clsx from "clsx";

import { useGetProductVariantBySlugQuery } from "@/services/product.service";
import { useGetProductVariantSizesQuery } from "@/services/admin/product-variant-size.service";
import useCart from "@/hooks/use-cart";
import useCartAlert from "@/hooks/use-cart-alert";

// Types
import type { Product } from "@/types/admin/product";
// Pastikan ProductVariant di type definition memiliki properti image,
// jika tidak, kita extend di sini secara lokal untuk UI
interface ProductVariantUI {
  id: number;
  name: string | number;
  price: number | string;
  stock: number | string;
  sku?: string | null;
  image?: string | null; // Tambahan field image
}

interface ProductMedia {
  original_url: string;
}
export type ProductWithMedia = Product & { media?: ProductMedia[] };

interface ApiResponse<T> {
  data?: T;
}

interface Size {
  id: number;
  name: string;
  price: string | number;
  stock: string | number;
  sku?: string;
}

const modalVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 40,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const IMG_FALLBACK = "https://via.placeholder.com/400x400?text=No+Image";

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

export default function QuickViewModal({
  productBase,
  onClose,
}: {
  productBase: ProductWithMedia;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const alert = useCartAlert();
  const [activeImg, setActiveImg] = useState<string | null>(null);

  // State Selection
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantUI | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [qty, setQty] = useState(1);

  // --- 1. Fetch Data ---
  const { data: variantData, isLoading: loadingVariants } =
    useGetProductVariantBySlugQuery(productBase.slug);

  const variants = useMemo(() => {
    const response = variantData as ApiResponse<ProductVariantUI[]> | undefined;
    return Array.isArray(response?.data) ? response.data : [];
  }, [variantData]);

  const { data: sizeData, isFetching: loadingSizes } =
    useGetProductVariantSizesQuery(
      { variantId: selectedVariant?.id ?? 0, page: 1, paginate: 100 },
      { skip: !selectedVariant },
    );

  const sizes = useMemo(() => {
    const response = sizeData as ApiResponse<Size[]> | undefined;
    return Array.isArray(response?.data) ? response.data : [];
  }, [sizeData]);

  // --- 2. Effects ---
  useEffect(() => {
    if (variants.length === 0 && !loadingVariants) {
      setSelectedVariant({
        id: productBase.id,
        name: "Default",
        price: 0,
        stock: productBase.stock,
        sku: productBase.sku ?? "",
        image: typeof productBase.image === "string" ? productBase.image : null,
      } as unknown as ProductVariantUI);
    }
  }, [variants, loadingVariants, productBase]);

  useEffect(() => {
    setSelectedSize(null);
    if (selectedVariant?.image) {
      setActiveImg(selectedVariant.image);
    }
    setQty(1);
  }, [selectedVariant]);

  // --- 3. Calculations ---
  const basePrice = toNumber(productBase.price);
  const variantPrice = toNumber(selectedVariant?.price);
  const sizePrice = toNumber(selectedSize?.price);

  const currentPrice = basePrice + variantPrice + sizePrice;
  const currentMarkupPrice = toNumber(productBase.markup_price);

  const currentStock = toNumber(
    selectedSize?.stock ?? selectedVariant?.stock ?? productBase.stock,
  );

  const currentSku =
    selectedSize?.sku ?? selectedVariant?.sku ?? productBase.sku ?? "N/A";

  const defaultMainImage =
    typeof productBase.image === "string" ? productBase.image : IMG_FALLBACK;
  const currentMainImage = activeImg || defaultMainImage;

  const totalDisplayPrice = currentPrice * qty;

  // --- 4. Action ---
  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedVariant) return;
    if (sizes.length > 0 && !selectedSize) return;
    if (currentStock <= 0) return;

    const itemToAdd = {
      ...productBase,
      price: currentPrice,
      variant_name: selectedVariant?.name,
      size_name: selectedSize?.name,
      image: currentMainImage,
      product_variant_size_id: selectedSize?.id ?? null,
    };

    for (let i = 0; i < qty; i++) {
      addItem(itemToAdd, selectedVariant?.id ?? productBase.id);
    }

    // --- TRIGGER ALERT ---
    alert.onOpen({
      name: productBase.name,
      image: currentMainImage,
      variant:
        selectedVariant?.name === "Default" ? undefined : selectedVariant?.name,
      size: selectedSize?.name,
    });

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <motion.div
        variants={modalVariant}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-6xl max-h-[95vh] rounded-lg overflow-y-auto shadow-2xl flex flex-col md:flex-row my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-gray-100 text-gray-500"
        >
          <X size={24} />
        </button>

        <div className="md:grid md:grid-cols-2 md:gap-x-8 w-full p-6 md:p-10">
          {/* --- LEFT COLUMN: GALLERY --- */}
          <div className="flex flex-col gap-6">
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 relative">
              <Image
                src={currentMainImage}
                alt={productBase.name}
                fill
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                typeof productBase.image === "string"
                  ? productBase.image
                  : null,
                ...(productBase.media?.map((m) => m.original_url) || []),
              ]
                .filter(Boolean)
                .map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImg(img as string)}
                    className={clsx(
                      "aspect-square overflow-hidden rounded-lg ring-2 cursor-pointer relative",
                      currentMainImage === img
                        ? "ring-black"
                        : "ring-gray-200 hover:ring-black/50",
                    )}
                  >
                    <Image
                      src={img as string}
                      alt="thumb"
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
            </div>
          </div>

          {/* --- RIGHT COLUMN: INFO --- */}
          <div className="mt-8 lg:mt-0 flex flex-col">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl uppercase">
              {productBase.name}
            </h1>

            <div className="mt-4">
              <p className="text-3xl font-bold text-black">
                {formatCurrency(currentPrice)}
              </p>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              SKU: {currentSku} • Stock: {currentStock}
            </div>

            {/* --- VARIANT SELECTOR --- */}
            {variants.length > 0 && (
              <div className="mt-8">
                <div className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Pilih Varian
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={clsx(
                          "flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-4 text-sm font-semibold ring-1 transition",
                          isSelected
                            ? "bg-black text-white ring-black"
                            : "bg-white text-gray-700 ring-gray-300 hover:ring-black/50",
                        )}
                        aria-pressed={isSelected}
                      >
                        {v.image && (
                          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                            <Image
                              src={v.image}
                              alt={String(v.name)}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span>{v.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- SIZE SELECTOR --- */}
            {selectedVariant && sizes.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Pilih Ukuran [Image of standard shirt sizing chart]
                </div>
                {loadingSizes ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Loader2 className="animate-spin h-4 w-4" /> Memuat
                    ukuran...
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSize(s)}
                        className={clsx(
                          "px-3 py-1 border rounded transition-colors",
                          selectedSize?.id === s.id
                            ? "bg-black text-white"
                            : "hover:bg-gray-50",
                        )}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- QTY SELECTOR --- */}
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="inline-flex items-center rounded-lg border border-gray-300 h-10">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 h-full hover:bg-gray-100 rounded-l-lg"
                  disabled={currentStock <= 0}
                >
                  <Minus size={14} />
                </button>
                <input
                  type="text"
                  readOnly
                  value={qty}
                  className="w-12 text-center h-full border-x border-gray-300 text-sm font-semibold"
                />
                <button
                  onClick={() =>
                    setQty((q) =>
                      Math.min(
                        q + 1,
                        currentStock > 0 ? currentStock : Infinity,
                      ),
                    )
                  }
                  className="px-3 h-full hover:bg-gray-100 rounded-r-lg"
                  disabled={currentStock <= 0}
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="text-sm font-medium">
                Total: {formatCurrency(totalDisplayPrice)}
              </div>
            </div>

            {/* --- ADD TO CART BUTTON --- */}
            <div className="mt-8">
              <button
                onClick={handleAddToCart}
                disabled={
                  currentStock <= 0 ||
                  (variants.length > 0 && !selectedVariant) ||
                  (sizes.length > 0 && !selectedSize)
                }
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-[#1F3A2B] px-8 py-4 text-base font-bold text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {currentStock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
              </button>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    productBase.description ?? "<p>Tidak ada deskripsi.</p>",
                }}
                className="prose prose-sm text-gray-600"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}