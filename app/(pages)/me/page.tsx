"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  MapPin,
  Package,
  BarChart3,
  LogOut,
  Edit3,
  Plus,
  Trash2,
  Eye,
  Star,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  Camera,
  CreditCard,
  Truck,
  Download,
  Upload,
  X,
  FileText,
  Award,
  LayoutDashboard,
  Leaf,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
} from "@/services/auth.service";
import {
  useGetUserAddressListQuery,
  useGetUserAddressByIdQuery,
  useCreateUserAddressMutation,
  useUpdateUserAddressMutation,
  useDeleteUserAddressMutation,
} from "@/services/address.service";
import {
  useGetProvincesQuery,
  useGetCitiesQuery,
  useGetDistrictsQuery,
} from "@/services/shop/open-shop/open-shop.service";
import {
  useGetTransactionListQuery,
  useGetTransactionByIdQuery,
  useGetTransactionShopByIdQuery,
} from "@/services/admin/transaction.service";
import Swal from "sweetalert2";
import { mapTxnStatusToOrderStatus, OrderStatus } from "@/lib/status-order";
import type { Address as UserAddress } from "@/types/address";
import { ROResponse, toList, findName } from "@/types/geo";
import { Region } from "@/types/shop";
import ProfileEditModal from "@/components/main/profile-page/edit-modal";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ShopDetailItem } from "@/types/admin/transaction";
import { formatRupiahWithRp } from "@/lib/format-utils";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  image: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
}

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  total: number;
  grand_total: number;
  items: OrderItem[];
  trackingNumber?: string;
  payment_method?: string;
  payment_proof?: string;
  shipment_cost?: number;
  cod?: number;
  discount_total?: number;
  address_line_1?: string;
  postal_code?: string;
}
interface ApiTransactionDetail {
  id?: number | string;
  product_id?: number;
  quantity?: number;
  price?: number;
  product_name?: string;
  product?: {
    name?: string;
    image?: string;
    media?: Array<{ original_url: string }>;
  } | null;
  image?: string | null;
}
interface ApiTransaction {
  id: number | string;
  reference?: string;
  status?: number;
  total: number;
  grand_total: number;
  discount_total?: number;
  created_at?: string;
  details?: ApiTransactionDetail[];
  tracking_number?: string;
  payment_method?: string;
  payment_proof?: string;
  shipment_cost?: number;
  cod?: number;
  address_line_1?: string;
  postal_code?: string;
}

// Add mutation hook for uploading payment proof
const useUploadPaymentProofMutation = () => {
  const [isLoading, setIsLoading] = useState(false);

  const uploadPaymentProof = async (transactionId: string, file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("payment_proof", file);
      formData.append("_method", "PUT");

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const token = (session?.user as { token?: string })?.token;
      const response = await fetch(
        `${baseUrl}/public/transaction/${transactionId}/manual?_method=PUT`,
        {
          method: "POST",
          body: formData,
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload payment proof");
      }

      const data = await response.json();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadPaymentProof, isLoading };
};

const pickImageUrl = (d?: ApiTransactionDetail): string => {
  if (!d) return "/api/placeholder/80/80";
  if (typeof d.image === "string" && d.image) return d.image;
  const prod = d.product;
  if (prod?.image) return prod.image;
  const firstMedia = prod?.media?.[0]?.original_url;
  if (firstMedia) return firstMedia;
  return "/api/placeholder/80/80";
};

// Helper function to get product image from shop details
const getProductImageFromShopDetails = (
  product:
    | {
        image?: string;
        image_2?: string;
        image_3?: string;
        image_4?: string;
        image_5?: string;
        image_6?: string;
        image_7?: string;
        media?: Array<{ original_url?: string }>;
      }
    | null
    | undefined
): string => {
  if (!product) return "/api/placeholder/80/80";

  // Try direct image field first
  if (product.image) return product.image;

  // Try image_2, image_3, etc.
  if (product.image_2) return product.image_2;
  if (product.image_3) return product.image_3;
  if (product.image_4) return product.image_4;
  if (product.image_5) return product.image_5;
  if (product.image_6) return product.image_6;
  if (product.image_7) return product.image_7;

  // Try media array
  if (product.media && product.media.length > 0) {
    const firstMedia = product.media[0]?.original_url;
    if (firstMedia) return firstMedia;
  }

  return "/api/placeholder/80/80";
};

/* ======================================================================= */

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [logoutReq, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [updateCurrentUser, { isLoading: isUpdatingProfile }] =
    useUpdateCurrentUserMutation();
  const [isPrefillingProfile, setIsPrefillingProfile] = useState(false);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    imageFile: File | null;
  }>({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    imageFile: null,
  });

  // Order detail modal states
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderShopId, setSelectedOrderShopId] = useState<number | null>(
    null
  );
  const [paymentProofModalOpen, setPaymentProofModalOpen] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "profile" | "addresses" | "orders"
  >("dashboard");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEditing, setIsEditing] = useState(false);

  // Session basics
  const sessionName = useMemo(() => session?.user?.name ?? "User", [session]);
  const sessionEmail = useMemo(
    () => session?.user?.email ?? "user@email.com",
    [session]
  );
  const sessionId = (session?.user as { id?: number } | undefined)?.id;

  // Payment proof upload mutation
  const { uploadPaymentProof, isLoading: isUploadingProof } =
    useUploadPaymentProofMutation();

  /* --------------------- Transaksi (tetap) --------------------- */
  const { data: txnResp, refetch: refetchTransactions } =
    useGetTransactionListQuery(
      { page: 1, paginate: 10, user_id: sessionId },
      { skip: !sessionId }
    );

  const transactions: ApiTransaction[] = useMemo(
    () => (txnResp?.data as ApiTransaction[]) || [],
    [txnResp]
  );

  const orders: Order[] = useMemo(() => {
    return transactions.map((t) => {
      const items: OrderItem[] = (t.details || []).map((det, idx) => ({
        id: String(det.id ?? `${t.id}-${idx}`),
        name: det.product?.name ?? det.product_name ?? "Produk",
        image: pickImageUrl(det),
        quantity: det.quantity ?? 1,
        price: det.price ?? 0,
      }));
      return {
        id: String(t.id),
        orderNumber: t.reference || `REF-${String(t.id)}`,
        date: t.created_at || new Date().toISOString(),
        status: mapTxnStatusToOrderStatus(t.status),
        total: t.total ?? 0,
        grand_total: t.grand_total ?? 0,
        items,
        trackingNumber: (t as { tracking_number?: string }).tracking_number,
        payment_method: t.payment_method,
        payment_proof: t.payment_proof,
        shipment_cost: t.shipment_cost,
        cod: t.cod,
        discount_total: t.discount_total,
        address_line_1: t.address_line_1,
        postal_code: t.postal_code,
      };
    });
  }, [transactions]);

  // Get order detail query
  const { data: orderDetailResp } = useGetTransactionByIdQuery(
    selectedOrderId ?? "",
    { skip: !selectedOrderId }
  );

  // Get shop details with receipt code
  const { data: shopDetailResp, isLoading: isLoadingReceiptCode } =
    useGetTransactionShopByIdQuery(selectedOrderShopId ?? 0, {
      skip: !selectedOrderShopId,
    });

  // true kalau ada SATU produk bermerek "jasa"
  const isJasaOrder = useMemo(() => {
    const details: ReadonlyArray<ShopDetailItem> =
      (shopDetailResp?.details as ReadonlyArray<ShopDetailItem> | undefined) ??
      [];

    return details.some((d) => {
      const p = d.product;
      if (!p) return false;
      const merk =
        p.product_merk?.name ?? p.merk_name ?? p.product_merk_name ?? "";
      return merk.toLowerCase() === "jasa";
    });
  }, [shopDetailResp]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find((order) => order.id === selectedOrderId) || null;
  }, [selectedOrderId, orders]);

  // Set shop ID when transaction details are loaded
  useEffect(() => {
    if (
      orderDetailResp &&
      orderDetailResp.stores &&
      orderDetailResp.stores.length > 0
    ) {
      setSelectedOrderShopId(orderDetailResp.stores[0].id);
    }
  }, [orderDetailResp]);

  /* --------------------- Address via SERVICE --------------------- */
  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [addrEditId, setAddrEditId] = useState<number | null>(null);

  type AddrForm = Partial<Omit<UserAddress, "id">>;
  const [addrForm, setAddrForm] = useState<AddrForm>({
    user_id: sessionId || undefined,
    rajaongkir_province_id: null,
    rajaongkir_city_id: null,
    rajaongkir_district_id: null,
    address_line_1: "",
    address_line_2: "",
    postal_code: "",
    is_default: false,
  });

  const [createUserAddress, { isLoading: isCreatingAddr }] =
    useCreateUserAddressMutation();
  const [updateUserAddress, { isLoading: isUpdatingAddr }] =
    useUpdateUserAddressMutation();
  const [deleteUserAddress, { isLoading: isDeletingAddr }] =
    useDeleteUserAddressMutation();

  const {
    data: userAddressList,
    refetch: refetchUserAddressList,
    isFetching: isFetchingAddressList,
  } = useGetUserAddressListQuery(
    { page: 1, paginate: 100 },
    { skip: !sessionId }
  );

  const { data: addrDetail } = useGetUserAddressByIdQuery(addrEditId ?? 0, {
    skip: !addrEditId,
  });

  // RO hooks – pakai 0 saat skip agar param number tetap valid
  const provinceId = addrForm.rajaongkir_province_id ?? 0;
  const { data: provinces } = useGetProvincesQuery();
  const { data: cities } = useGetCitiesQuery(provinceId, {
    skip: !addrForm.rajaongkir_province_id,
  });
  const cityId = addrForm.rajaongkir_city_id ?? 0;
  const { data: districts } = useGetDistrictsQuery(cityId, {
    skip: !addrForm.rajaongkir_city_id,
  });

  // Normalisasi RO lists (tanpa any)
  const provinceList = toList<Region>(provinces as ROResponse<Region>);
  const cityList = toList<Region>(cities as ROResponse<Region>);
  const districtList = toList<Region>(districts as ROResponse<Region>);

  // Prefill form saat edit
  useEffect(() => {
    if (!addrDetail) return;
    setAddrForm({
      user_id: sessionId || undefined,
      rajaongkir_province_id: addrDetail.rajaongkir_province_id ?? null,
      rajaongkir_city_id: addrDetail.rajaongkir_city_id ?? null,
      rajaongkir_district_id: addrDetail.rajaongkir_district_id ?? null,
      address_line_1: addrDetail.address_line_1 ?? "",
      address_line_2: addrDetail.address_line_2 ?? "",
      postal_code: addrDetail.postal_code ?? "",
      is_default: Boolean(addrDetail.is_default),
    });
  }, [addrDetail, sessionId]);

  const openCreateAddress = () => {
    setAddrEditId(null);
    setAddrForm({
      user_id: sessionId || undefined,
      rajaongkir_province_id: null,
      rajaongkir_city_id: null,
      rajaongkir_district_id: null,
      address_line_1: "",
      address_line_2: "",
      postal_code: "",
      is_default: false,
    });
    setAddrModalOpen(true);
  };

  const openEditAddress = (id: number) => {
    setAddrEditId(id);
    setAddrModalOpen(true);
  };

  // Ambil alamat dari DETAIL kalau ada; kalau tidak, pakai dari list
  const addressLine1 =
    (orderDetailResp as { address_line_1?: string } | undefined)
      ?.address_line_1 ??
    selectedOrder?.address_line_1 ??
    "-";

  const postalCode =
    (orderDetailResp as { postal_code?: string } | undefined)?.postal_code ??
    selectedOrder?.postal_code ??
    "";

  const handleDeleteAddressApi = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus alamat ini?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          await deleteUserAddress(id).unwrap();
          await refetchUserAddressList();
        } catch (e) {
          console.error(e);
          Swal.showValidationMessage("Gagal menghapus alamat.");
          throw e;
        }
      },
    });

    if (result.isConfirmed) {
      await Swal.fire("Terhapus!", "Alamat berhasil dihapus.", "success");
    }
  };

  const handleSubmitAddress = async () => {
    if (!addrForm.user_id) {
      Swal.fire("Info", "Session user belum tersedia.", "info");
      return;
    }
    try {
      if (addrEditId) {
        await updateUserAddress({ id: addrEditId, payload: addrForm }).unwrap();
      } else {
        await createUserAddress(addrForm).unwrap();
      }
      setAddrModalOpen(false);
      setAddrEditId(null);
      await refetchUserAddressList();
    } catch (e) {
      console.error(e);
      Swal.fire("Gagal", "Tidak dapat menyimpan alamat.", "error");
    }
  };

  // Handle order detail modal
  const openOrderDetailModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setOrderDetailModalOpen(true);
    // We'll set the shop ID after we get the transaction details
  };

  const closeOrderDetailModal = () => {
    setOrderDetailModalOpen(false);
    setSelectedOrderId(null);
    setSelectedOrderShopId(null);
  };

  // Handle payment proof upload
  const openPaymentProofModal = () => {
    setPaymentProofModalOpen(true);
  };

  const closePaymentProofModal = () => {
    setPaymentProofModalOpen(false);
    setPaymentProofFile(null);
  };

  const handlePaymentProofUpload = async () => {
    if (!paymentProofFile || !selectedOrderId) {
      Swal.fire("Error", "Silakan pilih file bukti pembayaran", "error");
      return;
    }

    try {
      await uploadPaymentProof(selectedOrderId, paymentProofFile);
      await Swal.fire(
        "Berhasil",
        "Bukti pembayaran berhasil diupload",
        "success"
      );
      closePaymentProofModal();
      closeOrderDetailModal();
      await refetchTransactions();
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", "Gagal mengupload bukti pembayaran", "error");
    }
  };

  /* --------------------- Profil/dsb (tetap) --------------------- */
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id:
      (session?.user as { id?: number } | undefined)?.id?.toString?.() ??
      "user-id",
    fullName: sessionName,
    email: sessionEmail,
    phone: "",
    birthDate: "1990-05-15", // default birth date
    image: session?.user?.image || "/api/placeholder/150/150",
    joinDate: "",
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
  });

  useEffect(() => {
    setUserProfile((prev) => ({
      ...prev,
      id:
        (session?.user as { id?: number } | undefined)?.id?.toString?.() ??
        prev.id,
      fullName: sessionName,
      email: sessionEmail,
      image: session?.user?.image || prev.image,
    }));
  }, [sessionName, sessionEmail, session]);

  useEffect(() => {
    if (!transactions.length) return;
    const totalOrders = transactions.length;
    const totalSpent = transactions.reduce((acc, t) => acc + (t.total ?? 0), 0);
    setUserProfile((prev) => ({ ...prev, totalOrders, totalSpent }));
  }, [transactions]);

  const { data: currentUserResp, refetch: refetchCurrentUser } =
    useGetCurrentUserQuery();

  useEffect(() => {
    const u = currentUserResp;
    if (!u) return;

    const apiImage =
      (u as { image?: string }).image ||
      (u as { media?: Array<{ original_url?: string }> }).media?.[0]
        ?.original_url ||
      "";

    setUserProfile((prev) => ({
      ...prev,
      id: String(u.id ?? prev.id),
      fullName: u.name ?? prev.fullName,
      email: u.email ?? prev.email,
      phone: u.phone ?? prev.phone,
      joinDate: u.created_at ?? prev.joinDate,
      image: apiImage || prev.image,
      loyaltyPoints: u.points ?? prev.loyaltyPoints,
    }));
  }, [currentUserResp]);

  const isSuperAdmin = useMemo(() => {
    const u = currentUserResp;
    const roles = u?.roles ?? [];
    return roles.some((r: { name: string }) => r.name === "superadmin");
  }, [currentUserResp]);

  const tabs = useMemo(() => {
    const base = [
      {
        id: "dashboard" as const,
        label: "Dashboard",
        icon: <BarChart3 className="w-5 h-5" />,
      },
      { id: "profile" as const, label: "Profil", icon: <UserIcon className="w-5 h-5" /> },
      { id: "addresses" as const, label: "Alamat", icon: <MapPin className="w-5 h-5" /> },
      { id: "orders" as const, label: "Pesanan", icon: <Package className="w-5 h-5" /> },
    ];
    if (isSuperAdmin) {
      return [
        ...base,
        {
          id: "admin" as const,
          label: "Dashboard Admin",
          icon: <LayoutDashboard className="w-5 h-5" />,
          href: "/admin/dashboard",
        },
      ];
    }
    return base;
  }, [isSuperAdmin]);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50";
      case "shipped":
        return "text-blue-600 bg-blue-50";
      case "processing":
        return "text-yellow-600 bg-yellow-50";
      case "pending":
        return "text-orange-600 bg-orange-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };
  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "Diterima";
      case "shipped":
        return "Dikirim";
      case "processing":
        return "Diproses";
      case "pending":
        return "Menunggu";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const openEditProfileModal = async () => {
    setIsPrefillingProfile(true);
    try {
      const result = await refetchCurrentUser();
      const u = result.data ?? currentUserResp;

      setProfileForm({
        name: u?.name ?? userProfile.fullName ?? "",
        email: u?.email ?? userProfile.email ?? "",
        phone: u?.phone ?? userProfile.phone ?? "",
        password: "",
        password_confirmation: "",
        imageFile: null,
      });

      setProfileModalOpen(true);
    } finally {
      setIsPrefillingProfile(false);
    }
  };

  const handleSubmitProfile = async () => {
    try {
      const fd = new FormData();
      // wajib/umum
      fd.append("name", profileForm.name ?? "");
      fd.append("email", profileForm.email ?? "");
      fd.append("phone", profileForm.phone ?? "");
      // password opsional (hanya kirim jika diisi)
      if (profileForm.password) {
        fd.append("password", profileForm.password);
        fd.append(
          "password_confirmation",
          profileForm.password_confirmation || ""
        );
      }
      // image opsional
      if (profileForm.imageFile) {
        fd.append("image", profileForm.imageFile);
      }

      await updateCurrentUser(fd).unwrap();
      await refetchCurrentUser();

      // sinkronkan tampilan lokal
      setUserProfile((prev) => ({
        ...prev,
        fullName: profileForm.name || prev.fullName,
        email: profileForm.email || prev.email,
        phone: profileForm.phone || prev.phone,
        // avatar akan ikut dari current user ketika di-SSR/CSR fetch; di sini cukup refetch
      }));

      setProfileModalOpen(false);
      await Swal.fire("Berhasil", "Profil berhasil diperbarui.", "success");
    } catch (err: unknown) {
      const e = err as FetchBaseQueryError;
      const data = e.data as { message?: string } | undefined;
      const msg = data?.message || "Terjadi kesalahan saat menyimpan profil.";
      Swal.fire("Gagal", msg, "error");
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await logoutReq().unwrap();
      await Swal.fire("Berhasil!", "Anda telah keluar.", "success");
    } catch (e) {
      console.error("Logout API error:", e);
      await Swal.fire("Gagal!", "Terjadi kesalahan saat logout.", "error");
    } finally {
      await signOut({ callbackUrl: "/login" });
    }
  };

  const DEFAULT_AVATAR =
    "https://8nc5ppykod.ufs.sh/f/H265ZJJzf6brRRAfCOa62KGLnZzEJ8j0tpdrMSvRcPXiYUsh";

  const normalizeUrl = (u?: string) => {
    if (!u) return "";
    try {
      // encode karakter spesial, tapi tetap pertahankan slash
      return encodeURI(u);
    } catch {
      return u;
    }
  };
  // Avatar source dengan fallback otomatis
  const rawAvatar = (userProfile.image ?? "").trim();
  const wantedAvatar = normalizeUrl(rawAvatar);

  // pegang src di state supaya bisa diganti saat onError
  const [imgSrc, setImgSrc] = useState<string>(
    wantedAvatar ? wantedAvatar : DEFAULT_AVATAR
  );

  // update kalau userProfile.image berubah
  useEffect(() => {
    setImgSrc(wantedAvatar ? wantedAvatar : DEFAULT_AVATAR);
  }, [wantedAvatar]);

  /* --------------------- UI --------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 pt-6 sm:pt-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 pb-12">
        {/* Header */}
        <div className="mb-6 sm:mb-10 border-b border-green-100 pb-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Akun Saya
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Selamat Datang,{" "}
              <span className="text-green-600">
                {userProfile.fullName.split(" ")[0]}
              </span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Kelola profil, alamat, dan lacak pesanan Anda.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar - Mobile: full width, Desktop: sticky */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 sticky top-24">
              <div className="text-center mb-6 pb-6 border-b border-green-100">
                <div className="relative w-24 h-24 mx-auto mb-4 border-4 border-green-200 rounded-full overflow-hidden ring-4 ring-green-50">
                  <Image
                    src={imgSrc}
                    alt={userProfile.fullName || "Avatar"}
                    fill
                    className="object-cover rounded-full"
                    onError={() => setImgSrc(DEFAULT_AVATAR)}
                    unoptimized
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors shadow-lg"
                    onClick={openEditProfileModal}
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {userProfile.fullName}
                </h3>
                <p className="text-sm text-gray-600 truncate max-w-full px-2">{userProfile.email}</p>
              </div>

              <nav className="space-y-2 mb-6">
                {tabs.map((tab) => {
                  const isAdminTab = "href" in tab && tab.href;
                  if (isAdminTab) {
                    return (
                      <button
                        key="admin"
                        onClick={() => router.push("/admin/dashboard")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-sm bg-green-100 text-green-700 hover:bg-green-600 hover:text-white border border-green-200"
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    );
                  }
                  return (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(
                          tab.id as "dashboard" | "profile" | "addresses" | "orders"
                        )
                      }
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-sm ${
                        activeTab === tab.id
                          ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                          : "text-gray-700 hover:bg-green-50 hover:text-green-700 border border-transparent hover:border-green-200"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 border border-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                title={isLoggingOut ? "Keluar..." : "Keluar"}
              >
                <LogOut className="w-5 h-5" />
                {isLoggingOut ? "Keluar..." : "Keluar"}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-green-100">
              {/* --- 1. Dashboard --- */}
              {activeTab === "dashboard" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6 border-b border-green-100 pb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Ringkasan Dashboard
                    </h2>
                  </div>

                  {/* Stat Cards - Green theme */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg shadow-green-500/30">
                      <div className="flex items-center gap-3 mb-3">
                        <Package className="w-6 h-6 text-green-100" />
                        <span className="font-semibold text-sm text-green-100">
                          Total Pesanan
                        </span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold">
                        {userProfile.totalOrders}
                      </div>
                      <div className="text-green-100 text-xs mt-1">
                        Sejak bergabung
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <CreditCard className="w-6 h-6 text-green-600" />
                        <span className="font-semibold text-sm text-gray-700">
                          Total Belanja
                        </span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(userProfile.totalSpent)}
                      </div>
                      <div className="text-gray-600 text-xs mt-1">
                        Nilai total
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Award className="w-6 h-6 text-green-600" />
                        <span className="font-semibold text-sm text-gray-700">
                          Poin Loyalitas
                        </span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-green-600">
                        {userProfile.loyaltyPoints}
                      </div>
                      <div className="text-gray-600 text-xs mt-1">
                        Tukar diskon
                      </div>
                    </div>
                  </div>

                  {/* Latest Orders */}
                  <div>
                    <div className="flex items-center justify-between mb-6 border-b border-green-100 pb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        Pesanan Terbaru
                      </h3>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-green-600 font-semibold hover:text-green-700 hover:underline text-sm"
                      >
                        Lihat Semua
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(orders || []).slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="border border-green-100 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer bg-gray-50/50"
                          onClick={() => openOrderDetailModal(order.id)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div>
                              <h4 className="font-bold text-gray-900">
                                #{order.orderNumber}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {new Date(order.date).toLocaleDateString(
                                  "id-ID",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <div className="font-bold text-lg text-green-600">
                                {formatRupiahWithRp(order.grand_total)}
                              </div>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusText(order.status)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {order.items.slice(0, 3).map((item, index) => (
                              <div
                                key={`${order.id}-${item.id}-${index}`}
                                className="w-10 h-10 relative rounded-lg overflow-hidden border border-green-100"
                              >
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-sm text-gray-500">
                                +{order.items.length - 3} lainnya
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --- 2. Profile --- */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-green-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Informasi Akun
                      </h2>
                    </div>
                    <button
                      onClick={openEditProfileModal}
                      disabled={isPrefillingProfile}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 text-sm shadow-lg shadow-green-500/30"
                    >
                      <Edit3 className="w-4 h-4" />
                      {isPrefillingProfile ? "Memuat..." : "Edit Profil"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                          Nama Lengkap
                        </label>
                        <p className="font-medium text-lg text-gray-900">
                          {userProfile.fullName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                          Email
                        </label>
                        <p className="font-medium text-lg text-gray-900">
                          {userProfile.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                          Nomor Telepon
                        </label>
                        <p className="font-medium text-lg text-gray-900">
                          {userProfile.phone || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                          Tanggal Lahir
                        </label>
                        <p className="font-medium text-lg text-gray-900">
                          {userProfile.birthDate || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                    <h3 className="font-bold text-gray-900 mb-4">
                      Status Akun
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Member sejak:</span>
                        <div className="font-semibold text-gray-900">
                          {userProfile.joinDate
                            ? new Date(userProfile.joinDate).toLocaleDateString(
                                "id-ID",
                                { year: "numeric", month: "long", day: "numeric" }
                              )
                            : "-"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-900">
                            Terverifikasi
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- 3. Addresses --- */}
              {activeTab === "addresses" && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-green-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Alamat Pengiriman
                      </h2>
                    </div>
                    <button
                      onClick={openCreateAddress}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm shadow-lg shadow-green-500/30"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Alamat
                    </button>
                  </div>

                  {/* Address List - from API */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(userAddressList?.data ?? []).length === 0 ? (
                      <div className="col-span-full text-center py-12 bg-green-50 rounded-2xl border border-green-100">
                        <MapPin className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada alamat</h3>
                        <p className="text-gray-600 mb-4">Tambahkan alamat pengiriman untuk memudahkan checkout</p>
                        <button
                          onClick={openCreateAddress}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                        >
                          Tambah Alamat
                        </button>
                      </div>
                    ) : (
                      (userAddressList?.data ?? []).map((addr: UserAddress) => (
                        <div
                          key={addr.id}
                          className={`rounded-2xl p-6 transition-all border ${
                            addr.is_default
                              ? "border-green-500 bg-green-50"
                              : "border-green-100 bg-white hover:border-green-200"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-gray-900 text-lg">
                                {addr.is_default ? "Alamat Utama" : "Alamat"}
                              </h3>
                              {addr.is_default && (
                                <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditAddress(addr.id)}
                                className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                                title="Edit alamat"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddressApi(addr.id)}
                                className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                title="Hapus alamat"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700">
                            <p className="text-gray-900 font-medium">
                              {findName(provinceList, addr.rajaongkir_province_id)} - {findName(cityList, addr.rajaongkir_city_id)} - {findName(districtList, addr.rajaongkir_district_id)}
                            </p>
                            <p className="mt-1">{addr.address_line_1}</p>
                            {addr.address_line_2 && <p>{addr.address_line_2}</p>}
                            <p>{addr.postal_code}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* --- 4. Orders --- */}
              {activeTab === "orders" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6 border-b border-green-100 pb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                      <Package className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Riwayat Pesanan
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {(orders || []).map((order) => (
                      <div
                        key={order.id}
                        className="border border-green-100 rounded-2xl p-6 hover:border-green-300 hover:shadow-md transition-all bg-gray-50/50"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 border-b border-green-100 pb-4">
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                              Pesanan #{order.orderNumber}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(order.date).toLocaleDateString(
                                    "id-ID"
                                  )}
                                </span>
                              </div>
                              {order.trackingNumber && (
                                <div className="flex items-center gap-2">
                                  <Truck className="w-4 h-4" />
                                  <span className="font-semibold text-gray-900">
                                    {order.trackingNumber}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-left md:text-right mt-3 md:mt-0">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                            <div className="font-bold text-xl text-green-600 mt-1">
                              Rp {order.grand_total.toLocaleString("id-ID")}
                            </div>
                          </div>
                        </div>

                        {/* Order Items Summary */}
                        <div className="flex items-center gap-3 mb-4">
                          {order.items.slice(0, 4).map((item, index) => (
                            <div
                              key={`${order.id}-${item.id}-${index}`}
                              className="w-14 h-14 sm:w-16 sm:h-16 relative rounded-lg overflow-hidden border border-green-100"
                            >
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <span className="text-sm text-gray-500">
                              +{order.items.length - 4} item
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-green-100">
                          <button
                            onClick={() => openOrderDetailModal(order.id)}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-colors font-semibold text-sm"
                          >
                            <Eye className="w-4 h-4" /> Detail
                          </button>
                          {(order.status === "pending" ||
                            order.status === "processing") &&
                            order.payment_method === "manual" && (
                              <button
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  openPaymentProofModal();
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-sm shadow-lg shadow-green-500/30"
                              >
                                <Upload className="w-4 h-4" /> Upload Bukti
                              </button>
                            )}
                          {order.status === "delivered" && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-semibold text-sm border border-green-200">
                              <Star className="w-4 h-4" /> Review
                            </button>
                          )}
                          {order.status === "shipped" && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-semibold text-sm border border-green-200">
                              <Truck className="w-4 h-4" /> Lacak
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {orders.length === 0 && (
                    <div className="text-center py-12 bg-green-50 rounded-2xl border border-green-100">
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Belum Ada Pesanan
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Anda belum memiliki pesanan. Mulai belanja sekarang!
                      </p>
                      <button
                        onClick={() => router.push("/product")}
                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30"
                      >
                        Mulai Belanja
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* Note: Modals are not included here but should inherit B&W styling */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}