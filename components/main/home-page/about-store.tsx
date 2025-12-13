"use client";

import { useState, useEffect, Suspense } from "react";
import { ShieldCheck, Truck, Diamond, Save, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

// --- IMPORTS SERVICES & TYPES ---
import {
  useGetAboutUsListQuery,
  useCreateAboutUsMutation,
  useUpdateAboutUsMutation,
} from "@/services/customize/about/about-us.service";
import type { AboutUs } from "@/types/customization/about/tentang";

// --- IMPORTS MODE EDIT ---
import { useEditMode } from "@/hooks/use-edit-mode";
import { useLanguage } from "@/contexts/LanguageContext";
import { EditableText, EditableImage } from "@/components/ui/editable";
import {
  EditableSection,
  BackgroundConfig,
} from "@/components/ui/editable-section";
import DotdLoader from "@/components/loader/3dot";

// --- CONFIG ---
const BASE_IMAGE_URL =
  process.env.NEXT_PUBLIC_API_SECOND_URL || "https://api-dev.blackbox.id";

const FALLBACK_IMAGE = "/placeholder.webp";

// =========================================
// DEFAULT EXPORT (WRAPPER SUSPENSE)
// =========================================
export default function AboutStore() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex justify-center">
          <DotdLoader />
        </div>
      }
    >
      <AboutStoreContent />
    </Suspense>
  );
}

// =========================================
// CONTENT COMPONENT
// =========================================
function AboutStoreContent() {
  const isEditMode = useEditMode();
  const { lang } = useLanguage();
  const YEAR = new Date().getFullYear();

  // === 1. SETUP CLIENT CODE ===
  const [clientCode, setClientCode] = useState<string>("");
  useEffect(() => {
    const code =
      typeof window !== "undefined" ? localStorage.getItem("code_client") : "";
    if (code) setClientCode(code);
  }, []);

  // === 2. API HOOKS ===
  const {
    data: apiResult,
    isLoading,
    refetch,
  } = useGetAboutUsListQuery(
    { client_code: clientCode, bahasa: lang },
    { skip: !clientCode }
  );

  const [createAboutUs, { isLoading: isCreating }] = useCreateAboutUsMutation();
  const [updateAboutUs, { isLoading: isUpdating }] = useUpdateAboutUsMutation();

  // === 3. LOCAL STATE ===
  const [localData, setLocalData] = useState<Partial<AboutUs> | null>(null);
  const [existingId, setExistingId] = useState<number | null>(null);

  // === 4. BACKGROUND STATE ===
  const [bgConfig, setBgConfig] = useState<BackgroundConfig>({
    type: "solid",
    color1: "#ffffff",
  });

  // === 5. SYNC DATA API -> LOCAL ===
  useEffect(() => {
    if (apiResult?.data?.items && apiResult.data.items.length > 0) {
      const item = apiResult.data.items[0];
      setExistingId(item.id);
      setLocalData(item);
    } else if (apiResult?.success) {
      setExistingId(null);
      setLocalData({
        judul: "",
        deskripsi: "",
        info_judul_1: "",
        info_judul_2: "",
        info_judul_3: "",
        image: null,
      });
    }
  }, [apiResult]);

  // === 6. HANDLE SAVE (CREATE / UPDATE) ===
  const handleSave = async (
    field: keyof AboutUs,
    value: string | File | Blob
  ) => {
    if (!clientCode || !localData) return;

    // 1. Optimistic Update Local State
    setLocalData((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : null
    );

    try {
      const formData = new FormData();
      formData.append("client_id", "6");
      formData.append("bahasa", lang);
      formData.append("status", "1");

      // Helper untuk mengambil value (Prioritas: Value baru -> Value Local -> Default Strip)
      const getVal = (key: keyof AboutUs) => {
        if (key === field) return value; // Value yang sedang diedit
        return localData[key] ?? "-";
      };

      // --- MAPPING DATA KE FORMDATA ---
      formData.append("judul", getVal("judul") as string);
      formData.append("deskripsi", getVal("deskripsi") as string);
      formData.append("info_judul_1", getVal("info_judul_1") as string);
      formData.append("info_judul_2", getVal("info_judul_2") as string);
      formData.append("info_judul_3", getVal("info_judul_3") as string);

      // Dummy Fields (Required by Backend)
      formData.append("info_deskripsi_1", "-");
      formData.append("info_deskripsi_2", "-");
      formData.append("info_deskripsi_3", "-");
      formData.append("visi_judul", "Visi");
      formData.append("visi_deskripsi", "-");
      formData.append("visi_icon", "-");
      formData.append("misi_judul", "Misi");
      formData.append("misi_deskripsi", "-");
      formData.append("misi_icon", "-");

      // --- HANDLE IMAGE UPLOAD ---
      // Pastikan value adalah File/Blob. Jika string (URL), jangan di-append ke 'image'
      const isFileOrBlob = value instanceof File || value instanceof Blob;

      if (field === "image") {
        if (isFileOrBlob) {
          console.log("📁 Appending Image File:", value); // Debugging
          // Pastikan backend menangkap key 'image'
          formData.append("image", value as Blob);
        } else {
          console.warn("⚠️ Value is not a File/Blob, skipping image append");
        }
      }

      // Debugging: Lihat isi FormData di Console
      // for (const pair of formData.entries()) {
      //   console.log(pair[0] + ', ' + pair[1]);
      // }

      // --- EKSEKUSI API ---
      if (!existingId) {
        // Mode: CREATE
        await createAboutUs(formData).unwrap();
        Swal.fire({
          icon: "success",
          title: "Profile Created",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        // Mode: UPDATE
        await updateAboutUs({ id: existingId, data: formData }).unwrap();
        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      refetch();
    } catch (error) {
      console.error("Save error:", error);
      Swal.fire("Error", "Gagal menyimpan perubahan", "error");
    }
  };

  // Helper Image URL
  const getImageUrl = (source: string | File | Blob | null | undefined) => {
    if (!source) return FALLBACK_IMAGE;
    if (source instanceof File || source instanceof Blob) {
      return URL.createObjectURL(source);
    }
    if (typeof source === "string") {
      if (source.startsWith("http") || source.startsWith("data:")) {
        return source;
      }
      return `${BASE_IMAGE_URL}/media/${source}`;
    }
    return FALLBACK_IMAGE;
  };

  // Loading State
  if (isLoading && !localData) {
    return (
      <div className="py-24 flex justify-center">
        <DotdLoader />
      </div>
    );
  }

  // Error State / No Data
  if (!localData) return null;

  const isSaving = isCreating || isUpdating;

  return (
    <EditableSection
      isEditMode={isEditMode}
      config={bgConfig}
      onSave={setBgConfig}
      className="relative overflow-hidden"
    >
      {/* Indikator Saving */}
      {isEditMode && isSaving && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving...</span>
        </div>
      )}

      {isEditMode && !isSaving && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white/20 text-gray-600 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm border border-gray-200">
          <Save className="w-3 h-3" />
          <span>Ready to save</span>
        </div>
      )}

      <div className="container mx-auto py-12 md:px-4 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Kiri: Teks & Value */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-700 ring-1 ring-gray-300">
              <Diamond className="h-3.5 w-3.5 text-black" />
              <span>Our Commitment</span>
            </span>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-black md:text-4xl lg:text-5xl">
              <EditableText
                isEditMode={isEditMode}
                text={localData.judul || ""}
                onSave={(v) => handleSave("judul", v)}
              />
            </h2>

            <div className="mt-5 text-base text-gray-700 md:text-lg">
              <EditableText
                isEditMode={isEditMode}
                text={localData.deskripsi || ""}
                onSave={(v) => handleSave("deskripsi", v)}
                as="p"
                multiline
              />
            </div>

            <ul className="mt-8 grid gap-4 text-base font-medium text-black sm:grid-cols-2">
              <li className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-black flex-shrink-0" />
                <EditableText
                  isEditMode={isEditMode}
                  text={localData.info_judul_1 || ""}
                  onSave={(v) => handleSave("info_judul_1", v)}
                  as="span"
                />
              </li>
              <li className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-black flex-shrink-0" />
                <EditableText
                  isEditMode={isEditMode}
                  text={localData.info_judul_2 || ""}
                  onSave={(v) => handleSave("info_judul_2", v)}
                  as="span"
                />
              </li>
              <li className="flex items-center gap-3">
                <Diamond className="h-5 w-5 text-black flex-shrink-0" />
                <EditableText
                  isEditMode={isEditMode}
                  text={localData.info_judul_3 || ""}
                  onSave={(v) => handleSave("info_judul_3", v)}
                  as="span"
                />
              </li>
            </ul>
          </div>

          {/* Kanan: Gambar Editable */}
          <div className="relative order-first md:order-last">
            <div className="overflow-hidden rounded-2xl border-4 border-black shadow-2xl relative h-[380px] md:h-[500px] w-full bg-gray-100">
              <EditableImage
                isEditMode={isEditMode}
                src={getImageUrl(localData.image)}
                onSave={(file) => handleSave("image", file)}
                alt="About Us Image"
                fill
                priority
                unoptimized
                containerClassName="w-full h-full"
                className="object-cover grayscale-[10%]"
              />
            </div>

            {/* Overlay kecil (Est Year) */}
            <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow-md backdrop-blur-sm">
              <span>Est. {YEAR}</span>
            </div>
          </div>
        </div>
      </div>
    </EditableSection>
  );
}