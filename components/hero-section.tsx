"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { MatrixRain } from "./matrix-rain"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <MatrixRain />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-40" aria-hidden="true" />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, hsl(170,100%,50%) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 text-center px-4 max-w-4xl mx-auto transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-[hsl(170,100%,50%,0.3)] bg-[hsl(170,100%,50%,0.08)]">
          <span className="w-2 h-2 rounded-full bg-[hsl(170,100%,50%)] animate-pulse-neon" />
          <span className="font-mono text-xs text-[hsl(170,100%,50%)] tracking-widest uppercase">
            Álgebra Lineal
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-4 text-[hsl(180,100%,95%)]">
          <span className="neon-text">DESAFIO</span>
          <br />
          <span className="text-[hsl(170,100%,50%)]">DE GAUSS</span>
        </h1>

        {/* Subtitle */}
        <p className="font-mono text-lg md:text-xl text-[hsl(200,100%,70%)] mb-4 tracking-wide">
          La mision del sistema &mdash; GaussLab
        </p>

        {/* Description */}
        <p className="text-base md:text-lg text-[hsl(200,30%,65%)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Un programa educativo e interactivo que resuelve sistemas de ecuaciones
          lineales 2x2 mediante matrices aumentadas, eliminacion gaussiana y el
          metodo Gauss-Jordan.
        </p>

        {/* CTA Button */}
        <a
          href="#demo"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-mono font-bold text-[hsl(220,25%,6%)] bg-[hsl(170,100%,50%)] hover:bg-[hsl(170,100%,60%)] transition-all animate-glow text-sm uppercase tracking-wider"
        >
          Iniciar simulacion
        </a>
      </div>

      {/* Scroll indicator */}
      <a
        href="#idea"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[hsl(170,100%,50%,0.6)] hover:text-[hsl(170,100%,50%)] transition-colors"
        aria-label="Desplazarse hacia abajo"
      >
        <span className="font-mono text-xs tracking-widest uppercase">
          Explorar
        </span>
        <ChevronDown className="animate-bounce" size={20} />
      </a>
    </section>
  )
}
