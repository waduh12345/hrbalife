export default function OrderSummary() {
  return (
    <div className="summary-card">
      <h3>Order Summary</h3>

      <div className="row">
        <span>Subtotal</span>
        <strong>IDR 380.050</strong>
      </div>

      <div className="row">
        <span>Shipping</span>
        <strong>IDR 25.000</strong>
      </div>

      <div className="divider" />

      <div className="row total">
        <span>Total</span>
        <strong>IDR 405.050</strong>
      </div>

      <button className="btn-primary">Pay Now</button>
    </div>
  )
}
