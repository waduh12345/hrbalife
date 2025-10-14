import ProductListingLayout from "@/components/product-listing-layout";
import { DEMO_PRODUCTS } from "@/lib/demo-product";

const chips = [
  { label: "Semua", slug: "semua" },
  { label: "Stok Menipis", slug: "low-stock" },
  { label: "Terbaru", slug: "newest" },
];

export default function Page() {
  return (
    <ProductListingLayout
      title="New Arrivals"
      subtitle="Koleksi terbaru & item yang mulai menipis. Buruan sebelum kehabisan!"
      products={DEMO_PRODUCTS}
      chips={chips}
      pageSize={10}
      lowStockAt={5} // ambang 'menipis' (bisa kamu ubah)
      defaultSort="terbaru"
    />
  );
}
