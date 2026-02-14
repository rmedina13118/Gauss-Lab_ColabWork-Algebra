"use client"

import { CheckCircle2, Infinity, XCircle } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import { SectionHeading } from "./section-heading"

const solutionTypes = [
  {
    icon: CheckCircle2,
    label: "solución Unica",
    color: "150, 100%, 50%",
    description:
      "El sistema tiene exactamente un par (x, y) que satisface ambas ecuaciones. El rango de la matriz es igual al numero de variables.",
    details: [
      "Sistema consistente e independiente",
      "Filas no proporcionales",
      "Rango = numero de variables",
      "Las rectas se cruzan en un punto",
    ],
  },
  {
    icon: Infinity,
    label: "Infinitas Soluciones",
    color: "50, 100%, 55%",
    description:
      "Las ecuaciones son proporcionales, representando la misma recta. Existe una fila de ceros sin contradiccion.",
    details: [
      "Sistema consistente pero dependiente",
      "Filas proporcionales",
      "Rango menor que las variables",
      "Las rectas se superponen",
    ],
  },
  {
    icon: XCircle,
    label: "Ninguna Solucion",
    color: "0, 80%, 55%",
    description:
      "El sistema es inconsistente. Aparece una fila tipo [0 0 | k] donde k es distinto de cero, indicando una contradiccion.",
    details: [
      "Sistema inconsistente",
      "Contradiccion en las filas",
      "No existe punto de interseccion",
      "Las rectas son paralelas",
    ],
  },
]

export function TiposSection() {
  return (
    <section id="soluciones" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          tag="Clasificacion"
          title="Tipos de Solución"
          description="Todo sistema de ecuaciones lineales 2x2 se clasifica en una de tres categorias segun la relacion entre sus filas y su rango."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {solutionTypes.map((type, i) => (
            <SolutionCard key={type.label} {...type} delay={i * 150} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SolutionCard({
  icon: Icon,
  label,
  color,
  description,
  details,
  delay,
}: {
  icon: typeof CheckCircle2
  label: string
  color: string
  description: string
  details: string[]
  delay: number
}) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={`glass-card rounded-xl p-6 transition-all duration-700 hover:scale-[1.02] ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      style={{
        transitionDelay: `${delay}ms`,
        borderColor: `hsla(${color}, 0.2)`,
      }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `hsla(${color}, 0.1)`,
          border: `1px solid hsla(${color}, 0.3)`,
        }}
      >
        <Icon style={{ color: `hsl(${color})` }} size={28} />
      </div>
      <h3 className="text-xl font-bold text-[hsl(180,100%,95%)] mb-2">{label}</h3>
      <p className="text-sm text-[hsl(200,30%,60%)] leading-relaxed mb-4">
        {description}
      </p>
      <ul className="space-y-2">
        {details.map((detail) => (
          <li
            key={detail}
            className="flex items-center gap-2 text-xs font-mono"
            style={{ color: `hsl(${color})` }}
          >
            <span
              className="w-1 h-1 rounded-full shrink-0"
              style={{ background: `hsl(${color})` }}
            />
            {detail}
          </li>
        ))}
      </ul>
    </div>
  )
}
