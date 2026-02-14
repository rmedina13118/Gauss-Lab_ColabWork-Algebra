"use client"

import { Beaker, GraduationCap, Monitor } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import { SectionHeading } from "./section-heading"

const cards = [
  {
    icon: Beaker,
    title: "Desafio de Gauss",
    description:
      "Un programa especial de interaccion de experiencias para resolver sistemas de ecuaciones lineales, utilizando varias metodologias y el uso de eliminacion de Gauss y Gauss-Jordan para analizar distintos escenarios.",
  },
  {
    icon: GraduationCap,
    title: "Analista Matematico",
    description:
      "El estudiante asume el rol de analista academico dentro de un laboratorio virtual llamado GaussLab, donde debe resolver sistemas de ecuaciones como parte de una mision interactiva.",
  },
  {
    icon: Monitor,
    title: "Laboratorio Virtual",
    description:
      "GaussLab es un ambiente amigable donde el estudiante puede llegar a entender el sistema antes de resolverlo, entendiendo los procesos necesarios para la soluciónde diferentes problemas.",
  },
]

export function IdeaSection() {
  return (
    <section id="idea" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          tag="Concepto"
          title="Idea General del Proyecto"
          description="Un proyecto que integra la matematica con la programacion funcional, transformando la teoria abstracta del algebra lineal en una experiencia interactiva."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <IdeaCard key={card.title} {...card} delay={i * 150} />
          ))}
        </div>
      </div>
    </section>
  )
}

function IdeaCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: typeof Beaker
  title: string
  description: string
  delay: number
}) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={`glass-card rounded-xl p-6 transition-all duration-700 hover:border-[hsl(170,100%,50%,0.4)] group ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-lg bg-[hsl(170,100%,50%,0.1)] border border-[hsl(170,100%,50%,0.25)] flex items-center justify-center mb-4 group-hover:neon-border transition-all">
        <Icon className="text-[hsl(170,100%,50%)]" size={24} />
      </div>
      <h3 className="text-lg font-bold text-[hsl(180,100%,95%)] mb-2">{title}</h3>
      <p className="text-sm text-[hsl(200,30%,60%)] leading-relaxed">{description}</p>
    </div>
  )
}
