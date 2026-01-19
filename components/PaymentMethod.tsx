export default function PaymentMethod({ onChange }: { onChange: () => void }) {
  return (
    <>
      <div className="card-header">
        <h5>Payment Method</h5>
        <button onClick={onChange} className="link-action">
          Change
        </button>
      </div>

      <div className="payment-row">
        <h6>Virtual Account (BCA)</h6>
        <span className="note">Admin Rp 5.000</span>
      </div>
    </>
  )
}
