import { ChevronLeft, ChevronRight } from "lucide-react";

/* ---------- Pagination component ---------- */
export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const go = (p: number) => onChange(Math.min(totalPages, Math.max(1, p)));

  const numbers = (() => {
    const arr: (number | "…")[] = [];
    const push = (v: number | "…") => arr.push(v);

    const window = 1; // jumlah tetangga kiri/kanan
    const start = Math.max(1, page - window);
    const end = Math.min(totalPages, page + window);

    // selalu tampilkan 1
    push(1);
    if (start > 2) push("…");
    for (let i = start; i <= end; i++) if (i !== 1 && i !== totalPages) push(i);
    if (end < totalPages - 1) push("…");
    if (totalPages > 1) push(totalPages);

    return arr;
  })();

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        onClick={() => go(page - 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        disabled={page === 1}
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>

      {numbers.map((n, idx) =>
        n === "…" ? (
          <span
            key={`e-${idx}`}
            className="px-2 text-sm text-gray-400 select-none"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={n}
            onClick={() => go(n)}
            aria-current={n === page ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              n === page
                ? "bg-rose-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {n}
          </button>
        )
      )}

      <button
        onClick={() => go(page + 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        disabled={page === totalPages}
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
