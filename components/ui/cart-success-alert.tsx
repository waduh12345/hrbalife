"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import useCartAlert from "@/hooks/use-cart-alert";

export default function CartSuccessAlert() {
  const { isOpen, data, onClose } = useCartAlert();

  // Auto close setelah 3 detik
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-4 left-0 right-0 z-[100] w-full max-w-md px-4"
        >
          <div className="relative flex items-start gap-4 overflow-hidden rounded-xl bg-white p-4 shadow-2xl ring-1 ring-black/5">
            {/* Garis Indikator Hijau di Kiri */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1F3A2B]" />

            {/* Gambar Produk */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
              <Image
                src={data.image}
                alt={data.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[#1F3A2B] font-bold mb-1">
                <CheckCircle2 size={16} />
                <span className="text-sm">Berhasil masuk keranjang!</span>
              </div>

              <h4 className="font-semibold text-gray-900 line-clamp-1 text-sm">
                {data.name}
              </h4>

              <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                {data.variant && (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    {data.variant}
                  </span>
                )}
                {data.size && (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    {data.size}
                  </span>
                )}
              </div>
            </div>

            {/* Tombol Close */}
            <button
              onClick={onClose}
              className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}