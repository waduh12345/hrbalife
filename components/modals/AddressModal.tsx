'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  MapPin,
  Plus,
  Check,
  Home,
  Building2,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AddressModalProps {
  onClose: () => void
  onSelect?: (address: SavedAddress) => void
}

interface SavedAddress {
  id: string
  label: string
  type: 'home' | 'office' | 'other'
  name: string
  phone: string
  address: string
  city: string
  postalCode: string
  isDefault: boolean
}

// Demo saved addresses
const demoAddresses: SavedAddress[] = [
  {
    id: '1',
    label: 'Rumah',
    type: 'home',
    name: 'John Doe',
    phone: '08123456789',
    address: 'Jl. Sudirman No. 123, RT 01/RW 02, Kelurahan Menteng',
    city: 'Jakarta Pusat',
    postalCode: '10310',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Kantor',
    type: 'office',
    name: 'John Doe',
    phone: '08123456789',
    address: 'Gedung Graha Niaga Lt. 15, Jl. Jenderal Sudirman Kav. 58',
    city: 'Jakarta Selatan',
    postalCode: '12190',
    isDefault: false,
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

export default function AddressModal({ onClose, onSelect }: AddressModalProps) {
  const [selectedId, setSelectedId] = useState<string>(
    demoAddresses.find((a) => a.isDefault)?.id || ''
  )
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    label: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    type: 'home' as 'home' | 'office' | 'other',
  })

  const handleSelect = () => {
    const selected = demoAddresses.find((a) => a.id === selectedId)
    if (selected && onSelect) {
      onSelect(selected)
    }
    onClose()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-4 w-4" />
      case 'office':
        return <Building2 className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
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
              <div className="bg-green-100 p-2 rounded-xl">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {showAddForm ? 'Tambah Alamat Baru' : 'Pilih Alamat'}
                </h2>
                <p className="text-sm text-gray-500">
                  {showAddForm
                    ? 'Isi detail alamat pengiriman'
                    : 'Pilih alamat pengiriman Anda'}
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

          {/* Content */}
          <div className="overflow-y-auto max-h-[60vh] p-6">
            {showAddForm ? (
              /* Add Address Form */
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Address Type */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Jenis Alamat
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['home', 'office', 'other'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, type })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          formData.type === type
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {getTypeIcon(type)}
                        <span className="text-sm font-medium capitalize">
                          {type === 'home'
                            ? 'Rumah'
                            : type === 'office'
                            ? 'Kantor'
                            : 'Lainnya'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Label */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Label Alamat
                  </label>
                  <Input
                    placeholder="Contoh: Rumah Utama"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                  />
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Nama Penerima
                    </label>
                    <Input
                      placeholder="Nama lengkap"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      No. Telepon
                    </label>
                    <Input
                      placeholder="08xxxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Alamat Lengkap
                  </label>
                  <textarea
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* City & Postal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Kota
                    </label>
                    <Input
                      placeholder="Kota/Kabupaten"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Kode Pos
                    </label>
                    <Input
                      placeholder="12345"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value })
                      }
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Address List */
              <div className="space-y-3">
                {demoAddresses.map((address) => (
                  <motion.button
                    key={address.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedId(address.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedId === address.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Radio */}
                      <div
                        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedId === address.id
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedId === address.id && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                            {getTypeIcon(address.type)}
                            {address.label}
                          </span>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Utama
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900">
                          {address.name}
                        </p>
                        <p className="text-sm text-gray-500">{address.phone}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {address.address}, {address.city} {address.postalCode}
                        </p>
                      </div>

                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </motion.button>
                ))}

                {/* Add New Button */}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-green-600"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Tambah Alamat Baru</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
            {showAddForm ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  Kembali
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  Simpan Alamat
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Batal
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleSelect}
                >
                  Pilih Alamat
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
