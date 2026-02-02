'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CreditCard,
  Check,
  Building2,
  Wallet,
  Smartphone,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  QrCode,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface PaymentModalProps {
  onClose: () => void
  onSelect?: (payment: PaymentOption) => void
}

interface PaymentOption {
  id: string
  name: string
  type: 'bank' | 'ewallet' | 'va' | 'qris' | 'cod'
  description?: string
  icon?: string
  fee?: number
}

interface PaymentCategory {
  id: string
  name: string
  icon: React.ReactNode
  options: PaymentOption[]
}

const paymentCategories: PaymentCategory[] = [
  {
    id: 'qris',
    name: 'QRIS',
    icon: <QrCode className="h-5 w-5" />,
    options: [
      {
        id: 'qris-all',
        name: 'QRIS',
        type: 'qris',
        description: 'Bayar dengan semua e-wallet & mobile banking',
        fee: 0,
      },
    ],
  },
  {
    id: 'ewallet',
    name: 'E-Wallet',
    icon: <Wallet className="h-5 w-5" />,
    options: [
      { id: 'gopay', name: 'GoPay', type: 'ewallet', fee: 0 },
      { id: 'ovo', name: 'OVO', type: 'ewallet', fee: 0 },
      { id: 'dana', name: 'DANA', type: 'ewallet', fee: 0 },
      { id: 'shopeepay', name: 'ShopeePay', type: 'ewallet', fee: 0 },
      { id: 'linkaja', name: 'LinkAja', type: 'ewallet', fee: 0 },
    ],
  },
  {
    id: 'va',
    name: 'Virtual Account',
    icon: <Building2 className="h-5 w-5" />,
    options: [
      { id: 'bca-va', name: 'BCA Virtual Account', type: 'va', fee: 4000 },
      { id: 'bni-va', name: 'BNI Virtual Account', type: 'va', fee: 4000 },
      { id: 'bri-va', name: 'BRI Virtual Account', type: 'va', fee: 4000 },
      { id: 'mandiri-va', name: 'Mandiri Virtual Account', type: 'va', fee: 4000 },
      { id: 'permata-va', name: 'Permata Virtual Account', type: 'va', fee: 4000 },
    ],
  },
  {
    id: 'bank',
    name: 'Transfer Bank',
    icon: <CreditCard className="h-5 w-5" />,
    options: [
      {
        id: 'bca',
        name: 'Bank BCA',
        type: 'bank',
        description: 'Transfer manual ke rekening BCA',
        fee: 0,
      },
      {
        id: 'mandiri',
        name: 'Bank Mandiri',
        type: 'bank',
        description: 'Transfer manual ke rekening Mandiri',
        fee: 0,
      },
    ],
  },
  {
    id: 'cod',
    name: 'Bayar di Tempat',
    icon: <Smartphone className="h-5 w-5" />,
    options: [
      {
        id: 'cod',
        name: 'COD (Cash on Delivery)',
        type: 'cod',
        description: 'Bayar tunai saat barang diterima',
        fee: 5000,
      },
    ],
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
  if (price === 0) return 'Gratis'
  return `+${new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)}`
}

export default function PaymentModal({ onClose, onSelect }: PaymentModalProps) {
  const [selectedId, setSelectedId] = useState<string>('qris-all')
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'qris',
    'ewallet',
  ])

  const handleSelect = () => {
    for (const category of paymentCategories) {
      const selected = category.options.find((o) => o.id === selectedId)
      if (selected && onSelect) {
        onSelect(selected)
        break
      }
    }
    onClose()
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const getSelectedPayment = () => {
    for (const category of paymentCategories) {
      const selected = category.options.find((o) => o.id === selectedId)
      if (selected) return selected
    }
    return null
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
              <div className="bg-purple-100 p-2 rounded-xl">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Metode Pembayaran
                </h2>
                <p className="text-sm text-gray-500">
                  Pilih cara pembayaran Anda
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

          {/* Security Banner */}
          <div className="mx-6 mt-4 p-3 bg-green-50 rounded-xl flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700">
              Transaksi aman dengan enkripsi 256-bit
            </p>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[50vh] p-6 pt-4">
            <div className="space-y-3">
              {paymentCategories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-2xl overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-600">{category.icon}</div>
                      <span className="font-semibold text-gray-900">
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                        {category.options.length}
                      </span>
                    </div>
                    {expandedCategories.includes(category.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {/* Category Options */}
                  <AnimatePresence>
                    {expandedCategories.includes(category.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-2 space-y-2">
                          {category.options.map((option) => (
                            <motion.button
                              key={option.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedId(option.id)}
                              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                                selectedId === option.id
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-transparent hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Radio */}
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    selectedId === option.id
                                      ? 'border-green-500 bg-green-500'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {selectedId === option.id && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>

                                {/* Icon/Logo placeholder */}
                                {option.icon ? (
                                  <Image
                                    src={option.icon}
                                    alt={option.name}
                                    width={40}
                                    height={40}
                                    className="rounded-lg"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-500">
                                      {option.name.substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                )}

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900">
                                    {option.name}
                                  </p>
                                  {option.description && (
                                    <p className="text-xs text-gray-500 truncate">
                                      {option.description}
                                    </p>
                                  )}
                                </div>

                                {/* Fee */}
                                <span
                                  className={`text-sm font-medium ${
                                    option.fee === 0
                                      ? 'text-green-600'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {formatPrice(option.fee || 0)}
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
            {/* Selected Summary */}
            {selectedId && getSelectedPayment() && (
              <div className="mb-3 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {getSelectedPayment()?.name}
                  </span>
                </div>
                <span
                  className={`font-medium ${
                    getSelectedPayment()?.fee === 0
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}
                >
                  {formatPrice(getSelectedPayment()?.fee || 0)}
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
                Pilih Pembayaran
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
