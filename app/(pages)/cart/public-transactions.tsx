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
  User,
  X,
  Edit2,
  type LucideIcon,
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

/** ====== Sub-Components for UI Layout ====== */

// 1. Simple Modal Wrapper
const CheckoutModal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[#1F3A2B]/10 bg-white">
          <h3
            className={`text-lg font-bold text-[#1F3A2B] ${fredoka.className}`}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-[#1F3A2B]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>
        <div className="p-5 border-t border-[#1F3A2B]/10 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-[#1F3A2B] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1F3A2B]/90 transition shadow-lg"
          >
            Simpan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Summary Card (Tampilan Awal)
const SectionCard = ({
  title,
  icon: Icon,
  onEdit,
  isCompleted,
  children,
}: {
  title: string;
  icon: LucideIcon;
  onEdit: () => void;
  isCompleted: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div className="bg-white border border-[#1F3A2B]/10 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.005] transition-all duration-300 group/card">
      <div className="flex justify-between items-start mb-5">
        <h3
          className={`text-lg font-bold flex items-center gap-3 ${fredoka.className} text-[#1F3A2B]`}
        >
          <div className="w-8 h-8 rounded-full bg-[#DFF19D] flex items-center justify-center text-[#1F3A2B] shadow-sm">
            <Icon size={16} />
          </div>
          {title}
        </h3>

        {/* Tombol Edit yang Lebih Menarik */}
        <button
          onClick={onEdit}
          className={`
            group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300
            border border-[#1F3A2B]/20 bg-white text-[#1F3A2B]
            hover:bg-[#1F3A2B] hover:text-white hover:shadow-lg
          `}
        >
          {isCompleted ? "Ubah Data" : "Lengkapi"}
          <Edit2
            size={12}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </button>
      </div>
      <div className="pl-11 text-sm text-[#1F3A2B]/80 leading-relaxed">
        {children}
      </div>
    </div>
  );
};

/** ====== Main Component ====== */
export default function PublicTransaction() {
  const router = useRouter();
  const { handleCheckout } = useCheckout();
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal State
  const [activeModal, setActiveModal] = useState<
    "contact" | "address" | "shipping" | null
  >(null);

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

  // --- Display Helpers ---
  const getProvinceName = () =>
    provinces.find((p) => p.id === guest.rajaongkir_province_id)?.name;
  const getCityName = () =>
    cities.find((c) => c.id === guest.rajaongkir_city_id)?.name;
  const getDistrictName = () =>
    districts.find((d) => d.id === guest.rajaongkir_district_id)?.name;

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
            className={`text-lg font-bold tracking-tight ${fredoka.className}`}
          >
            HERBAL CARE®
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid sm:grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* --- LEFT COLUMN: SUMMARY CARDS --- */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Contact Information Card */}
            <SectionCard
              title="Informasi Kontak"
              icon={User}
              onEdit={() => setActiveModal("contact")}
              isCompleted={
                !!guest.guest_name && !!guest.guest_email && !!guest.guest_phone
              }
            >
              {guest.guest_name ? (
                <div className="space-y-1">
                  <p className="font-bold text-base">{guest.guest_name}</p>
                  <p className="">{guest.guest_phone}</p>
                  <p className="">{guest.guest_email}</p>
                </div>
              ) : (
                <p className="text-[#1F3A2B]/40 italic">
                  Belum ada data kontak.
                </p>
              )}
            </SectionCard>

            {/* 2. Shipping Address Card */}
            <SectionCard
              title="Alamat Pengiriman"
              icon={MapPin}
              onEdit={() => setActiveModal("address")}
              isCompleted={
                !!guest.address_line_1 && !!guest.rajaongkir_district_id
              }
            >
              {guest.address_line_1 && guest.rajaongkir_province_id ? (
                <div className="space-y-1">
                  <p className="font-medium text-base leading-relaxed">
                    {guest.address_line_1}
                  </p>
                  <p className="">
                    {getDistrictName()}, {getCityName()}, {getProvinceName()}
                  </p>
                  <p className="font-bold">Kode Pos: {guest.postal_code}</p>
                </div>
              ) : (
                <p className="text-[#1F3A2B]/40 italic">
                  Belum ada alamat pengiriman.
                </p>
              )}
            </SectionCard>

            {/* 3. Shipping Method Card */}
            <SectionCard
              title="Metode Pengiriman"
              icon={Truck}
              onEdit={() => setActiveModal("shipping")}
              isCompleted={!!shippingMethod}
            >
              {shippingMethod ? (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-base capitalize">
                      {shippingCourier} - {shippingMethod.service}
                    </p>
                    <p className="text-sm text-[#1F3A2B]/60">
                      {shippingMethod.description}
                    </p>
                    <p className="text-xs text-[#1F3A2B]/50 mt-1">
                      Estimasi: {shippingMethod.etd}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-base block">
                      Rp {shippingMethod.cost.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[#1F3A2B]/40 italic">
                  {!guest.rajaongkir_district_id
                    ? "Lengkapi alamat terlebih dahulu."
                    : "Belum memilih metode pengiriman."}
                </p>
              )}
            </SectionCard>

            {/* 4. Payment Method (Tetap Terbuka/Langsung Tampil) */}
            <section className="pt-2">
              <h3
                className={`text-lg font-bold mb-4 ${fredoka.className} flex items-center gap-3`}
              >
                <div className="w-8 h-8 rounded-full bg-[#DFF19D] flex items-center justify-center text-[#1F3A2B] shadow-sm">
                  <CreditCard size={16} />
                </div>
                Metode Pembayaran
              </h3>
              <div className="bg-white border border-[#1F3A2B]/10 rounded-2xl overflow-hidden shadow-sm divide-y divide-[#1F3A2B]/5">
                {/* Option: Automatic */}
                <label className="flex items-center p-5 cursor-pointer hover:bg-[#1F3A2B]/5 transition group">
                  <input
                    type="radio"
                    name="payment"
                    className="accent-[#1F3A2B] w-5 h-5 mr-4"
                    checked={paymentType === "automatic"}
                    onChange={() => setPaymentType("automatic")}
                  />
                  <div>
                    <span className="font-bold block mb-1 text-sm text-[#1F3A2B] group-hover:text-[#1F3A2B]">
                      Pembayaran Otomatis
                    </span>
                    <span className="text-xs text-[#1F3A2B]/60">
                      QRIS, Virtual Account, E-Wallet (Proses Instan)
                    </span>
                  </div>
                </label>

                {/* Option: Manual */}
                <label className="flex items-center p-5 cursor-pointer hover:bg-[#1F3A2B]/5 transition group">
                  <input
                    type="radio"
                    name="payment"
                    className="accent-[#1F3A2B] w-5 h-5 mr-4"
                    checked={paymentType === "manual"}
                    onChange={() => setPaymentType("manual")}
                  />
                  <div>
                    <span className="font-bold block mb-1 text-sm text-[#1F3A2B] group-hover:text-[#1F3A2B]">
                      Transfer Manual
                    </span>
                    <span className="text-xs text-[#1F3A2B]/60">
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
                  <span className="text-xs bg-[#1F3A2B]/10 text-[#1F3A2B] px-3 py-1 rounded-full font-bold">
                    {cartItems.length} Item
                  </span>
                </div>

                <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.cartId} className="flex gap-4 group">
                      <div className="relative w-16 h-16 bg-[#FDFBF7] rounded-xl overflow-hidden border border-[#1F3A2B]/10 shrink-0 group-hover:border-[#1F3A2B]/30 transition">
                        <Image
                          src={getImageUrlFromProduct(item)}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute bottom-0 right-0 bg-[#1F3A2B] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-tl-lg font-bold">
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
                    <span className="text-base font-bold text-white/90">
                      Total Bayar
                    </span>
                    {/* Ukuran Total Bayar disesuaikan (tidak terlalu besar) */}
                    <span
                      className={`text-xl font-bold text-[#DFF19D] ${fredoka.className}`}
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
                  className="w-full bg-[#DFF19D] text-[#1F3A2B] py-3.5 rounded-xl font-bold hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 group text-sm"
                >
                  {isProcessing ? (
                    <>
                      <DotdLoader /> Memproses...
                    </>
                  ) : (
                    <>
                      BAYAR SEKARANG
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

      {/* ====== MODALS ====== */}

      {/* 1. Modal Contact Info */}
      <CheckoutModal
        isOpen={activeModal === "contact"}
        onClose={() => setActiveModal(null)}
        title="Ubah Informasi Kontak"
      >
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
              Nama Lengkap
            </label>
            <input
              type="text"
              className="w-full bg-transparent border-b border-[#1F3A2B]/20 py-2 text-sm focus:outline-none focus:border-[#1F3A2B] transition-colors placeholder:text-[#1F3A2B]/30"
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
              className="w-full bg-transparent border-b border-[#1F3A2B]/20 py-2 text-sm focus:outline-none focus:border-[#1F3A2B] transition-colors placeholder:text-[#1F3A2B]/30"
              placeholder="08xxxxxxxx"
              value={guest.guest_phone}
              onChange={(e) =>
                setGuest((s) => ({ ...s, guest_phone: e.target.value }))
              }
            />
            {!isPhoneValid && guest.guest_phone && (
              <p className="text-xs text-red-500 mt-1">Nomor tidak valid</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
              Email Address
            </label>
            <input
              type="email"
              className="w-full bg-transparent border-b border-[#1F3A2B]/20 py-2 text-sm focus:outline-none focus:border-[#1F3A2B] transition-colors placeholder:text-[#1F3A2B]/30"
              placeholder="email@anda.com"
              value={guest.guest_email}
              onChange={(e) =>
                setGuest((s) => ({ ...s, guest_email: e.target.value }))
              }
            />
            {!isEmailValid && guest.guest_email && (
              <p className="text-xs text-red-500 mt-1">Email tidak valid</p>
            )}
          </div>
        </div>
      </CheckoutModal>

      {/* 2. Modal Address */}
      <CheckoutModal
        isOpen={activeModal === "address"}
        onClose={() => setActiveModal(null)}
        title="Ubah Alamat Pengiriman"
      >
        <div className="space-y-5">
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
              className="w-full border border-[#1F3A2B]/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3A2B] bg-[#FDFBF7] transition-colors"
              placeholder="12345"
              value={guest.postal_code}
              onChange={(e) =>
                setGuest((s) => ({ ...s, postal_code: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
              Detail Alamat
            </label>
            <textarea
              className="w-full border border-[#1F3A2B]/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1F3A2B] bg-[#FDFBF7] transition-colors"
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
      </CheckoutModal>

      {/* 3. Modal Shipping Method */}
      <CheckoutModal
        isOpen={activeModal === "shipping"}
        onClose={() => setActiveModal(null)}
        title="Ubah Metode Pengiriman"
      >
        <div className="space-y-6">
          <div className="w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60 mb-2 block">
              Pilih Kurir
            </label>
            <Select
              value={shippingCourier ?? ""}
              onValueChange={setShippingCourier}
              disabled={!guest.rajaongkir_district_id}
            >
              <SelectTrigger className="h-11 w-full text-sm bg-white border-[#1F3A2B]/20 rounded-xl">
                <SelectValue placeholder="Pilih Kurir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jne">JNE</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white border border-[#1F3A2B]/10 rounded-xl overflow-hidden shadow-sm">
            {isShippingLoading ? (
              <div className="p-10 flex justify-center text-[#1F3A2B]">
                <DotdLoader />
              </div>
            ) : !shippingCourier ? (
              <div className="p-8 text-center text-[#1F3A2B]/40 text-sm flex flex-col items-center gap-2">
                <MapPin className="w-8 h-8 opacity-50" />
                Silakan lengkapi alamat dan pilih kurir.
              </div>
            ) : (
              <div className="divide-y divide-[#1F3A2B]/5">
                {shippingOptions.map((opt, i) => (
                  <label
                    key={i}
                    className={`flex items-center p-4 cursor-pointer hover:bg-[#1F3A2B]/5 transition ${
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
                        <span className="font-bold text-sm flex items-center gap-2 text-[#1F3A2B]">
                          <Truck size={14} /> {opt.service}
                        </span>
                        <span className="font-bold text-sm">
                          Rp {opt.cost.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="text-xs text-[#1F3A2B]/60">
                        {opt.description} • Estimasi {opt.etd}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </CheckoutModal>
    </div>
  );
}