"use client"

import { Calendar, Image as ImageIcon } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import { SectionHeading } from "./section-heading"

const evidences = [
  {
    title: "Reunion de planificacion",
    date: "Semana 1",
    description: "Definicion de objetivos, roles y estructura del proyecto GaussLab.",
    image: "/sem1.jpeg",
  },
  {
    title: "Desarrollo del algoritmo",
    date: "Semana 2",
    description: "Implementacion del metodo de Gauss-Jordan y pruebas con distintos tipos de sistemas.",
    image: "/sem2.jpeg",
  },
  {
    title: "Integracion y presentacion",
    date: "Semana 3",
    description: "Integracion de la interfaz interactiva, redaccion del informe y preparacion de la presentacion final.",
    image: "/sem3.jpeg",
  },
]

export function EvidenciasSection() {
  return (
    <section id="evidencias" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          tag="Registro"
          title="Evidencias de Reuniones"
          description="Registro del proceso de trabajo colaborativo del equipo."
        />
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {evidences.map((ev, i) => (
            <EvidenceCard key={ev.title} {...ev} delay={i * 150} />
          ))}
        </div>
      </div>
    </section>
  )
}

function EvidenceCard({
  title,
  date,
  image,
  description,
  delay,
}: {
  title: string
  date: string
  image: string
  description: string
  delay: number
}) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={`glass-card rounded-xl overflow-hidden transition-all duration-700 hover:border-[hsl(200,100%,55%,0.3)] ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Image placeholder */}
      <div className="aspect-video bg-[hsl(220,25%,10%)] flex items-center justify-center border-b border-[hsl(200,40%,15%)]">
        <div className="text-center">
          <img src={image} width={100} height={100} alt={`evidence-${title}`} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="text-[hsl(200,100%,55%)]" size={14} />
          <span className="text-xs font-mono text-[hsl(200,100%,55%)]">{date}</span>
        </div>
        <h3 className="font-bold text-[hsl(180,100%,95%)] text-sm mb-1">{title}</h3>
        <p className="text-xs text-[hsl(200,30%,55%)] leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
