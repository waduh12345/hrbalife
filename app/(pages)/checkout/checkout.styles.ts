// app/checkout/checkout.styles.ts
export const checkoutStyles = `
.checkout-root {
  background: #f9f7f2;
  padding: 40px 20px;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 40px;
}

@media (max-width: 1024px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #fff;
  padding: 28px;
  border-radius: 18px;
  margin-bottom: 24px;
}

.summary-card {
  position: sticky;
  top: 120px;
  background: #fff;
  padding: 32px;
  border-radius: 22px;
}

.btn-primary {
  width: 100%;
  background: #3a291a;
  color: #fff;
  padding: 16px;
  border-radius: 999px;
  margin-top: 20px;
}

.whatsapp-cta {
  margin-top: 16px;
  display: block;
  text-align: center;
  font-weight: 600;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.link-action {
  font-size: 13px;
  text-decoration: underline;
  cursor: pointer;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-box {
  background: #fff;
  width: 100%;
  max-width: 460px;
  border-radius: 18px;
  padding: 24px;
}

`