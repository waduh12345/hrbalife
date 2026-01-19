export default function ContactForm({ onChange }: { onChange: () => void }) {
  return (
    <>
      <div className="card-header">
        <h5>Contact Information</h5>
        <button onClick={onChange} className="link-action">
          Change
        </button>
      </div>

      <div className="info-row">
        <p><strong>Soni Setiawan</strong></p>
        <p>📞 0895-4058-73792</p>
        <p>📍 Jakarta Selatan</p>
      </div>
    </>
  )
}
