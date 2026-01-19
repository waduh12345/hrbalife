"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Instagram,
  Facebook,
  Youtube,
  ArrowUp,
  ArrowUpRight,
  Send,
} from "lucide-react";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  const [sending, setSending] = useState(false);

  /* =====================
      GSAP Reveal
  ===================== */
  useEffect(() => {
    if (!contentRef.current) return;

    const elements = contentRef.current.querySelectorAll(
      "[data-footer-animate]",
    );

    gsap.fromTo(
      elements,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 85%",
        },
      },
    );
  }, []);

  /* =====================
      Back To Top Logic
  ===================== */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitNewsletter = () => {
    setSending(true);
    setTimeout(() => setSending(false), 1500);
  };

  const socialLinks = [
    { icon: <Instagram size={18} />, href: "#" },
    { icon: <Facebook size={18} />, href: "#" },
    { icon: <Youtube size={18} />, href: "#" },
  ];

  const productLinks = ["Pencernaan", "Energi", "Imunitas", "Detoks"];
  const helpLinks = ["FAQ", "Cara Pemesanan", "Pengembalian", "Hubungi Kami"];

  return (
    <footer
      className="relative mt-32 w-full isolate"
      style={{ backgroundColor: "#1F3A2B", color: "#FFFFFF" }}
    >
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* MAIN CONTENT */}
      <div ref={contentRef} className="max-w-7xl mx-auto px-6 md:px-10 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* 1. BRAND & VISION */}
          <div
            className="md:col-span-12 lg:col-span-5 flex flex-col justify-between"
            data-footer-animate
          >
            <div className="space-y-6">
              <h3 className="text-3xl md:text-4xl font-semibold tracking-tight !text-white">
                HerbalCare
              </h3>

              {/* PERBAIKAN 1: Deskripsi dipaksa putih */}
              <p
                className="!text-white !opacity-100 text-base leading-relaxed max-w-sm"
                style={{ color: "#FFFFFF" }} // Inline style force
              >
                Menghadirkan kebaikan alam untuk gaya hidup modern yang
                seimbang. Murni, alami, dan berkelanjutan.
              </p>
            </div>

            {/* Newsletter */}
            <div className="mt-8 md:mt-10 max-w-md">
              <label className="text-xs font-medium text-[#88B04B] mb-3 block uppercase tracking-wider">
                Dapatkan Info Terbaru
              </label>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="Alamat email anda"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/60 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#88B04B]/50 focus:bg-white/10 transition-all duration-300 pr-14 backdrop-blur-sm"
                />
                <button
                  onClick={submitNewsletter}
                  disabled={sending}
                  className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-[#88B04B] hover:bg-[#7a9e43] text-white flex items-center justify-center transition-all shadow-lg hover:shadow-[#88B04B]/20"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={18} className="-ml-0.5 mt-0.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 2. NAVIGATION LINKS */}
          <div
            className="md:col-span-6 lg:col-span-4 grid grid-cols-2 gap-8"
            data-footer-animate
          >
            <div>
              <h4 className="text-sm font-medium !text-white mb-6 uppercase tracking-wider opacity-90">
                Produk
              </h4>
              <ul className="space-y-4">
                {productLinks.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="group flex items-center gap-2 text-white/80 hover:!text-[#88B04B] transition-colors duration-300"
                    >
                      <span className="text-sm">{item}</span>
                      <ArrowUpRight
                        size={14}
                        className="opacity-0 -translate-y-1 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium !text-white mb-6 uppercase tracking-wider opacity-90">
                Bantuan
              </h4>
              <ul className="space-y-4">
                {helpLinks.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="group flex items-center gap-2 text-white/80 hover:!text-[#88B04B] transition-colors duration-300"
                    >
                      <span className="text-sm">{item}</span>
                      <ArrowUpRight
                        size={14}
                        className="opacity-0 -translate-y-1 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. SOCIAL */}
          <div
            className="md:col-span-6 lg:col-span-3 flex flex-col justify-between h-full"
            data-footer-animate
          >
            <div>
              <h4 className="text-sm font-medium !text-white mb-6 uppercase tracking-wider opacity-90">
                Ikuti Kami
              </h4>
              <div className="flex gap-3">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/80 hover:!text-white hover:bg-[#88B04B] hover:border-[#88B04B] transition-all duration-300"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col-reverse md:flex-row justify-between items-center gap-6">
          {/* PERBAIKAN 2: Copyright dipaksa putih total */}
          <p
            className="text-xs !text-white !opacity-100 font-medium"
            style={{ color: "#FFFFFF" }} // Inline style force
          >
            © {new Date().getFullYear()} HerbalCare. Hak Cipta Dilindungi.
          </p>

          <div className="flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity duration-500">
            <div className="w-8 h-8 relative grayscale hover:grayscale-0 transition-all">
              <Image
                src="/logo-halal.jpg"
                alt="Halal"
                fill
                className="object-contain rounded-full"
              />
            </div>
            <div className="w-1 h-4 bg-white/20 rounded-full"></div>
            <div className="w-8 h-8 relative grayscale hover:grayscale-0 transition-all">
              <Image
                src="/logo-mui.jpg"
                alt="MUI"
                fill
                className="object-contain rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full bg-[#88B04B] text-white shadow-2xl hover:bg-[#7a9e43] transition-all duration-500 transform
          ${showTop ? "translate-y-0 opacity-100 rotate-0" : "translate-y-16 opacity-0 rotate-45"}
        `}
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  );
}