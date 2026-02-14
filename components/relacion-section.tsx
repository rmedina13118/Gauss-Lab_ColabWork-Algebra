"use client"

import { BookOpen, Code2, Eye, Brain } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import { SectionHeading } from "./section-heading"

const connections = [
  {
    icon: BookOpen,
    title: "Segunda Semana de Algebra Lineal",
    description:
      "El proyecto abarca directamente los contenidos de la segunda semana: sistemas de ecuaciones lineales, matrices aumentadas y eliminacion gaussiana.",
  },
  {
    icon: Brain,
    title: "Aplicacion Practica de Teoria",
    description:
      "Transforma conceptos abstractos como el rango de una matriz y la consistencia de un sistema en una experiencia tangible y comprensible.",
  },
  {
    icon: Code2,
    title: "Integracion Matematica + Programacion",
    description:
      "Combina la programacion funcional con la matematica, permitiendo al estudiante ver el algoritmo de Gauss-Jordan en accion en cada paso.",
  },
  {
    icon: Eye,
    title: "Interpretacion Geometrica",
    description:
      "Cada tipo de solución tiene una interpretacion visual: rectas que se cruzan, se superponen o son paralelas, conectando lo algebraico con lo geometrico.",
  },
]

export function RelacionSection() {
  return (
    <section id="curso" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          tag="Academico"
          title="Relacion con el Curso"
          description="Este proyecto demuestra la comprension profunda de los temas tratados en Algebra Lineal FMA-121, integrando teoria y practica."
        />
        <div className="grid sm:grid-cols-2 gap-6">
          {connections.map((conn, i) => (
            <ConnectionCard key={conn.title} {...conn} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ConnectionCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: typeof BookOpen
  title: string
  description: string
  delay: number
}) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={`glass-card rounded-xl p-6 flex gap-4 transition-all duration-700 hover:border-[hsl(170,100%,50%,0.3)] ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-10 h-10 rounded-lg bg-[hsl(170,100%,50%,0.1)] border border-[hsl(170,100%,50%,0.25)] flex items-center justify-center shrink-0">
        <Icon className="text-[hsl(170,100%,50%)]" size={20} />
      </div>
      <div>
        <h3 className="font-bold text-[hsl(180,100%,95%)] mb-1">{title}</h3>
        <p className="text-sm text-[hsl(200,30%,60%)] leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
