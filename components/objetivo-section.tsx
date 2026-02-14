"use client"

import { Grid3X3, ArrowDownUp, Rows3, Calculator } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import { SectionHeading } from "./section-heading"

const concepts = [
  {
    icon: Grid3X3,
    label: "Matrices Aumentadas",
    description:
      "Representacion compacta del sistema de ecuaciones como una matriz que incluye los coeficientes y los terminos independientes.",
  },
  {
    icon: ArrowDownUp,
    label: "Eliminacion Gaussiana",
    description:
      "Aplicacion de operaciones elementales por filas para reducir la matriz a forma escalonada, simplificando la resolución del sistema.",
  },
  {
    icon: Rows3,
    label: "Matrices Escalonadas",
    description:
      "Forma reducida de la matriz donde se identifica el rango y el tipo de solucion: unica, infinitas o ninguna.",
  },
  {
    icon: Calculator,
    label: "Operaciones por Filas",
    description:
      "Intercambio, multiplicacion por escalar y combinacion lineal de filas para transformar la matriz paso a paso.",
  },
]

export function ObjetivoSection() {
  return (
    <section id="objetivo" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          tag="Objetivo"
          title="Objetivo del Proyecto"
          description="Aplicar los conceptos de la segunda semana de Algebra Lineal: eliminacion gaussiana, matrices escalonadas y determinantes elementales por filas."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {concepts.map((c, i) => (
            <ConceptCard key={c.label} {...c} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ConceptCard({
  icon: Icon,
  label,
  description,
  delay,
}: {
  icon: typeof Grid3X3
  label: string
  description: string
  delay: number
}) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={`glass-card rounded-xl p-6 text-center transition-all duration-700 hover:border-[hsl(200,100%,55%,0.4)] group ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 rounded-full bg-[hsl(200,100%,55%,0.1)] border border-[hsl(200,100%,55%,0.25)] flex items-center justify-center mx-auto mb-4 group-hover:neon-border-blue transition-all">
        <Icon className="text-[hsl(200,100%,55%)]" size={26} />
      </div>
      <h3 className="font-bold text-[hsl(180,100%,95%)] mb-2">{label}</h3>
      <p className="text-sm text-[hsl(200,30%,60%)] leading-relaxed">{description}</p>
    </div>
  )
}
