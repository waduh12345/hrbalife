/* ---------- Filter blocks (shared by desktop & drawer) ---------- */
export default function FilterBlocks(props: {
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  featuredOnly: boolean;
  setFeaturedOnly: (v: boolean) => void;
  onlyDiscount: boolean;
  setOnlyDiscount: (v: boolean) => void;
  priceRange: "lt310" | "310to570" | "570to830" | "gte830" | null;
  setPriceRange: (
    v: "lt310" | "310to570" | "570to830" | "gte830" | null
  ) => void;
}) {
  const {
    inStockOnly,
    setInStockOnly,
    featuredOnly,
    setFeaturedOnly,
    onlyDiscount,
    setOnlyDiscount,
    priceRange,
    setPriceRange,
  } = props;

  return (
    <div className="space-y-6 text-sm">
      {/* Search hint */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Tipe Produk
        </div>
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <span>Produk Unggulan</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyDiscount}
              onChange={(e) => setOnlyDiscount(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <span>Diskon</span>
          </label>
        </div>
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Ketersediaan
        </div>
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <span>Ada Stok</span>
          </label>
        </div>
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Harga
        </div>
        <div className="mt-2 space-y-2">
          {(
            [
              { key: "lt310", label: "Di bawah Rp 310.000" },
              { key: "310to570", label: "Rp 310.000 – Rp 570.000" },
              { key: "570to830", label: "Rp 570.000 – Rp 830.000" },
              { key: "gte830", label: "≥ Rp 830.000" },
            ] as const
          ).map((r) => (
            <label key={r.key} className="flex items-center gap-2">
              <input
                type="radio"
                name="price-range"
                checked={priceRange === r.key}
                onChange={() =>
                  setPriceRange(priceRange === r.key ? null : r.key)
                }
                className="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-500"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset */}
      {(inStockOnly || featuredOnly || onlyDiscount || priceRange) && (
        <button
          onClick={() => {
            setInStockOnly(false);
            setFeaturedOnly(false);
            setOnlyDiscount(false);
            setPriceRange(null);
          }}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Reset Filter
        </button>
      )}
    </div>
  );
}