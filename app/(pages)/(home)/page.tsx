import Header from '@/components/Header'
import Hero from '@/components/Hero'
import CategoryHighlights from '@/components/CategoryHighlights'
import BestSellers from '@/components/BestSellers'
import BrandStory from '@/components/BrandStory'
import ShopByConcern from '@/components/ShopByConcern'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <BestSellers />
      <BrandStory />
      <ShopByConcern />
      <Footer />
    </div>
  )
} 
