import gsap from 'gsap'

export function flyToCart(
  imageEl: HTMLImageElement,
  cartEl: HTMLElement
) {
  const clone = imageEl.cloneNode(true) as HTMLImageElement
  const rect = imageEl.getBoundingClientRect()
  const cartRect = cartEl.getBoundingClientRect()

  clone.style.position = 'fixed'
  clone.style.left = rect.left + 'px'
  clone.style.top = rect.top + 'px'
  clone.style.width = rect.width + 'px'
  clone.style.zIndex = '9999'
  clone.style.pointerEvents = 'none'

  document.body.appendChild(clone)

  gsap.to(clone, {
    x: cartRect.left - rect.left,
    y: cartRect.top - rect.top,
    scale: 0.2,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    onComplete: () => clone.remove(),
  })
}
