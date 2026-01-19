export default function CategoryHighlights() {
  const categories = ['Pencernaan', 'Energi', 'Tidur', 'Detoks']

  return (
    <section className="max-w-7xl mx-auto px-8 py-16">
      <div className="flex gap-10 justify-center">
        {categories.map(cat => (
          <div key={cat} className="text-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-soft mb-4" />
            <p className="text-sm font-medium">{cat}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
