'use client'

import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { checkoutStyles } from './checkout.styles'

import CheckoutSteps from '@/components/CheckoutSteps'
import ContactForm from '@/components/ContactForm'
import ShippingMethod from '@/components/ShippingMethod'
import PaymentMethod from '@/components/PaymentMethod'
import OrderSummary from '@/components/OrderSummary'
import WhatsAppCta from '@/components/WhatsAppCta'

import AddressModal from '@/components/modals/AddressModal'
import ShippingModal from '@/components/modals/ShippingModal'
import PaymentModal from '@/components/modals/PaymentModal'

export default function CheckoutClient() {
  const [showAddress, setShowAddress] = useState(false)
  const [showShipping, setShowShipping] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    gsap.from('[data-checkout]', {
      opacity: 0,
      y: 40,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
    })
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: checkoutStyles }} />

      <main className="checkout-root">
        <CheckoutSteps />

        <div className="checkout-grid">
          {/* LEFT */}
          <div className="checkout-left">
            <section className="card" data-checkout>
              <ContactForm onChange={() => setShowAddress(true)} />
            </section>

            <section className="card" data-checkout>
              <ShippingMethod onChange={() => setShowShipping(true)} />
            </section>

            <section className="card" data-checkout>
              <PaymentMethod onChange={() => setShowPayment(true)} />
            </section>
          </div>

          {/* RIGHT */}
          <aside className="checkout-right" data-checkout>
            <OrderSummary />
            <WhatsAppCta />
          </aside>
        </div>
      </main>

      {/* MODALS */}
      {showAddress && <AddressModal onClose={() => setShowAddress(false)} />}
      {showShipping && <ShippingModal onClose={() => setShowShipping(false)} />}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
    </>
  )
}
