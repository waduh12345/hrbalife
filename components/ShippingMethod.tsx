export default function ShippingMethod({ onChange }: { onChange: () => void }) {
  return (
    <>
      <div className="card-header">
        <h5>Shipping Method</h5>
        <button onClick={onChange} className="link-action">
          Change
        </button>
      </div>

      <div className="shipping-row">
        <div>
          <p className="label">Shipping</p>
          <h6>JNE REG (2–3 hari)</h6>
        </div>
        <div className="price">Rp 25.000</div>
      </div>
    </>
  )
}
