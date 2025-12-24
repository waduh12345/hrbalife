"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Save,
  Loader2,
} from "lucide-react";
import clsx from "clsx";
import Swal from "sweetalert2";

// --- IMPORTS SERVICES & TYPES ---
import {
  useGetSliderListQuery,
  useCreateSliderMutation,
  useUpdateSliderMutation,
} from "@/services/customize/home/slider.service";
import type { Slider } from "@/types/customization/home/slider";

// --- IMPORTS MODE EDIT ---
import { useEditMode } from "@/hooks/use-edit-mode";
import { EditableImage, EditableText } from "@/components/ui/editable";
import { useLanguage } from "@/contexts/LanguageContext";
import DotdLoader from "@/components/loader/3dot";
import { Button } from "@/components/ui/button";

// --- KONFIGURASI BASE URL IMAGE ---
const BASE_IMAGE_URL =
  process.env.NEXT_PUBLIC_API_SECOND_URL || "https://api-dev.blackbox.id";

// --- KAMUS BAHASA SEDERHANA ---
const TRANSLATIONS = {
  id: {
    upload: "Upload gambar",
    addNew: "Tambah Slider Baru",
    saving: "Menyimpan...",
    save: "Simpan",
    titlePlaceholder: "Judul Slider",
    successCreate: "Slider berhasil dibuat",
    successUpdate: "Slider berhasil diperbarui",
    errorFile: "Harap upload file gambar",
    empty: "Belum ada slider",
  },
  en: {
    upload: "Upload image",
    addNew: "Add New Slider",
    saving: "Saving...",
    save: "Save",
    titlePlaceholder: "Slider Title",
    successCreate: "Slider created successfully",
    successUpdate: "Slider updated successfully",
    errorFile: "Please upload an image file",
    empty: "No sliders yet",
  },
};

type RunningCarouselProps = {
  heightClass?: string;
  intervalMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
};

// =========================================
// DEFAULT EXPORT (WRAPPER SUSPENSE)
// =========================================
export default function RunningCarousel(props: RunningCarouselProps) {
  return (
    <Suspense
      fallback={
        <div
          className={clsx(
            "relative w-full overflow-hidden rounded-3xl bg-gray-100 shadow-xl",
            props.heightClass || "h-[60vh]"
          )}
        >
          <div className="absolute inset-0 grid place-items-center text-sm text-gray-500">
            <DotdLoader />
          </div>
        </div>
      }
    >
      <RunningCarouselContent {...props} />
    </Suspense>
  );
}

// =========================================
// CONTENT COMPONENT
// =========================================
function RunningCarouselContent({
  heightClass = "h-[60vh]",
  intervalMs = 3000,
  showArrows = true,
  showDots = true,
}: RunningCarouselProps) {
  const isEditMode = useEditMode();
  const { lang } = useLanguage();

  // Ref untuk input file create baru
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ambil teks label berdasarkan bahasa aktif
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.id;

  // Client Code
  const [clientCode, setClientCode] = useState<string>("");
  useEffect(() => {
    const code =
      typeof window !== "undefined"
        ? "$2b$10$OQn8T3wDmOw4pDZz.jPC4ONpoheZvpx9eReWIajaggH/aZDkU1koC"
        : "";
    if (code) setClientCode(code);
  }, []);

  // 1. API HOOKS
  const {
    data: sliderApiResult,
    isLoading,
    refetch,
  } = useGetSliderListQuery(
    { client_code: clientCode, bahasa: lang },
    { skip: !clientCode }
  );

  useEffect(() => {
    if (clientCode) refetch();
  }, [lang, clientCode, refetch]);

  const [createSlider, { isLoading: isCreating }] = useCreateSliderMutation();
  const [updateSlider, { isLoading: isUpdating }] = useUpdateSliderMutation();

  // 2. STATE LOKAL
  const [localSlides, setLocalSlides] = useState<Slider[]>([]);

  // 3. SYNC DATA API -> LOCAL STATE
  useEffect(() => {
    if (sliderApiResult?.data?.items) {
      setLocalSlides(sliderApiResult.data.items);
    }
  }, [sliderApiResult]);

  // Carousel Logic
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setIndex(0);
  }, [localSlides.length]);

  useEffect(() => {
    if (paused || isEditMode || localSlides.length <= 1) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % localSlides.length);
    }, intervalMs);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [localSlides.length, intervalMs, paused, isEditMode]);

  const go = (dir: -1 | 1) =>
    setIndex((i) => (i + dir + localSlides.length) % localSlides.length);

  // --- HELPER: Unified Save Handler ---
  const handleUpdateItem = async (
    slideIndex: number,
    field: "image" | "judul",
    value: string | File | Blob,
    isNew: boolean = false
  ) => {
    if (!clientCode) return;

    const currentSlide = isNew ? null : localSlides[slideIndex];

    // Optimistic Update (Hanya jika update existing & bukan file)
    if (!isNew && typeof value === "string") {
      setLocalSlides((prev) => {
        const updated = [...prev];
        if (updated[slideIndex]) {
          updated[slideIndex] = {
            ...updated[slideIndex],
            [field]: value,
          };
        }
        return updated;
      });
    }

    try {
      const formData = new FormData();
      formData.append("client_id", "6");
      formData.append("bahasa", lang);
      formData.append("status", "1");

      const isFileOrBlob = value instanceof File || value instanceof Blob;

      if (isNew) {
        // --- LOGIC CREATE ---
        formData.append(
          "judul",
          field === "judul" ? (value as string) : "New Slider"
        );

        if (field === "image" && isFileOrBlob) {
          formData.append("image", value as Blob);
        } else {
          Swal.fire("Error", t.errorFile, "warning");
          return;
        }

        await createSlider(formData).unwrap();
        Swal.fire({
          icon: "success",
          title: t.successCreate,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
        });
      } else if (currentSlide) {
        // --- LOGIC UPDATE ---
        const titleToSend =
          field === "judul" ? (value as string) : currentSlide.judul;
        formData.append("judul", titleToSend || "");

        if (field === "image" && isFileOrBlob) {
          formData.append("image", value as Blob);
        }

        await updateSlider({ id: currentSlide.id, data: formData }).unwrap();
        Swal.fire({
          icon: "success",
          title: t.successUpdate,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      refetch();
    } catch (error) {
      console.error("Slider save error:", error);
      Swal.fire("Error", "Failed to save slider", "error");
    }
  };

  // --- HELPER: Get Image URL ---
  const getImageUrl = (source: string | File | Blob | null) => {
    if (!source) return "/placeholder.webp";
    if (source instanceof File || source instanceof Blob) {
      return URL.createObjectURL(source);
    }
    if (typeof source === "string") {
      if (source.startsWith("http") || source.startsWith("data:")) {
        return source;
      }
      return `${BASE_IMAGE_URL}/media/${source}`;
    }
    return "/placeholder.webp";
  };

  // --- RENDERING ---

  // 1. Loading State
  if (isLoading && localSlides.length === 0) {
    return (
      <div
        className={clsx(
          "relative w-full overflow-hidden rounded-3xl bg-gray-100 shadow-xl",
          heightClass
        )}
      >
        <div className="absolute inset-0 grid place-items-center">
          <DotdLoader />
        </div>
      </div>
    );
  }

  // 2. Empty State (Create First Slider)
  if (!isLoading && localSlides.length === 0) {
    return (
      <div
        className={clsx(
          "relative w-full overflow-hidden rounded-3xl bg-gray-100 shadow-xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300",
          heightClass
        )}
      >
        <p className="text-gray-500">{t.empty}</p>
        {isEditMode && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-blue-600">{t.upload}:</p>
            <div
              className="w-32 h-32 relative bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()} // Trigger ref input
            >
              {/* Image Preview / Placeholder */}
              <div className="w-full h-full flex items-center justify-center">
                <PlusCircle className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            {/* Hidden Input khusus Empty State */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  e.target.value = "";
                  handleUpdateItem(-1, "image", file, true);
                }
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        `relative w-full overflow-hidden rounded-3xl ${heightClass} bg-gray-100`,
        "shadow-xl group/carousel"
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* Track Slides */}
      <div
        className="flex h-full w-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {localSlides.map((slide, i) => (
          <div key={`${slide.id}-${i}`} className="relative min-w-full h-full">
            {/* GAMBAR SLIDER */}
            <EditableImage
              isEditMode={isEditMode}
              src={getImageUrl(slide.image)}
              onSave={(file) => handleUpdateItem(i, "image", file, false)}
              alt={slide.judul || `Slide ${i + 1}`}
              containerClassName="w-full h-full"
              className="h-full w-full object-cover"
              width={1200}
              height={800}
              priority={i === 0}
            />

            {/* Gradient Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-[1]" />

            {/* JUDUL SLIDER (EDITABLE) */}
            <div className="absolute bottom-12 left-6 md:left-10 z-20 w-full max-w-2xl pr-4">
              <div className="text-white text-3xl md:text-4xl font-bold drop-shadow-md">
                <EditableText
                  isEditMode={isEditMode}
                  text={slide.judul || ""}
                  onSave={(val) => handleUpdateItem(i, "judul", val, false)}
                  className="bg-transparent border-none text-white focus:ring-0 placeholder:text-white/50 w-full"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      {showArrows && localSlides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="group absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 shadow-lg ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-black/60 z-20"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={() => go(1)}
            className="group absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 shadow-lg ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-black/60 z-20"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && localSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-20">
          {localSlides.map((_, i) => (
            <button
              key={`dot-${i}`}
              onClick={() => setIndex(i)}
              className={clsx(
                "h-2.5 w-2.5 rounded-full transition-all duration-300",
                i === index
                  ? "bg-white shadow-md ring-2 ring-gray-400 w-8"
                  : "bg-gray-400/60 hover:bg-gray-300"
              )}
            />
          ))}
        </div>
      )}

      {/* INDIKATOR MODE EDIT & BUTTON SAVE/LOADING */}
      {isEditMode && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
          {/* Label Mode Edit */}
          <div className="bg-blue-600/90 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider backdrop-blur-sm shadow-md">
            Editable
          </div>

          {/* Indikator Loading / Save */}
          {isCreating || isUpdating ? (
            <div className="flex items-center gap-2 bg-emerald-600/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{t.saving}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white/20 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm border border-white/20">
              <Save className="w-3 h-3" />
              <span>{t.save} ready</span>
            </div>
          )}

          {/* Tombol Tambah Slide Baru (DENGAN FIX REF INPUT) */}
          <div className="relative">
            {/* Input File Tersembunyi */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Reset agar bisa pilih file yg sama jika perlu
                  e.target.value = "";
                  handleUpdateItem(-1, "image", file, true);
                }
              }}
            />

            {/* Button Trigger */}
            <Button
              size="icon"
              className="h-8 w-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border-2 border-white/20"
              title={t.addNew}
              onClick={() => fileInputRef.current?.click()} // Trigger Klik Input
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}