'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Truck,
  Check,
  Clock,
  Zap,
  Package,
  Calendar,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShippingModalProps {
  onClose: () => void
  onSelect?: (shipping: ShippingOption) => void
}

interface ShippingOption {
  id: string
  courier: string
  service: string
  description: string
  price: number
  estimatedDays: string
  icon: 'regular' | 'express' | 'sameday' | 'nextday'
  isPopular?: boolean
}

const shippingOptions: ShippingOption[] = [
  {
    id: '1',
    courier: 'JNE',
    service: 'REG',
    description: 'Reguler - Pengiriman standar',
    price: 15000,
    estimatedDays: '3-5 hari',
    icon: 'regular',
  },
  {
    id: '2',
    courier: 'JNE',
    service: 'YES',
    description: 'Yakin Esok Sampai',
    price: 25000,
    estimatedDays: '1-2 hari',
    icon: 'nextday',
    isPopular: true,
  },
  {
    id: '3',
    courier: 'SiCepat',
    service: 'BEST',
    description: 'Belanja Sampai Tujuan',
    price: 18000,
    estimatedDays: '2-4 hari',
    icon: 'regular',
  },
  {
    id: '4',
    courier: 'SiCepat',
    service: 'GOKIL',
    description: 'Gratis Ongkir Kilat',
    price: 0,
    estimatedDays: '3-5 hari',
    icon: 'regular',
  },
  {
    id: '5',
    courier: 'Gojek',
    service: 'Instant',
    description: 'Pengiriman instan dalam kota',
    price: 30000,
    estimatedDays: '2-4 jam',
    icon: 'sameday',
  },
  {
    id: '6',
    courier: 'Grab',
    service: 'Express',
    description: 'Pengiriman cepat dalam kota',
    price: 28000,
    estimatedDays: '2-4 jam',
    icon: 'express',
  },
]

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, y: 50, scale: 0.95 },
}

const formatPrice = (price: number) => {
  if (price === 0) return 'GRATIS'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export default function ShippingModal({ onClose, onSelect }: ShippingModalProps) {
  const [selectedId, setSelectedId] = useState<string>('2') // Default to popular option

  const handleSelect = () => {
    const selected = shippingOptions.find((s) => s.id === selectedId)
    if (selected && onSelect) {
      onSelect(selected)
    }
    onClose()
  }

  const getShippingIcon = (type: string) => {
    switch (type) {
      case 'express':
        return <Zap className="h-5 w-5" />
      case 'sameday':
        return <Clock className="h-5 w-5" />
      case 'nextday':
        return <Calendar className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'express':
        return 'bg-orange-100 text-orange-600'
      case 'sameday':
        return 'bg-purple-100 text-purple-600'
      case 'nextday':
        return 'bg-blue-100 text-blue-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          variants={overlayVariants}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full sm:max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
          variants={modalVariants}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-xl">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Metode Pengiriman
                </h2>
                <p className="text-sm text-gray-500">
                  Pilih layanan pengiriman yang sesuai
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Info Banner */}
          <div className="mx-6 mt-4 p-3 bg-green-50 rounded-xl flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700">
              Semua pengiriman dilengkapi asuransi gratis
            </p>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[55vh] p-6 pt-4">
            <div className="space-y-3">
              {shippingOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedId(option.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    selectedId === option.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Radio */}
                    <div
                      className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedId === option.id
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedId === option.id && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>

                    {/* Icon */}
                    <div
                      className={`p-2 rounded-xl flex-shrink-0 ${getIconBgColor(
                        option.icon
                      )}`}
                    >
                      {getShippingIcon(option.icon)}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">
                          {option.courier}
                        </span>
                        <span className="text-sm text-gray-500">
                          {option.service}
                        </span>
                        {option.isPopular && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">
                            Populer
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500">
                          Est. {option.estimatedDays}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`font-bold ${
                          option.price === 0 ? 'text-green-600' : 'text-gray-900'
                        }`}
                      >
                        {formatPrice(option.price)}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
            {/* Selected Summary */}
            {selectedId && (
              <div className="mb-3 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {shippingOptions.find((s) => s.id === selectedId)?.courier}{' '}
                    {shippingOptions.find((s) => s.id === selectedId)?.service}
                  </span>
                </div>
                <span className="font-bold text-green-600">
                  {formatPrice(
                    shippingOptions.find((s) => s.id === selectedId)?.price || 0
                  )}
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Batal
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleSelect}
              >
                Pilih Pengiriman
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
