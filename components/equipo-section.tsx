"use client"

import { User, Mail } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import { SectionHeading } from "./section-heading"

const members = [
  { name: "Richard Medina", role: "Integrante" },
  { name: "Yefereson Andrada", role: "Integrante" },
  { name: "Agustin Benegas", role: "Integrante" },
  { name: "Josefina Carabajal", role: "Integrante" },
]

export function EquipoSection() {
  return (
    <section id="equipo" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          tag="Equipo"
          title="Equipo de Trabajo"
          description="Los integrantes que colaboraron en el desarrollo de este proyecto."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {members.map((member, i) => (
            <MemberCard key={member.name} {...member} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  )
}

function MemberCard({
  name,
  role,
  delay,
}: {
  name: string
  role: string
  delay: number
}) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={`glass-card rounded-xl p-6 text-center transition-all duration-700 hover:border-[hsl(170,100%,50%,0.4)] group ${isInView ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-[hsl(170,100%,50%,0.08)] border border-[hsl(170,100%,50%,0.25)] flex items-center justify-center mx-auto mb-4 group-hover:neon-border transition-all">
        <User className="text-[hsl(170,100%,50%)]" size={28} />
      </div>
      <h3 className="font-bold text-[hsl(180,100%,95%)] mb-1">{name}</h3>
      <p className="text-xs font-mono text-[hsl(200,30%,55%)] mb-3">{role}</p>

      {/* Placeholder links */}
      <div className="flex justify-center gap-3">
        <div className="w-8 h-8 rounded-md bg-[hsl(220,25%,12%)] border border-[hsl(200,40%,20%)] flex items-center justify-center text-[hsl(200,30%,50%)] hover:text-[hsl(170,100%,50%)] hover:border-[hsl(170,100%,50%,0.3)] transition-all cursor-default">
          <Mail size={14} />
        </div>
      </div>
    </div>
  )
}
