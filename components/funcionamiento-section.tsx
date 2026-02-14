"use client"

import { User, Bot, ArrowRight } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import { SectionHeading } from "./section-heading"

const userSteps = [
  "Ingresa los coeficientes del sistema 2x2",
]

const systemSteps = [
  "Construye la matriz aumentada",
  "Aplica eliminacion de Gauss",
  "Muestra la matriz escalonada resultante",
  "Determina el tipo de solucióndel sistema",
]

export function FuncionamientoSection() {
  const { ref: leftRef, isInView: leftVisible } = useInView()
  const { ref: rightRef, isInView: rightVisible } = useInView()

  return (
    <section id="funcionamiento" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          tag="Proceso"
          title="Como Funciona el Sistema"
          description="Un flujo interactivo donde el usuario ingresa los datos y el sistema procesa automaticamente la soluciónpaso a paso."
        />

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-start">
          {/* User column */}
          <div
            ref={leftRef}
            className={`glass-card rounded-xl p-6 transition-all duration-700 ${leftVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[hsl(170,100%,50%,0.12)] border border-[hsl(170,100%,50%,0.3)] flex items-center justify-center">
                <User className="text-[hsl(170,100%,50%)]" size={20} />
              </div>
              <h3 className="font-bold text-[hsl(180,100%,95%)] font-mono">
                El Usuario
              </h3>
            </div>
            <ul className="space-y-3">
              {userSteps.map((step) => (
                <li
                  key={step}
                  className="flex items-start gap-3 text-sm text-[hsl(200,30%,65%)]"
                >
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[hsl(170,100%,50%)] shrink-0" />
                  {step}
                </li>
              ))}
            </ul>

            {/* Visual matrix input */}
            <div className="mt-6 p-4 rounded-lg bg-[hsl(220,25%,8%)] border border-[hsl(170,100%,50%,0.1)] font-mono text-sm">
              <div className="text-[hsl(200,30%,50%)] mb-2">{"// Ejemplo de entrada"}</div>
              <div className="text-[hsl(170,100%,50%)]">
                {"a1*x + b1*y = c1"}
              </div>
              <div className="text-[hsl(170,100%,50%)]">
                {"a2*x + b2*y = c2"}
              </div>
            </div>
          </div>

          {/* Arrow connector */}
          <div className="hidden md:flex flex-col items-center justify-center py-12">
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-[hsl(170,100%,50%,0.5)] to-transparent" />
            <div className="w-10 h-10 rounded-full border border-[hsl(170,100%,50%,0.4)] flex items-center justify-center bg-[hsl(220,25%,8%)]">
              <ArrowRight className="text-[hsl(170,100%,50%)]" size={18} />
            </div>
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-[hsl(170,100%,50%,0.5)] to-transparent" />
          </div>

          {/* System column */}
          <div
            ref={rightRef}
            className={`glass-card rounded-xl p-6 transition-all duration-700 ${rightVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[hsl(200,100%,55%,0.12)] border border-[hsl(200,100%,55%,0.3)] flex items-center justify-center">
                <Bot className="text-[hsl(200,100%,55%)]" size={20} />
              </div>
              <h3 className="font-bold text-[hsl(180,100%,95%)] font-mono">
                El Sistema
              </h3>
            </div>
            <ul className="space-y-3">
              {systemSteps.map((step, i) => (
                <li
                  key={step}
                  className="flex items-start gap-3 text-sm text-[hsl(200,30%,65%)]"
                >
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[hsl(200,100%,55%,0.15)] border border-[hsl(200,100%,55%,0.4)] flex items-center justify-center shrink-0 text-[hsl(200,100%,55%)] text-xs font-mono font-bold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>

            {/* Visual matrix output */}
            <div className="mt-6 p-4 rounded-lg bg-[hsl(220,25%,8%)] border border-[hsl(200,100%,55%,0.1)] font-mono text-sm">
              <div className="text-[hsl(200,30%,50%)] mb-2">{"// Salida del sistema"}</div>
              <div className="text-[hsl(200,100%,70%)]">
                {"[ 1  0 | x ]"}
              </div>
              <div className="text-[hsl(200,100%,70%)]">
                {"[ 0  1 | y ]"}
              </div>
              <div className="mt-2 text-[hsl(150,100%,50%)]">
                {">> soluciónunica encontrada"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
