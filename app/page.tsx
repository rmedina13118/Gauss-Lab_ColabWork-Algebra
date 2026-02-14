"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { IdeaSection } from "@/components/idea-section"
import { ObjetivoSection } from "@/components/objetivo-section"
import { FuncionamientoSection } from "@/components/funcionamiento-section"
import { DemoSection } from "@/components/demo-section"
import { JavaPrototypeSection } from "@/components/java-prototype-section"
import { TiposSection } from "@/components/tipos-section"
import { EjemplosSection } from "@/components/ejemplos-section"
import { RelacionSection } from "@/components/relacion-section"
import { EquipoSection } from "@/components/equipo-section"
import { EvidenciasSection } from "@/components/evidencias-section"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <main className="relative min-h-screen bg-[hsl(220,25%,6%)] overflow-hidden">
      <Navbar />
      <HeroSection />

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(170,100%,50%,0.3)] to-transparent" />

      <IdeaSection />

      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(200,100%,55%,0.2)] to-transparent" />

      <ObjetivoSection />

      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(170,100%,50%,0.3)] to-transparent" />

      <FuncionamientoSection />

      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(200,100%,55%,0.2)] to-transparent" />

      <DemoSection />

      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(40,100%,55%,0.2)] to-transparent" />

      <JavaPrototypeSection />

      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(170,100%,50%,0.3)] to-transparent" />

      <TiposSection />

      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(200,100%,55%,0.2)] to-transparent" />

      <EjemplosSection />

      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(170,100%,50%,0.3)] to-transparent" />

      <RelacionSection />

      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(200,100%,55%,0.2)] to-transparent" />

      <EquipoSection />

      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(170,100%,50%,0.3)] to-transparent" />

      <EvidenciasSection />

      <Footer />
    </main>
  )
}
