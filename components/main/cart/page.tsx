"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Heart,
  ArrowLeft,
  CreditCard,
  CheckCircle,
  Sparkles,
  Package,
  ShieldCheck, // Updated icon
  Truck,
  Star,
  Upload,
  Banknote,
  ExternalLink,
  Layers,
  Maximize2,
  ChevronRight, // Updated icon
  MapPin, // Updated icon
} from "lucide-react";
import { Product } from "@/types/admin/product";
import { useGetProductListQuery } from "@/services/product.service";
import DotdLoader from "@/components/loader/3dot";

// === Import logic checkout ===
import { Combobox } from "@/components/ui/combo-box";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  useGetProvincesQuery,
  useGetCitiesQuery,
  useGetDistrictsQuery,
} from "@/services/shop/open-shop/open-shop.service";
import {
  useGetCurrentUserQuery,
  useCheckShippingCostQuery,
} from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGetUserAddressListQuery } from "@/services/address.service";
import type { Address } from "@/types/address";
import { CheckoutDeps } from "@/types/checkout";
import { useCheckout } from "@/hooks/use-checkout";
import VariantPickerModal from "@/components/variant-picker-modal";
import VoucherPicker from "@/components/voucher-picker";
import type { Voucher } from "@/types/voucher";
import useCart, { CartItem } from "@/hooks/use-cart";
import { fredoka, sniglet } from "@/lib/fonts"; // Fonts from UI reference

// Definisi Tipe Pembayaran
type PaymentType = "automatic" | "manual" | "cod";

interface RelatedProductView {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  category: string;
  __raw: Product;
}

// Interface Helper untuk Region agar tidak any
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
  {
    name: "International",
    code: "intl-taiwan",
    service: "Taiwan",
    description: "Pengiriman internasional ke Taiwan",
    cost: 100000,
    etd: "10-21 hari",
  },
  {
    name: "International",
    code: "intl-hongkong-aan",
    service: "Hong Kong - Aan Express",
    description: "Pengiriman ke Hong Kong via Aan Express",
    cost: 7000,
    etd: "5-10 hari",
  },
  {
    name: "International",
    code: "intl-hongkong-hada",
    service: "Hong Kong - Hada Express",
    description: "Pengiriman ke Hong Kong via Hada Express",
    cost: 7000,
    etd: "5-10 hari",
  },
];

function getImageUrlFromProduct(p: Product | CartItem): string {
  if (typeof p.image === "string" && p.image) return p.image;
  if (p.image && typeof p.image === "string") return p.image;

  const media = (p as unknown as { media?: Array<{ original_url: string }> })
    ?.media;
  if (Array.isArray(media) && media[0]?.original_url)
    return media[0].original_url;
  return "/api/placeholder/300/300";
}

const GUEST_INFO_KEY = "__guest_checkout_info__";

type GuestInfo = {
  fullName: string;
  phone: string;
  email?: string;
  address_line_1: string;
  address_line_2?: string;
  postal_code: string;
  rajaongkir_province_id: number;
  rajaongkir_city_id: number;
  rajaongkir_district_id: number;
};

function getGuestInfo(): GuestInfo | null {
  try {
    const raw = localStorage.getItem(GUEST_INFO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestInfo;
    if (!parsed.fullName || !parsed.address_line_1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.email;

  // --- USE CART HOOK ---
  const {
    cartItems,
    removeItem,
    increaseItemQuantity,
    decreaseItemQuantity,
    clearCart,
    addItem, // Added for related products
  } = useCart();

  // --- GROUPING LOGIC ---
  const groupedCartItems = useMemo(() => {
    const groups: Record<number, { common: CartItem; items: CartItem[] }> = {};

    cartItems.forEach((item) => {
      if (!groups[item.id]) {
        groups[item.id] = {
          common: item,
          items: [],
        };
      }
      groups[item.id].items.push(item);
    });

    return Object.values(groups);
  }, [cartItems]);

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);

  const openVariantModal = (p: Product) => {
    setVariantProduct(p);
    setVariantModalOpen(true);
  };

  const sessionName = useMemo(() => session?.user?.name ?? "", [session]);

  // Voucher State
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // State Payment Type (Default Automatic)
  const [paymentType, setPaymentType] = useState<PaymentType>("automatic");

  const [shippingCourier, setShippingCourier] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingCostOption | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    postal_code: "",
    kecamatan: "",
    rajaongkir_province_id: 0,
    rajaongkir_city_id: 0,
    rajaongkir_district_id: 0,
  });

  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [hasDefaultAddress, setHasDefaultAddress] = useState(false);

  const { handleCheckout } = useCheckout();

  const onCheckoutClick = async () => {
    const deps: CheckoutDeps = {
      sessionEmail: session?.user?.email ?? null,
      shippingCourier,
      shippingMethod,
      shippingInfo: {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address_line_1: shippingInfo.address_line_1,
        postal_code: shippingInfo.postal_code,
        rajaongkir_province_id: shippingInfo.rajaongkir_province_id,
        rajaongkir_city_id: shippingInfo.rajaongkir_city_id,
        rajaongkir_district_id: shippingInfo.rajaongkir_district_id,
        email: shippingInfo.email,
        address_line_2: shippingInfo.address_line_2,
      },
      paymentType: paymentType,
      paymentMethod: undefined,
      paymentChannel: undefined,
      clearCart,
      voucher: selectedVoucher ? [selectedVoucher.id] : [],
    };

    setIsCheckingOut(true);
    setIsSubmitting(true);
    try {
      await handleCheckout(deps);
    } finally {
      setIsSubmitting(false);
      setIsCheckingOut(false);
    }
  };

  const validatePhone = (phone: string) =>
    /^(?:\+62|62|0)8\d{8,11}$/.test(phone);
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const { data: currentUserResp } = useGetCurrentUserQuery();
  const currentUser = useMemo(() => currentUserResp || null, [currentUserResp]);

  useEffect(() => {
    setIsPhoneValid(validatePhone(shippingInfo.phone));
  }, [shippingInfo.phone]);

  useEffect(() => {
    setIsEmailValid(
      isLoggedIn
        ? true
        : shippingInfo.email
          ? validateEmail(shippingInfo.email)
          : false,
    );
  }, [shippingInfo.email, isLoggedIn]);

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const { data: userAddressList } = useGetUserAddressListQuery({
    page: 1,
    paginate: 100,
  });
  const defaultAddress: Address | undefined = userAddressList?.data?.find(
    (a) => a.is_default,
  );
  const didPrefill = useRef(false);

  useEffect(() => {
    if (didPrefill.current) return;
    if (sessionName) {
      setShippingInfo((prev) => ({ ...prev, fullName: sessionName }));
    }
  }, [sessionName]);

  useEffect(() => {
    if (didPrefill.current) return;

    if (!isLoggedIn && !hasDefaultAddress) {
      const g = getGuestInfo();
      if (g) {
        setShippingInfo((prev) => ({
          ...prev,
          fullName: g.fullName || prev.fullName,
          phone: g.phone || prev.phone,
          email: g.email || prev.email,
          address_line_1: g.address_line_1 || prev.address_line_1,
          address_line_2: g.address_line_2 || prev.address_line_2,
          postal_code: g.postal_code || prev.postal_code,
          rajaongkir_province_id:
            g.rajaongkir_province_id || prev.rajaongkir_province_id,
          rajaongkir_city_id: g.rajaongkir_city_id || prev.rajaongkir_city_id,
          rajaongkir_district_id:
            g.rajaongkir_district_id || prev.rajaongkir_district_id,
        }));
      }
    }
    didPrefill.current = true;
  }, [isLoggedIn, hasDefaultAddress]);

  const { data: provinces = [], isLoading: loadingProvince } =
    useGetProvincesQuery();
  const { data: cities = [], isLoading: loadingCity } = useGetCitiesQuery(
    shippingInfo.rajaongkir_province_id,
    { skip: !shippingInfo.rajaongkir_province_id },
  );
  const { data: districts = [], isLoading: loadingDistrict } =
    useGetDistrictsQuery(shippingInfo.rajaongkir_city_id, {
      skip: !shippingInfo.rajaongkir_city_id,
    });

  const getShippingOptions = (): ShippingCostOption[] => {
    if (shippingCourier === "cod") {
      return COD_SHIPPING_OPTIONS;
    } else if (shippingCourier === "international") {
      return INTERNATIONAL_SHIPPING_OPTIONS;
    }
    return apiShippingOptions;
  };

  const {
    data: apiShippingOptions = [],
    isLoading: isShippingLoading,
    isError: isShippingError,
  } = useCheckShippingCostQuery(
    {
      shop_id: 1,
      destination: String(shippingInfo.rajaongkir_district_id),
      weight: 1000,
      height: 10,
      length: 10,
      width: 10,
      diameter: 10,
      courier: shippingCourier ?? "",
    },
    {
      skip:
        !shippingInfo.rajaongkir_district_id ||
        !shippingCourier ||
        shippingCourier === "cod" ||
        shippingCourier === "international",
      refetchOnMountOrArgChange: true,
    },
  );

  const shippingOptions = getShippingOptions();

  useEffect(() => {
    if (shippingOptions.length > 0) {
      setShippingMethod(shippingOptions[0]);
    } else {
      setShippingMethod(null);
    }
  }, [shippingOptions]);

  const {
    data: relatedResp,
    isLoading: isRelLoading,
    isError: isRelError,
  } = useGetProductListQuery({
    page: 1,
    paginate: 6,
    product_merk_id: undefined,
  });

  const relatedProducts: RelatedProductView[] = useMemo(() => {
    const arr = relatedResp?.data ?? [];
    return arr.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: undefined,
      image: getImageUrlFromProduct(p),
      rating:
        typeof p.rating === "number"
          ? p.rating
          : parseFloat(p.rating || "0") || 0,
      category: p.category_name,
      __raw: p,
    }));
  }, [relatedResp]);

  const subtotal = cartItems.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0,
  );

  const discount = useMemo(() => {
    if (!selectedVoucher) return 0;
    if (selectedVoucher.type === "fixed") {
      return Math.min(selectedVoucher.fixed_amount, subtotal);
    }
    if (selectedVoucher.type === "percentage") {
      const amount = (subtotal * selectedVoucher.percentage_amount) / 100;
      return Math.round(amount);
    }
    return 0;
  }, [selectedVoucher, subtotal]);

  const shippingCost = shippingMethod?.cost ?? 0;

  const codFee =
    paymentType === "cod"
      ? Math.round((subtotal - discount + shippingCost) * 0.02)
      : 0;

  const total = Math.max(0, subtotal - discount + shippingCost + codFee);

  // --- EMPTY STATE ---
  if (cartItems.length === 0) {
    return (
      <div
        className={`min-h-screen w-full bg-gradient-to-br from-white to-[#1F3A2B]/10 pt-20 pb-20 ${sniglet.className}`}
      >
        <div className="container mx-auto px-6 lg:px-12">
          {/* --- EMPTY STATE SECTION --- */}
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-32 h-32 bg-[#1F3A2B]/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="w-16 h-16 text-[#1F3A2B]" />
            </div>

            <h1 className="text-4xl font-bold text-[#1F3A2B] mb-4">
              Keranjang Kosong
            </h1>

            <p className="text-xl text-gray-600 mb-8 px-4">
              Belum ada produk kreatif di keranjang Anda. Yuk, jelajahi koleksi
              produk ramah lingkungan kami!
            </p>

            <a
              href="/product"
              className="inline-flex bg-[#1F3A2B] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#1F3A2B]/90 transition-colors items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              Mulai Berbelanja
            </a>
          </div>

          {/* --- RECOMMENDATION SECTION (Using Related Logic from Old Page) --- */}
          <div className="mt-16">
            <h2
              className={`text-2xl font-bold text-gray-900 mb-6 ${fredoka.className}`}
            >
              Produk Rekomendasi
            </h2>
            {isRelLoading && (
              <div className="text-[#1F3A2B] w-full flex items-center justify-center min-h-96">
                <DotdLoader />
              </div>
            )}
            {!isRelLoading && !isRelError && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-[#1F3A2B]/5"
                  >
                    <div className="relative h-48">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-[#1F3A2B] mt-1 mb-3 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            addItem({ ...product.__raw, quantity: 1 }, 0)
                          }
                          className="w-full bg-[#1F3A2B] text-white py-3 rounded-2xl font-semibold hover:bg-[#1F3A2B]/90 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Tambah
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN CONTENT ---
  return (
    <div
      className={`min-h-screen bg-[#FDFBF7] text-[#1F3A2B] pt-24 ${sniglet.className}`}
    >
      {/* Header Simple for Cart */}
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

      <div className="container mx-auto px-6 lg:px-12 py-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#1F3A2B]/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#1F3A2B]" />
            <span className="text-sm font-medium text-[#1F3A2B]">
              Keranjang Belanja
            </span>
          </div>
          <h1
            className={`text-4xl lg:text-5xl font-bold text-gray-900 mb-4 ${fredoka.className}`}
          >
            Produk <span className="text-[#1F3A2B]">Pilihan Anda</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* --- LEFT COLUMN: ITEMS & FORMS (Span 7) --- */}
          <div className="lg:col-span-7 space-y-10">
            {/* 1. List Barang (Editable) */}
            <div className="space-y-6">
              {groupedCartItems.map((group) => {
                const { common, items } = group;
                return (
                  <div
                    key={`group-${common.id}`}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-[#1F3A2B]/10 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="relative w-full sm:w-28 h-36 sm:h-28 flex-shrink-0 self-start">
                        <Image
                          src={getImageUrlFromProduct(common)}
                          alt={common.name}
                          fill
                          className="object-cover rounded-2xl"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="mb-4 border-b border-[#1F3A2B]/10 pb-2">
                          <span className="text-sm text-[#1F3A2B]/60 font-medium">
                            {common.category_name}
                          </span>
                          <h3 className="text-lg font-bold text-[#1F3A2B] mt-1">
                            {common.name}
                          </h3>
                        </div>

                        {/* List Variants Editable */}
                        <div className="space-y-4">
                          {items.map((item) => {
                            const currentStock =
                              typeof item.stock === "number" ? item.stock : 0;
                            const inStock = currentStock > 0;

                            return (
                              <div
                                key={item.cartId}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#FDFBF7] p-3 rounded-xl border border-[#1F3A2B]/10"
                              >
                                {/* Info Varian */}
                                <div className="flex-1">
                                  <div className="flex flex-wrap gap-2 mb-1">
                                    {item.variant_name && (
                                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-[#1F3A2B]/10 text-xs font-medium text-[#1F3A2B] shadow-sm">
                                        <Layers className="w-3 h-3 text-[#1F3A2B]/60" />
                                        <span>{item.variant_name}</span>
                                      </div>
                                    )}
                                    {item.size_name && (
                                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-[#1F3A2B]/10 text-xs font-medium text-[#1F3A2B] shadow-sm">
                                        <Maximize2 className="w-3 h-3 text-[#1F3A2B]/60" />
                                        <span>{item.size_name}</span>
                                      </div>
                                    )}
                                    {!item.variant_name && !item.size_name && (
                                      <span className="text-xs text-gray-400 italic">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-base font-bold text-[#1F3A2B]">
                                    Rp{" "}
                                    {(item.price * 1).toLocaleString("id-ID")}
                                  </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-3 justify-between sm:justify-end w-full sm:w-auto">
                                  <div className="flex items-center bg-white border border-[#1F3A2B]/20 rounded-xl shadow-sm">
                                    <button
                                      onClick={() =>
                                        decreaseItemQuantity(item.cartId)
                                      }
                                      disabled={!inStock}
                                      className="p-1.5 hover:bg-[#1F3A2B]/5 rounded-l-xl transition-colors disabled:opacity-50 text-[#1F3A2B]"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                      type="number"
                                      value={item.quantity}
                                      readOnly
                                      className="w-10 px-1 py-1 text-center bg-transparent text-sm focus:outline-none disabled:opacity-50 pointer-events-none text-[#1F3A2B] font-medium"
                                    />
                                    <button
                                      onClick={() =>
                                        increaseItemQuantity(item.cartId)
                                      }
                                      disabled={!inStock}
                                      className="p-1.5 hover:bg-[#1F3A2B]/5 rounded-r-xl transition-colors disabled:opacity-50 text-[#1F3A2B]"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="text-right min-w-[80px]">
                                    <div className="font-bold text-[#1F3A2B] text-sm">
                                      Rp{" "}
                                      {(
                                        item.price * item.quantity
                                      ).toLocaleString("id-ID")}
                                    </div>
                                    {!inStock && (
                                      <div className="text-[10px] text-red-500 font-medium">
                                        Stok Habis
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => removeItem(item.cartId)}
                                    className="p-2 text-[#1F3A2B]/40 hover:text-red-500 transition-colors bg-white rounded-full shadow-sm hover:shadow-md border border-transparent hover:border-red-100"
                                    title="Hapus varian ini"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Informasi Kontak & Pengiriman */}
            <section>
              <h2
                className={`text-xl font-bold mb-6 flex items-center gap-2 ${fredoka.className}`}
              >
                Informasi Pengiriman
              </h2>

              {hasDefaultAddress && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      Alamat terisi otomatis dari data default.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-8 border border-[#1F3A2B]/10 rounded-2xl bg-white space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      className={`w-full bg-transparent border-b border-[#1F3A2B]/20 py-2 text-lg focus:outline-none focus:border-[#1F3A2B] transition-colors placeholder:text-[#1F3A2B]/30 ${
                        hasDefaultAddress ? "cursor-not-allowed opacity-60" : ""
                      }`}
                      placeholder="Nama Anda"
                      value={shippingInfo.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      disabled={hasDefaultAddress}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      className={`w-full bg-transparent border-b border-[#1F3A2B]/20 py-2 text-lg focus:outline-none focus:border-[#1F3A2B] transition-colors placeholder:text-[#1F3A2B]/30 ${
                        hasDefaultAddress ? "cursor-not-allowed opacity-60" : ""
                      }`}
                      placeholder="08xxxxxxxx"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      disabled={hasDefaultAddress}
                    />
                    {!isPhoneValid && shippingInfo.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        Nomor tidak valid
                      </p>
                    )}
                  </div>
                </div>

                {!isLoggedIn && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full bg-transparent border-b border-[#1F3A2B]/20 py-2 text-lg focus:outline-none focus:border-[#1F3A2B] transition-colors placeholder:text-[#1F3A2B]/30"
                      placeholder="email@anda.com"
                      value={shippingInfo.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                    {!isEmailValid && shippingInfo.email && (
                      <p className="text-xs text-red-500 mt-1">
                        Email tidak valid
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Provinsi
                    </label>
                    <Combobox
                      data={provinces}
                      value={shippingInfo.rajaongkir_province_id || null}
                      onChange={(id) => {
                        setShippingInfo((prev) => ({
                          ...prev,
                          rajaongkir_province_id: id,
                          rajaongkir_city_id: 0,
                          rajaongkir_district_id: 0,
                        }));
                        setShippingMethod(null);
                      }}
                      getOptionLabel={(i: RegionData) => i.name}
                      isLoading={loadingProvince}
                      placeholder="Pilih Provinsi"
                      disabled={hasDefaultAddress}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Kota/Kabupaten
                    </label>
                    <Combobox
                      data={cities}
                      value={shippingInfo.rajaongkir_city_id || null}
                      onChange={(id) => {
                        setShippingInfo((prev) => ({
                          ...prev,
                          rajaongkir_city_id: id,
                          rajaongkir_district_id: 0,
                        }));
                        setShippingMethod(null);
                      }}
                      getOptionLabel={(i: RegionData) => i.name}
                      isLoading={loadingCity}
                      placeholder="Pilih Kota"
                      disabled={
                        hasDefaultAddress ||
                        !shippingInfo.rajaongkir_province_id
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Kecamatan
                    </label>
                    <Combobox
                      data={districts}
                      value={shippingInfo.rajaongkir_district_id || null}
                      onChange={(id) => {
                        setShippingInfo((prev) => ({
                          ...prev,
                          rajaongkir_district_id: id,
                        }));
                        setShippingMethod(null);
                      }}
                      getOptionLabel={(i: RegionData) => i.name}
                      isLoading={loadingDistrict}
                      placeholder="Pilih Kecamatan"
                      disabled={
                        hasDefaultAddress || !shippingInfo.rajaongkir_city_id
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      className="w-full border border-[#1F3A2B]/20 rounded-md px-3 py-2 focus:outline-none focus:border-[#1F3A2B] bg-[#FDFBF7] transition-colors"
                      placeholder="12345"
                      value={shippingInfo.postal_code}
                      onChange={(e) =>
                        handleInputChange("postal_code", e.target.value)
                      }
                      disabled={hasDefaultAddress}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                    Detail Alamat (Jalan, RT/RW, No. Rumah)
                  </label>
                  <textarea
                    className="w-full border border-[#1F3A2B]/20 rounded-md px-3 py-2 focus:outline-none focus:border-[#1F3A2B] bg-[#FDFBF7] transition-colors"
                    rows={2}
                    placeholder="Nama jalan, gedung, nomor rumah..."
                    value={shippingInfo.address_line_1}
                    onChange={(e) =>
                      handleInputChange("address_line_1", e.target.value)
                    }
                    disabled={hasDefaultAddress}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1F3A2B]/60">
                    Detail Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#1F3A2B]/20 rounded-md px-3 py-2 focus:outline-none focus:border-[#1F3A2B] bg-[#FDFBF7] transition-colors"
                    placeholder="Blok, Patokan, dll"
                    value={shippingInfo.address_line_2}
                    onChange={(e) =>
                      handleInputChange("address_line_2", e.target.value)
                    }
                    disabled={hasDefaultAddress}
                  />
                </div>
              </div>
            </section>

            {/* 3. Metode Pengiriman */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2
                  className={`text-xl font-bold ${fredoka.className} flex items-center gap-2`}
                >
                  Metode Pengiriman
                </h2>
                <div className="w-48">
                  <Select
                    value={shippingCourier ?? ""}
                    onValueChange={(val) => {
                      setShippingCourier(val);
                      setShippingMethod(null);
                      if (val === "international" && paymentType === "cod") {
                        setPaymentType("automatic");
                      }
                    }}
                    disabled={!shippingInfo.rajaongkir_district_id}
                  >
                    <SelectTrigger className="h-9 w-full text-sm bg-white border-[#1F3A2B]/20">
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

              <div className="bg-white border border-[#1F3A2B]/10 rounded-xl overflow-hidden shadow-sm">
                {isShippingLoading ? (
                  <div className="p-8 flex justify-center text-[#1F3A2B]">
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
                            <span className="font-bold flex items-center gap-2 text-[#1F3A2B]">
                              <Truck size={16} /> {opt.service}
                            </span>
                            <span className="font-bold">
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

            {/* 4. Metode Pembayaran */}
            <section>
              <h2
                className={`text-xl font-bold mb-6 ${fredoka.className} flex items-center gap-2`}
              >
                Metode Pembayaran
              </h2>
              <div className="bg-white border border-[#1F3A2B]/10 rounded-xl overflow-hidden shadow-sm divide-y divide-[#1F3A2B]/5">
                {/* Option: Automatic */}
                <label className="flex items-center p-4 cursor-pointer hover:bg-[#1F3A2B]/5 transition">
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
                <label className="flex items-center p-4 cursor-pointer hover:bg-[#1F3A2B]/5 transition">
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
                  onClick={onCheckoutClick}
                  disabled={
                    isCheckingOut ||
                    isSubmitting ||
                    cartItems.some((it) => {
                      const stock = typeof it.stock === "number" ? it.stock : 0;
                      return stock <= 0;
                    }) ||
                    !shippingMethod ||
                    !shippingInfo.fullName ||
                    !shippingInfo.address_line_1 ||
                    !shippingInfo.postal_code ||
                    !isPhoneValid ||
                    !paymentType ||
                    (!isLoggedIn && !isEmailValid)
                  }
                  className="w-full bg-[#DFF19D] text-[#1F3A2B] py-4 rounded-xl font-bold hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 group"
                >
                  {isCheckingOut || isSubmitting ? (
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

                {(!paymentType ||
                  !shippingMethod ||
                  !shippingInfo.fullName ||
                  !shippingInfo.address_line_1) && (
                  <div className="mt-4 text-center">
                    <p className="text-[#DFF19D] text-xs">
                      * Harap lengkapi semua informasi yang diperlukan
                    </p>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-white/40 font-bold">
                  <ShieldCheck className="w-3 h-3" /> Transaksi Aman &
                  Terenkripsi
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM SECTION: RELATED PRODUCTS --- */}
        <div className="mt-20 border-t border-[#1F3A2B]/10 pt-12">
          <h2
            className={`text-2xl font-bold text-gray-900 mb-8 text-center ${fredoka.className}`}
          >
            Lengkapi Koleksi Anda
          </h2>
          {isRelLoading && (
            <div className="text-[#1F3A2B] w-full flex items-center justify-center min-h-64">
              <DotdLoader />
            </div>
          )}
          {!isRelLoading && !isRelError && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border border-[#1F3A2B]/5"
                >
                  <div className="relative h-48">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-[#1F3A2B] text-[#1F3A2B]" />
                      <span className="text-xs font-medium text-gray-600">
                        {product.rating > 0 ? product.rating.toFixed(1) : "New"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1F3A2B] mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-[#1F3A2B]/60 text-sm mb-4">
                      {product.category}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1F3A2B]">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                      <button
                        onClick={() =>
                          addItem({ ...product.__raw, quantity: 1 }, 0)
                        }
                        className="bg-[#1F3A2B] text-white p-2 rounded-xl hover:bg-[#1F3A2B]/90 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <VariantPickerModal
          open={variantModalOpen}
          product={variantProduct}
          onClose={() => setVariantModalOpen(false)}
          onAdded={() => {
            // Cart auto updates via hook
          }}
        />
      </div>
    </div>
  );
}