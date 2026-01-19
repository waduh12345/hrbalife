"use client";

import { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  CreditCard,
  MapPin,
  Package,
} from "lucide-react";

// Services & Hooks
import { useCheckShippingCostQuery } from "@/services/auth.service";
import {
  useGetProvincesQuery,
  useGetCitiesQuery,
  useGetDistrictsQuery,
} from "@/services/shop/open-shop/open-shop.service";

import VoucherPicker from "@/components/voucher-picker";
import type { Voucher } from "@/types/voucher";
import type { Product } from "@/types/admin/product";
import { fredoka, sniglet } from "@/lib/fonts";
import { Combobox } from "@/components/ui/combo-box";
import DotdLoader from "@/components/loader/3dot";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import useCart, { CartItem } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-checkout";
import type { CheckoutDeps } from "@/types/checkout";

/** ====== Helpers & Types ====== */

// Interface untuk data wilayah
interface RegionData {
  id: number;
  name: string;
}

interface ShippingCostOption {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

const COD_SHIPPING_OPTIONS: ShippingCostOption[] = [
  {
    name: "COD",
    code: "cod-close",
    service: "COD Jarak Dekat",
    description: "Bayar di tempat - area terdekat",
    cost: 10000,
    etd: "1-2 hari",
  },
  {
    name: "COD",
    code: "cod-far",
    service: "COD Jarak Jauh",
    description: "Bayar di tempat - area jauh",
    cost: 25000,
    etd: "2-3 hari",
  },
];

const INTERNATIONAL_SHIPPING_OPTIONS: ShippingCostOption[] = [
  {
    name: "International",
    code: "intl-singapore",
    service: "Singapura",
    description: "Pengiriman internasional ke Singapura",
    cost: 85000,
    etd: "7-14 hari",
  },
  {
    name: "International",
    code: "intl-malaysia",
    service: "Malaysia",
    description: "Pengiriman internasional ke Malaysia",
    cost: 85000,
    etd: "7-14 hari",
  },
];

type PaymentType = "automatic" | "manual" | "cod";

function getImageUrlFromProduct(p: Product | CartItem): string {
  if (typeof p.image === "string" && p.image) return p.image;
  if (p.image && typeof p.image === "string") return p.image;

  const media = (p as unknown as { media?: Array<{ original_url: string }> })
    ?.media;
  if (Array.isArray(media) && media[0]?.original_url)
    return media[0].original_url;
  return "/api/placeholder/150/150";
}

/** ====== Component ====== */
export default function PublicTransaction() {
  const router = useRouter();
  const { handleCheckout } = useCheckout();
  const [isProcessing, setIsProcessing] = useState(false);

  // Cart Hook
  const { cartItems, clearCart } = useCart();

  // Hydration Check
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // --- Guest Form State ---
  const [guest, setGuest] = useState({
    address_line_1: "",
    address_line_2: "",
    postal_code: "",
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    rajaongkir_province_id: 0,
    rajaongkir_city_id: 0,
    rajaongkir_district_id: 0,
  });

  // Validation
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  useEffect(() => {
    setIsPhoneValid(/^(?:\+62|62|0)8\d{8,11}$/.test(guest.guest_phone));
  }, [guest.guest_phone]);

  useEffect(() => {
    setIsEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.guest_email));
  }, [guest.guest_email]);

  // --- Region Data ---
  const { data: provinces = [], isLoading: provLoading } =
    useGetProvincesQuery();
  const { data: cities = [], isLoading: cityLoading } = useGetCitiesQuery(
    guest.rajaongkir_province_id,
    { skip: !guest.rajaongkir_province_id },
  );
  const { data: districts = [], isLoading: distLoading } = useGetDistrictsQuery(
    guest.rajaongkir_city_id,
    { skip: !guest.rajaongkir_city_id },
  );

  // Reset region logic
  useEffect(() => {
    setGuest((s) => ({
      ...s,
      rajaongkir_city_id: 0,
      rajaongkir_district_id: 0,
    }));
  }, [guest.rajaongkir_province_id]);

  useEffect(() => {
    setGuest((s) => ({ ...s, rajaongkir_district_id: 0 }));
  }, [guest.rajaongkir_city_id]);

  // --- Shipping Logic ---
  const [shippingCourier, setShippingCourier] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingCostOption | null>(null);

  // FIX: Menambahkan dimensi default untuk mengatasi error TypeScript
  const { data: apiShippingOptions = [], isLoading: isShippingLoading } =
    useCheckShippingCostQuery(
      {
        shop_id: 1,
        destination: guest.rajaongkir_district_id
          ? String(guest.rajaongkir_district_id)
          : guest.postal_code,
        weight: 1000,
        courier: shippingCourier ?? "",
        height: 10,
        length: 10,
        width: 10,
        diameter: 10,
      },
      {
        skip:
          !guest.rajaongkir_district_id ||
          !shippingCourier ||
          shippingCourier === "cod" ||
          shippingCourier === "international",
      },
    );

  const shippingOptions = useMemo(() => {
    if (shippingCourier === "cod") return COD_SHIPPING_OPTIONS;
    if (shippingCourier === "international")
      return INTERNATIONAL_SHIPPING_OPTIONS;
    return apiShippingOptions;
  }, [shippingCourier, apiShippingOptions]);

  useEffect(() => {
    if (shippingOptions.length > 0 && !shippingMethod) {
      setShippingMethod(shippingOptions[0]);
    } else if (shippingOptions.length === 0) {
      setShippingMethod(null);
    }
  }, [shippingOptions, shippingMethod]);

  // --- Payment & Totals ---
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>("manual");

  const subtotal = cartItems.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0,
  );

  const discount = useMemo(() => {
    if (!selectedVoucher) return 0;
    if (selectedVoucher.type === "fixed") {
      const cut = Math.max(0, selectedVoucher.fixed_amount);
      return Math.min(cut, subtotal);
    }
    const pct = Math.max(0, selectedVoucher.percentage_amount);
    return Math.round((subtotal * pct) / 100);
  }, [selectedVoucher, subtotal]);

  const shippingCost = shippingMethod?.cost ?? 0;
  const codFee =
    paymentType === "cod"
      ? Math.round((subtotal - discount + shippingCost) * 0.02)
      : 0;
  const total = subtotal - discount + shippingCost + codFee;

  // --- Action ---
  const onCheckout = async () => {
    if (cartItems.some((it) => (it.stock ?? 0) <= 0)) {
      await Swal.fire({
        icon: "error",
        title: "Stok Habis",
        text: "Ada produk habis stok. Mohon hapus dari keranjang.",
      });
      return;
    }
    if (
      !guest.address_line_1 ||
      !guest.guest_name ||
      !guest.guest_email ||
      !guest.guest_phone ||
      !shippingCourier ||
      !shippingMethod ||
      !isPhoneValid ||
      !isEmailValid
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Data Belum Lengkap",
        text: "Lengkapi semua form dengan tanda bintang (*).",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // FIX: Memastikan items terkirim dengan struktur yang benar jika hook mengizinkan override
      // Jika hook tidak mendukung, pastikan data di cartItems (Zustand) sudah benar
      const deps: CheckoutDeps = {
        sessionEmail: null,
        shippingCourier,
        shippingMethod,
        shippingInfo: {
          fullName: guest.guest_name,
          email: guest.guest_email,
          phone: guest.guest_phone,
          address_line_1: guest.address_line_1,
          postal_code: guest.postal_code,
          address_line_2: guest.address_line_2,
          rajaongkir_province_id: guest.rajaongkir_province_id,
          rajaongkir_city_id: guest.rajaongkir_city_id,
          rajaongkir_district_id: guest.rajaongkir_district_id,
        },
        paymentType,
        voucher: selectedVoucher ? [selectedVoucher.id] : [],
        clearCart,
        paymentMethod: undefined,
        paymentChannel: undefined,
      };
      await handleCheckout(deps);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isMounted) return null;

  if (cartItems.length === 0) {
    if (typeof window !== "undefined") router.push("/product");
    return null;
  }

  return (
    <div
      className={`min-h-screen mt-20 bg-[#FDFBF7] text-[#1F3A2B] ${sniglet.className}`}
    >
      {/* Header */}
      <header className="border-b border-[#1F3A2B]/10 bg-white fixed top-0 w-full z-40 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold hover:text-[#1F3A2B]/70 transition"
          >
            <ArrowLeft className="w-5 h-5" /> KEMBALI
          </button>
          <div
            className={`text-2xl font-bold tracking-tight ${fredoka.className}`}
          >
            HERBAL CARE®
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid sm:grid-cols-1 lg:grid-cols-12 gap-12">
          {/* --- LEFT COLUMN: FORMS --- */}
          <div className="lg:col-span-7 space-y-12">
            {/* 1. Contact Information */}
            <section>
              <h2
                className={`text-xl font-bold mb-6 flex items-center gap-2 ${fredoka.className}`}
              >
                1. Informasi Kontak
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-[#1F3A2B]/20 py-2 text-lg focus:outline-none focus:border-[#1F3A2B] transition-colors placeholder:text-[#1F3A2B]/30"
                      placeholder="Nama Anda"
                      value={guest.guest_name}
                      onChange={(e) =>
                        setGuest((s) => ({ ...s, guest_name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      className="w-full bg-transparent border-b border-[#1F3A2B]/20 py-2 text-lg focus:outline-none focus:border-[#1F3A2B] transition-colors placeholder:text-[#1F3A2B]/30"
                      placeholder="08xxxxxxxx"
                      value={guest.guest_phone}
                      onChange={(e) =>
                        setGuest((s) => ({ ...s, guest_phone: e.target.value }))
                      }
                    />
                    {!isPhoneValid && guest.guest_phone && (
                      <p className="text-xs text-red-500 mt-1">
                        Nomor tidak valid
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full bg-transparent border-b border-[#1F3A2B]/20 py-2 text-lg focus:outline-none focus:border-[#1F3A2B] transition-colors placeholder:text-[#1F3A2B]/30"
                    placeholder="email@anda.com"
                    value={guest.guest_email}
                    onChange={(e) =>
                      setGuest((s) => ({ ...s, guest_email: e.target.value }))
                    }
                  />
                  {!isEmailValid && guest.guest_email && (
                    <p className="text-xs text-red-500 mt-1">
                      Email tidak valid
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* 2. Shipping Address */}
            <section>
              <h2
                className={`text-xl font-bold mb-6 flex items-center gap-2 ${fredoka.className}`}
              >
                2. Alamat Pengiriman
              </h2>
              <div className="p-8 border border-[#1F3A2B]/10 rounded-2xl bg-white space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Provinsi
                    </label>
                    <Combobox
                      data={provinces}
                      value={guest.rajaongkir_province_id || null}
                      onChange={(id) =>
                        setGuest((s) => ({ ...s, rajaongkir_province_id: id }))
                      }
                      getOptionLabel={(i: RegionData) => i.name}
                      isLoading={provLoading}
                      placeholder="Pilih Provinsi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Kota/Kabupaten
                    </label>
                    <Combobox
                      data={cities}
                      value={guest.rajaongkir_city_id || null}
                      onChange={(id) =>
                        setGuest((s) => ({ ...s, rajaongkir_city_id: id }))
                      }
                      getOptionLabel={(i: RegionData) => i.name}
                      isLoading={cityLoading}
                      placeholder="Pilih Kota"
                      disabled={!guest.rajaongkir_province_id}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Kecamatan
                    </label>
                    <Combobox
                      data={districts}
                      value={guest.rajaongkir_district_id || null}
                      onChange={(id) =>
                        setGuest((s) => ({ ...s, rajaongkir_district_id: id }))
                      }
                      getOptionLabel={(i: RegionData) => i.name}
                      isLoading={distLoading}
                      placeholder="Pilih Kecamatan"
                      disabled={!guest.rajaongkir_city_id}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      className="w-full border border-[#1F3A2B]/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1F3A2B] bg-[#FDFBF7] transition-colors"
                      placeholder="12345"
                      value={guest.postal_code}
                      onChange={(e) =>
                        setGuest((s) => ({ ...s, postal_code: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                    Detail Alamat
                  </label>
                  <textarea
                    className="w-full border border-[#1F3A2B]/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1F3A2B] bg-[#FDFBF7] transition-colors"
                    rows={3}
                    placeholder="Nama jalan, gedung, nomor rumah..."
                    value={guest.address_line_1}
                    onChange={(e) =>
                      setGuest((s) => ({
                        ...s,
                        address_line_1: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </section>

            {/* 3. Shipping Method */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2
                  className={`text-xl font-bold ${fredoka.className} flex items-center gap-2`}
                >
                  3. Metode Pengiriman
                </h2>
                <div className="w-48">
                  <Select
                    value={shippingCourier ?? ""}
                    onValueChange={setShippingCourier}
                    disabled={!guest.rajaongkir_district_id}
                  >
                    <SelectTrigger className="h-10 w-full text-sm bg-white border-[#1F3A2B]/20 rounded-lg">
                      <SelectValue placeholder="Pilih Kurir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jne">JNE</SelectItem>
                      <SelectItem value="international">
                        International
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-white border border-[#1F3A2B]/10 rounded-2xl overflow-hidden shadow-sm">
                {isShippingLoading ? (
                  <div className="p-10 flex justify-center text-[#1F3A2B]">
                    <DotdLoader />
                  </div>
                ) : !shippingCourier ? (
                  <div className="p-10 text-center text-[#1F3A2B]/40 text-sm flex flex-col items-center gap-2">
                    <MapPin className="w-8 h-8 opacity-50" />
                    Silakan lengkapi alamat dan pilih kurir.
                  </div>
                ) : (
                  <div className="divide-y divide-[#1F3A2B]/5">
                    {shippingOptions.map((opt, i) => (
                      <label
                        key={i}
                        className={`flex items-center p-5 cursor-pointer hover:bg-[#1F3A2B]/5 transition ${
                          shippingMethod?.service === opt.service
                            ? "bg-[#1F3A2B]/5"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          className="accent-[#1F3A2B] w-5 h-5 mr-4"
                          checked={shippingMethod?.service === opt.service}
                          onChange={() => setShippingMethod(opt)}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold flex items-center gap-2 text-[#1F3A2B]">
                              <Truck size={18} /> {opt.service}
                            </span>
                            <span className="font-bold text-lg">
                              Rp {opt.cost.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <p className="text-sm text-[#1F3A2B]/60">
                            {opt.description} • Estimasi {opt.etd}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 4. Payment Method */}
            <section>
              <h2
                className={`text-xl font-bold mb-6 ${fredoka.className} flex items-center gap-2`}
              >
                4. Metode Pembayaran
              </h2>
              <div className="bg-white border border-[#1F3A2B]/10 rounded-2xl overflow-hidden shadow-sm divide-y divide-[#1F3A2B]/5">
                {/* Option: Automatic */}
                <label className="flex items-center p-5 cursor-pointer hover:bg-[#1F3A2B]/5 transition">
                  <input
                    type="radio"
                    name="payment"
                    className="accent-[#1F3A2B] w-5 h-5 mr-4"
                    checked={paymentType === "automatic"}
                    onChange={() => setPaymentType("automatic")}
                  />
                  <div>
                    <span className="font-bold block mb-1 text-[#1F3A2B]">
                      Pembayaran Otomatis
                    </span>
                    <span className="text-sm text-[#1F3A2B]/60">
                      QRIS, Virtual Account, E-Wallet (Proses Instan)
                    </span>
                  </div>
                </label>

                {/* Option: Manual */}
                <label className="flex items-center p-5 cursor-pointer hover:bg-[#1F3A2B]/5 transition">
                  <input
                    type="radio"
                    name="payment"
                    className="accent-[#1F3A2B] w-5 h-5 mr-4"
                    checked={paymentType === "manual"}
                    onChange={() => setPaymentType("manual")}
                  />
                  <div>
                    <span className="font-bold block mb-1 text-[#1F3A2B]">
                      Transfer Manual
                    </span>
                    <span className="text-sm text-[#1F3A2B]/60">
                      Konfirmasi via WhatsApp Admin setelah transfer
                    </span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* --- RIGHT COLUMN: ORDER SUMMARY (STICKY) --- */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              {/* Product List */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#1F3A2B]/10">
                <div className="flex justify-between items-center mb-6 border-b border-[#1F3A2B]/10 pb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2 text-[#1F3A2B]">
                    <Package size={20} /> Ringkasan Pesanan
                  </h3>
                  <span className="text-sm bg-[#1F3A2B]/10 text-[#1F3A2B] px-3 py-1 rounded-full font-bold">
                    {cartItems.length} Item
                  </span>
                </div>

                <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.cartId} className="flex gap-4 group">
                      <div className="relative w-20 h-20 bg-[#FDFBF7] rounded-xl overflow-hidden border border-[#1F3A2B]/10 shrink-0 group-hover:border-[#1F3A2B]/30 transition">
                        <Image
                          src={getImageUrlFromProduct(item)}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute bottom-0 right-0 bg-[#1F3A2B] text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-tl-lg font-bold">
                          x{item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-bold text-sm text-[#1F3A2B] line-clamp-2 leading-tight mb-1">
                          {item.name}
                        </h4>
                        <div className="text-xs text-[#1F3A2B]/50 mb-1 flex flex-wrap gap-1">
                          {item.variant_name && (
                            <span className="bg-[#1F3A2B]/5 px-1.5 py-0.5 rounded">
                              {item.variant_name}
                            </span>
                          )}
                          {item.size_name && (
                            <span className="bg-[#1F3A2B]/5 px-1.5 py-0.5 rounded">
                              {item.size_name}
                            </span>
                          )}
                          {!item.variant_name && !item.size_name && (
                            <span>Default</span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-[#1F3A2B]">
                          Rp{" "}
                          {(item.price * item.quantity).toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Card */}
              <div className="bg-[#1F3A2B] text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-[#DFF19D]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-3 mb-8 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal Produk</span>
                    <span className="text-white font-medium">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Pengiriman</span>
                    <span className="text-white font-medium">
                      {shippingCost > 0
                        ? `Rp ${shippingCost.toLocaleString("id-ID")}`
                        : "-"}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#DFF19D]">
                      <span>Diskon Voucher</span>
                      <span>- Rp {discount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  {codFee > 0 && (
                    <div className="flex justify-between text-white/70">
                      <span>Biaya Layanan COD</span>
                      <span className="text-white font-medium">
                        Rp {codFee.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-end">
                    <span className="text-lg font-bold text-white/90">
                      Total Bayar
                    </span>
                    <span
                      className={`text-3xl font-bold text-[#DFF19D] ${fredoka.className}`}
                    >
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Voucher Input */}
                <div className="mb-6 relative z-10">
                  <VoucherPicker
                    selected={selectedVoucher}
                    onChange={setSelectedVoucher}
                  />
                </div>

                <button
                  onClick={onCheckout}
                  disabled={isProcessing}
                  className="w-full bg-[#DFF19D] text-[#1F3A2B] py-4 rounded-xl font-bold hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 group"
                >
                  {isProcessing ? (
                    <>
                      <DotdLoader /> Memproses...
                    </>
                  ) : (
                    <>
                      BAYAR SEKARANG
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-white/40 font-bold">
                  <ShieldCheck className="w-3 h-3" /> Transaksi Aman &
                  Terenkripsi
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}