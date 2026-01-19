import type { Metadata } from 'next'
import CheckoutClient from './CheckoutClient'

export const metadata: Metadata = {
  title: 'Checkout | HerbalCare',
  description: 'Secure checkout untuk produk herbal premium HerbalCare.',
}

export default function CheckoutPage() {
  return (
    <>
      {/* JSON-LD Checkout */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CheckoutPage',
            name: 'HerbalCare Checkout',
            isPartOf: 'https://herbalcare.co.id',
          }),
        }}
      />
      <CheckoutClient />
    </>
  )
}
