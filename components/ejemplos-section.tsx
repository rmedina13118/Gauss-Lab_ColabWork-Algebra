"use client"

import { useInView } from "@/hooks/use-in-view"
import { SectionHeading } from "./section-heading"

const examples = [
  {
    title: "Problema #1 - Infinitas Soluciones",
    equations: ["2x + 2y = 4", "x + y = 2"],
    matrix: [
      [2, 2, 4],
      [1, 1, 2],
    ],
    finalMatrix: [
      [1, 1, 2],
      [0, 0, 0],
    ],
    color: "50, 100%, 55%",
    result: "Infinitas Soluciones",
    analysis: [
      "Aparece una fila de ceros",
      "No hay contradiccion",
      "Sistema consistente pero no determinado",
      "Filas proporcionales",
      "Rango menor que el numero de variables",
    ],
  },
  {
    title: "Problema #2 - soluciónUnica",
    equations: ["x + y = 3", "2x - y = 3"],
    matrix: [
      [1, 1, 3],
      [2, -1, 3],
    ],
    finalMatrix: [
      [1, 0, 2],
      [0, 1, 1],
    ],
    color: "150, 100%, 50%",
    result: "soluciónUnica: X = 2, Y = 1",
    analysis: [
      "Sistema independiente",
      "Filas no proporcionales",
      "Rango igual al numero de variables",
      "Eliminacion gaussiana completa",
      "Las rectas se cruzan en un punto",
    ],
  },
]

function formatNum(n: number): string {
  return n.toString()
}

export function EjemplosSection() {
  return (
    <section id="ejemplos" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          tag="Practica"
          title="Ejemplos Aplicados"
          description="Problemas resueltos del informe del proyecto, mostrando el analisis completo de cada sistema."
        />
        <div className="grid md:grid-cols-2 gap-8">
          {examples.map((ex, i) => (
            <ExampleCard key={ex.title} example={ex} delay={i * 200} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ExampleCard({
  example,
  delay,
}: {
  example: (typeof examples)[number]
  delay: number
}) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={`glass-card rounded-xl overflow-hidden transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b"
        style={{
          borderColor: `hsla(${example.color}, 0.2)`,
          background: `hsla(${example.color}, 0.05)`,
        }}
      >
        <h3 className="font-mono font-bold text-[hsl(180,100%,95%)]">
          {example.title}
        </h3>
      </div>

      <div className="p-6">
        {/* Equations */}
        <div className="mb-4">
          <span className="text-xs font-mono text-[hsl(200,30%,50%)] uppercase tracking-wider">
            Sistema
          </span>
          <div className="mt-2 font-mono text-lg text-[hsl(180,100%,90%)]">
            {example.equations.map((eq) => (
              <div key={eq}>{eq}</div>
            ))}
          </div>
        </div>

        {/* Matrices */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-xs font-mono text-[hsl(200,30%,50%)] uppercase tracking-wider">
              Matriz aumentada
            </span>
            <div className="mt-2 p-3 rounded-lg bg-[hsl(220,25%,8%)] border border-[hsl(200,40%,15%)] font-mono text-sm text-[hsl(180,100%,90%)]">
              {example.matrix.map((row, ri) => (
                <div key={ri}>
                  [ {row.map((v, ci) => (
                    <span key={ci}>
                      {ci === 2 && <span className="text-[hsl(200,30%,40%)]">| </span>}
                      {ci === 2 ? (
                        <span style={{ color: `hsl(${example.color})` }}>{formatNum(v)}</span>
                      ) : (
                        formatNum(v)
                      )}
                      {ci < 2 && " "}
                    </span>
                  ))} ]
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-mono text-[hsl(200,30%,50%)] uppercase tracking-wider">
              Resultado Gauss
            </span>
            <div className="mt-2 p-3 rounded-lg bg-[hsl(220,25%,8%)] border border-[hsl(200,40%,15%)] font-mono text-sm text-[hsl(180,100%,90%)]">
              {example.finalMatrix.map((row, ri) => (
                <div key={ri}>
                  [ {row.map((v, ci) => (
                    <span key={ci}>
                      {ci === 2 && <span className="text-[hsl(200,30%,40%)]">| </span>}
                      {ci === 2 ? (
                        <span style={{ color: `hsl(${example.color})` }}>{formatNum(v)}</span>
                      ) : (
                        formatNum(v)
                      )}
                      {ci < 2 && " "}
                    </span>
                  ))} ]
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="mb-4">
          <span className="text-xs font-mono text-[hsl(200,30%,50%)] uppercase tracking-wider">
            Analisis
          </span>
          <ul className="mt-2 space-y-1.5">
            {example.analysis.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-[hsl(200,30%,65%)]">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: `hsl(${example.color})` }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Result */}
        <div
          className="px-4 py-3 rounded-lg text-center font-mono font-bold text-sm"
          style={{
            background: `hsla(${example.color}, 0.08)`,
            border: `1px solid hsla(${example.color}, 0.25)`,
            color: `hsl(${example.color})`,
          }}
        >
          {example.result}
        </div>
      </div>
    </div>
  )
}
