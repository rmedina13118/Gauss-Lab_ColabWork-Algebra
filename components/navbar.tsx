"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Idea", href: "#idea" },
  { label: "Objetivo", href: "#objetivo" },
  { label: "Funcionamiento", href: "#funcionamiento" },
  { label: "Demo", href: "#demo" },
  { label: "Soluciones", href: "#soluciones" },
  { label: "Ejemplos", href: "#ejemplos" },
  { label: "Curso", href: "#curso" },
  { label: "Equipo", href: "#equipo" },
  { label: "Evidencias", href: "#evidencias" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[hsl(220,25%,6%)]/90 backdrop-blur-md border-b border-[hsl(170,100%,50%,0.15)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <a
          href="#inicio"
          className="font-mono text-lg font-bold tracking-wider text-[hsl(170,100%,50%)]"
        >
          {"<"}GaussLab{"/>"}
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-mono text-[hsl(180,100%,90%)] hover:text-[hsl(170,100%,50%)] transition-colors rounded-md hover:bg-[hsl(170,100%,50%,0.08)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-[hsl(170,100%,50%)]"
          aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[hsl(220,25%,6%)]/95 backdrop-blur-md border-b border-[hsl(170,100%,50%,0.15)] px-4 pb-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 font-mono text-sm text-[hsl(180,100%,90%)] hover:text-[hsl(170,100%,50%)] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
