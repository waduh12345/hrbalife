"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Eye,
  Star,
  Search,
  Package,
  Filter,
  X,
} from "lucide-react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import clsx from "clsx";

// Types
import { Product } from "@/types/admin/product";
import { ProductCategory } from "@/types/master/product-category";

// Services
import {
  useGetProductListQuery,
  useGetCategoryListQuery,
} from "@/services/product.service";

// Components
import DotdLoader from "@/components/loader/3dot";
import QuickViewModal, {
  ProductWithMedia,
} from "@/components/ui/quick-view-modal";
import CartSuccessAlert from "@/components/ui/cart-success-alert";

/* =========================
   Small typed helpers
========================= */
const isKeyedObject = (o: unknown): o is Record<string, unknown> =>
  !!o && typeof o === "object";

function getProp(obj: unknown, key: string, kind: "number"): number | undefined;
function getProp(obj: unknown, key: string, kind: "string"): string | undefined;
function getProp(
  obj: unknown,
  key: string,
  kind: "number" | "string",
): number | string | undefined {
  if (!isKeyedObject(obj)) return undefined;
  const v = obj[key];
  if (kind === "number") return typeof v === "number" ? v : undefined;
  return typeof v === "string" ? v : undefined;
}

const getNumberProp = (obj: unknown, key: string): number | undefined =>
  getProp(obj, key, "number");

/* ---------- Suspense-safe reader ---------- */
function SearchParamsReader({
  onChange,
}: {
  onChange: (sp: URLSearchParams) => void;
}) {
  const sp = useSearchParams();
  useEffect(() => {
    onChange(sp);
  }, [sp, onChange]);
  return null;
}

/* ---------- Star rating ---------- */
function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(value)
              ? "fill-black text-black"
              : "text-gray-300"
          }`}
        />
      ))}
    </span>
  );
}

type PriceRange =
  | "all"
  | "under-100k"
  | "100k-200k"
  | "200k-500k"
  | "above-500k";
type SortKey =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest"
  | "diskon-terbesar";

const IMG_FALLBACK =
  "https://via.placeholder.com/400x400/000000/FFFFFF?text=No+Image";

const Pagination = ({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) => (
  <div className="text-center flex items-center justify-center gap-2">
    <button
      onClick={() => onChange(Math.max(1, page - 1))}
      disabled={page <= 1}
      className="px-3 py-1 rounded bg-gray-200 text-black disabled:opacity-50"
    >
      Prev
    </button>
    <span className="px-2 text-sm font-semibold text-black">
      Page {page} of {totalPages}
    </span>
    <button
      onClick={() => onChange(Math.min(totalPages, page + 1))}
      disabled={page >= totalPages}
      className="px-3 py-1 rounded bg-gray-200 text-black disabled:opacity-50"
    >
      Next
    </button>
  </div>
);

const Button = ({
  children,
  className,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  className: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => (
  <button className={className} onClick={onClick} {...props}>
    {children}
  </button>
);

/* ---------- Utils ---------- */
const toNumber = (val: number | string): number => {
  if (typeof val === "number") return val;
  const parsed = parseFloat(val);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatQueryToTitle = (q: string | null): string => {
  if (!q) return "Semua Produk";
  if (q === "new-arrivals") return "New Arrivals";
  if (q === "best-seller") return "Best Seller";
  const spaced = q.replace(/-/g, " ").trim();
  return spaced
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default function ProductsPage() {
  const router = useRouter();

  // --- Search Params ---
  const [sp, setSp] = useState<URLSearchParams | null>(null);
  const rawQ = sp?.get("q") ?? null;

  type Mode = "all" | "new" | "best";
  const mode: Mode =
    rawQ === "new-arrivals" ? "new" : rawQ === "best-seller" ? "best" : "all";
  const urlSearchTerm = mode === "all" ? (rawQ ?? "") : "";

  // --- Modal State ---
  // Menggunakan state tunggal untuk mengontrol modal quick view
  const [quickViewProduct, setQuickViewProduct] =
    useState<ProductWithMedia | null>(null);

  const dynamicTitle = useMemo(() => formatQueryToTitle(rawQ), [rawQ]);

  // --- Local States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState(urlSearchTerm);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setQuery(urlSearchTerm);
    setCurrentPage(1);
  }, [urlSearchTerm]);

  const [filter, setFilter] = useState<{
    category: string;
    priceRange: PriceRange;
    sort: SortKey;
  }>({
    category: "all",
    priceRange: "all",
    sort: "featured",
  });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onlyDiscount, setOnlyDiscount] = useState(false);

  // --- API Bindings ---
  const ITEMS_PER_PAGE = 9;

  const orderBy =
    mode === "new"
      ? "updated_at"
      : mode === "best"
        ? "products.sales"
        : undefined;
  const order: "asc" | "desc" | undefined = orderBy ? "desc" : undefined;

  const { data: listResp, isLoading } = useGetProductListQuery({
    orderBy,
    order,
    search: urlSearchTerm || undefined,
  });

  const { data: categoryResp } = useGetCategoryListQuery({
    page: 1,
    paginate: 100,
  });

  const categoryOptionList = useMemo(
    () =>
      ((categoryResp?.data ?? []) as ProductCategory[]).map((c) => ({
        label: c.name ?? "Kategori",
        slug: c.slug ?? String(c.id),
      })),
    [categoryResp?.data],
  );

  // --- Filter Logic ---
  useEffect(() => {
    const slugFromUrl = sp?.get("category") ?? null;

    if (!slugFromUrl) {
      if (filter.category !== "all") {
        setFilter((prev) => ({ ...prev, category: "all" }));
        setCurrentPage(1);
      }
      return;
    }

    if (!categoryOptionList || categoryOptionList.length === 0) return;

    const matched = categoryOptionList.find((c) => c.slug === slugFromUrl);
    const fallbackByLabel = categoryOptionList.find(
      (c) =>
        c.label.trim().toLowerCase() ===
        decodeURIComponent(slugFromUrl).trim().toLowerCase(),
    );

    const newCategory =
      matched?.slug ?? fallbackByLabel?.slug ?? decodeURIComponent(slugFromUrl);

    if (newCategory !== filter.category) {
      setFilter((prev) => ({ ...prev, category: newCategory }));
      setCurrentPage(1);
    }
  }, [sp?.toString(), categoryOptionList]);

  const setCategoryAndSyncUrl = (slug: string) => {
    setFilter((prev) => ({ ...prev, category: slug }));
    setCurrentPage(1);

    try {
      const params = new URLSearchParams(sp?.toString() ?? "");
      if (slug === "all") {
        params.delete("category");
      } else {
        params.set("category", slug);
      }

      const query = params.toString();
      const target = query ? `/product?${query}` : `/product`;
      router.replace(target);
    } catch (err) {
      router.replace(
        slug === "all"
          ? "/product"
          : `/product?category=${encodeURIComponent(slug)}`,
      );
    }
  };

  const totalPages = useMemo(() => listResp?.last_page ?? 1, [listResp]);
  const products = useMemo<Product[]>(() => listResp?.data ?? [], [listResp]);

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  /* ---------- HELPER FIX: getImageUrl ---------- */
  const getImageUrl = (p: Product): string => {
    // 1. Cek jika image langsung berupa string
    if (typeof p.image === "string" && p.image) return p.image;

    // 2. Type assertion aman untuk mengakses properti media
    // Kita beritahu TS bahwa 'p' mungkin memiliki properti 'media' array
    const productWithMedia = p as unknown as {
      media?: { original_url: string }[];
    };

    // 3. Akses media dengan aman
    const media = productWithMedia.media;
    if (Array.isArray(media) && media.length > 0 && media[0]?.original_url) {
      return media[0].original_url;
    }

    return IMG_FALLBACK;
  };

  /* ---------- Client-side filter/sort ---------- */
  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    let data = products;

    data = data.filter((p) => {
      const price = toNumber(p.price);
      const stock = toNumber(p.stock);
      const matchSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.category_name.toLowerCase().includes(term);
      const nameToSlug = new Map<string, string>();
      categoryOptionList.forEach((o) => nameToSlug.set(o.label, o.slug));

      const matchCategory =
        filter.category === "all" ||
        nameToSlug.get(p.category_name) === filter.category;

      const matchPrice =
        filter.priceRange === "all" ||
        (filter.priceRange === "under-100k" && price < 100_000) ||
        (filter.priceRange === "100k-200k" &&
          price >= 100_000 &&
          price <= 200_000) ||
        (filter.priceRange === "200k-500k" &&
          price > 200_000 &&
          price <= 500_000) ||
        (filter.priceRange === "above-500k" && price > 500_000);
      const matchStock = inStockOnly ? stock > 0 : true;

      const was = getNumberProp(p, "markup_price");
      const matchDiscount = onlyDiscount
        ? typeof was === "number" && was > p.price
        : true;

      return (
        matchSearch &&
        matchCategory &&
        matchPrice &&
        matchStock &&
        matchDiscount
      );
    });

    return data;
  }, [
    products,
    query,
    filter.category,
    filter.priceRange,
    inStockOnly,
    onlyDiscount,
  ]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (filter.sort) {
      case "price-low":
        return arr.sort((a, b) => a.price - b.price);
      case "price-high":
        return arr.sort((a, b) => b.price - a.price);
      case "rating": {
        return arr.sort(
          (a, b) =>
            (getNumberProp(b, "rating") ?? 0) -
            (getNumberProp(a, "rating") ?? 0),
        );
      }
      case "newest":
        return arr.sort((a, b) => b.id - a.id);
      case "diskon-terbesar":
        return arr.sort((a, b) => {
          const wasA = getNumberProp(a, "markup_price") ?? a.price;
          const wasB = getNumberProp(b, "markup_price") ?? b.price;
          const discA = (wasA - a.price) / wasA;
          const discB = (wasB - b.price) / wasB;
          return discB - discA;
        });
      default:
        return arr;
    }
  }, [filteredProducts, filter.sort]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedProducts.slice(start, end);
  }, [sortedProducts, currentPage]);

  const totalFilteredPages = Math.max(
    1,
    Math.ceil(sortedProducts.length / ITEMS_PER_PAGE),
  );
  const startFilteredIdx = sortedProducts.length
    ? (currentPage - 1) * ITEMS_PER_PAGE + 1
    : 0;
  const endFilteredIdx = Math.min(
    currentPage * ITEMS_PER_PAGE,
    sortedProducts.length,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    query,
    filter.category,
    filter.priceRange,
    filter.sort,
    inStockOnly,
    onlyDiscount,
  ]);

  const SimplifiedFilterBlocks = () => (
    <div className="space-y-4">
      <h3 className="font-bold text-black uppercase tracking-wider border-b border-gray-200 pb-2">
        Category
      </h3>
      <div className="flex flex-col gap-2 mb-4">
        <label className="flex items-center space-x-2 text-sm text-gray-700">
          <input
            type="radio"
            name="category"
            value="all"
            checked={filter.category === "all"}
            onChange={() => setCategoryAndSyncUrl("all")}
            className="text-black focus:ring-black"
          />
          <span>All Categories</span>
        </label>

        {categoryOptionList.map((opt) => (
          <label
            key={opt.slug}
            className="flex items-center space-x-2 text-sm text-gray-700"
          >
            <input
              type="radio"
              name="category"
              value={opt.slug}
              checked={filter.category === opt.slug}
              onChange={() => setCategoryAndSyncUrl(opt.slug)}
              className="text-black focus:ring-black"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      <h3 className="font-bold text-black uppercase tracking-wider border-b border-gray-200 pb-2">
        Availability
      </h3>
      <label className="flex items-center space-x-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="text-black focus:ring-black"
        />
        <span>In Stock Only</span>
      </label>
      <label className="flex items-center space-x-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={onlyDiscount}
          onChange={(e) => setOnlyDiscount(e.target.checked)}
          className="text-black focus:ring-black"
        />
        <span>On Discount</span>
      </label>

      <h3 className="font-bold text-black uppercase tracking-wider border-b border-gray-200 pt-4 pb-2">
        Price Range
      </h3>
      <select
        value={filter.priceRange}
        onChange={(e) =>
          setFilter({
            ...filter,
            priceRange: (
              [
                "all",
                "under-100k",
                "100k-200k",
                "200k-500k",
                "above-500k",
              ] as PriceRange[]
            ).includes(e.target.value as PriceRange)
              ? (e.target.value as PriceRange)
              : "all",
          })
        }
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
      >
        <option value="all">All Prices</option>
        <option value="under-100k">Below Rp100.000</option>
        <option value="100k-200k">Rp100.000 - Rp200.000</option>
        <option value="200k-500k">Rp200.000 - Rp500.000</option>
        <option value="above-500k">Above Rp500.000</option>
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Alert Component */}
      <CartSuccessAlert />

      <Suspense fallback={null}>
        <SearchParamsReader onChange={setSp} />
      </Suspense>

      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white shadow-sm md:pt-16">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-black uppercase">
                {dynamicTitle}
              </h1>
              <p className="text-sm text-gray-700">TIMELESS STYLE</p>
            </div>

            <div className="flex w-full items-center gap-2 md:w-auto">
              <div className="group flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm ring-1 ring-transparent transition focus-within:ring-black/40 md:w-80">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for items, categories, or tags…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 text-black"
                  aria-label="Cari"
                />
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-black hover:bg-gray-50 md:hidden transition-colors"
              >
                <Filter className="h-4 w-4" /> Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-[260px_1fr]">
          <aside className="hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:block">
            <SimplifiedFilterBlocks />
          </aside>

          <section>
            {/* Sort row */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <strong>
                  {filteredProducts.length
                    ? `${startFilteredIdx}-${endFilteredIdx}`
                    : 0}
                </strong>{" "}
                of <strong>{filteredProducts.length}</strong> products
                {query ? (
                  <>
                    {" "}
                    for{" "}
                    <span className="font-semibold text-black">{`"${query}"`}</span>
                  </>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Sort by:</span>
                <select
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black font-medium"
                  value={filter.sort}
                  onChange={(e) =>
                    setFilter({ ...filter, sort: e.target.value as SortKey })
                  }
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="w-full flex justify-center items-center min-h-64">
                <DotdLoader />
              </div>
            ) : pageItems.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-4 uppercase">
                  No Products Found
                </h3>
                <p className="text-gray-700 mb-6">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
                {pageItems.map((product) => {
                  const img = getImageUrl(product);
                  const ratingNum = getNumberProp(product, "rating") ?? 0;
                  const totalReviews =
                    getNumberProp(product, "total_reviews") ?? 0;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg transition-all duration-300 overflow-hidden group relative border border-gray-100 shadow-sm flex flex-col"
                    >
                      {/* IMAGE */}
                      <div className="relative w-full aspect-[3/4] overflow-hidden">
                        <Image
                          src={img}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105 grayscale-[10%]"
                          unoptimized
                        />

                        <div
                          className={clsx(
                            "absolute top-4 right-4 flex flex-col gap-2 z-10 transition-opacity",
                            "opacity-0 group-hover:opacity-100",
                          )}
                        >
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className={`p-2 rounded-full shadow-lg transition-colors ${
                              wishlist.includes(product.id)
                                ? "bg-black text-white"
                                : "bg-white text-gray-600 hover:text-black"
                            }`}
                            aria-label="Toggle Wishlist"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                wishlist.includes(product.id)
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          </button>

                          <button
                            onClick={() => setQuickViewProduct(product)}
                            className="p-2 bg-white text-gray-600 hover:text-black rounded-full shadow-lg transition-colors"
                            aria-label="Quick View"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="p-4 flex-1 flex flex-col justify-between min-h-[120px]">
                        <div>
                          <h3 className="font-semibold text-black uppercase tracking-wide line-clamp-2">
                            {product.name}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-y-2 items-end justify-between">
                            <div className="flex flex-col">
                              {(getNumberProp(product, "markup_price") ?? 0) >
                              toNumber(product.price) ? (
                                <div className="flex items-baseline gap-2">
                                  <span className="font-bold text-red-600 text-sm md:text-lg">
                                    {formatCurrency(toNumber(product.price))}
                                  </span>
                                  <span className="text-gray-400 line-through text-xs">
                                    {formatCurrency(
                                      getNumberProp(product, "markup_price") ??
                                        0,
                                    )}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-bold text-black text-sm md:text-lg">
                                  {formatCurrency(toNumber(product.price))}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 mb-1">
                              <StarRating value={ratingNum} />
                              <span className="text-xs text-gray-500">
                                ({totalReviews})
                              </span>
                            </div>
                          </div>

                          {toNumber(product.stock) <= 0 ? (
                            <div className="mt-2 text-xs font-semibold text-red-600">
                              Sold out
                            </div>
                          ) : (
                            <div className="mt-2 text-xs text-gray-600">
                              Stock: {product.stock}
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <Button
                            onClick={() => setQuickViewProduct(product)}
                            className="text-xs md:text-lg w-full bg-black text-white hover:bg-gray-800 uppercase tracking-wider font-bold py-2.5 rounded-lg transition-colors"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalFilteredPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <Pagination
                  page={currentPage}
                  totalPages={totalFilteredPages}
                  onChange={(p: number) => setCurrentPage(p)}
                />
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Drawer Filter (mobile) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm animate-[slideIn_200ms_ease-out] overflow-y-auto rounded-l-xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-black uppercase">
                Filter Options
              </h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-full p-2 hover:bg-gray-100 text-black"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SimplifiedFilterBlocks />
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full bg-black text-white py-3 rounded-lg font-bold mt-6 uppercase"
            >
              Apply Filters
            </button>
          </div>

          <style jsx>{`
            @keyframes slideIn {
              from {
                transform: translateX(16px);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}

      {/* REUSABLE MODAL - Dipanggil sekali untuk seluruh halaman */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            productBase={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}