"use client"

import { useState, useCallback } from "react"
import { Play, RotateCcw, ChevronRight, HelpCircle } from "lucide-react"
import { SectionHeading } from "./section-heading"

type SolutionType = "unica" | "infinitas" | "ninguna" | null

interface Step {
  label: string
  matrix: number[][]
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toString()
  return n.toFixed(4).replace(/\.?0+$/, "")
}

function solveGaussJordan(
  a1: number,
  b1: number,
  c1: number,
  a2: number,
  b2: number,
  c2: number
): { steps: Step[]; type: SolutionType; x?: number; y?: number } {
  const steps: Step[] = []
  let m = [
    [a1, b1, c1],
    [a2, b2, c2],
  ]

  steps.push({
    label: "Matriz aumentada inicial",
    matrix: m.map((r) => [...r]),
  })

  // Step 1: Make m[0][0] = 1
  if (m[0][0] === 0 && m[1][0] !== 0) {
    m = [m[1], m[0]]
    steps.push({
      label: "Intercambio F1 <-> F2",
      matrix: m.map((r) => [...r]),
    })
  }

  if (m[0][0] === 0) {
    // Both a1 and a2 are 0
    if (m[0][1] === 0 && m[1][1] === 0) {
      // All coefficients are 0
      if (m[0][2] !== 0 || m[1][2] !== 0) {
        return { steps, type: "ninguna" }
      }
      return { steps, type: "infinitas" }
    }
    // Rearrange so pivot is in first position if possible
    if (m[0][1] !== 0) {
      const factor = 1 / m[0][1]
      m[0] = m[0].map((v) => v * factor)
      steps.push({
        label: `F1 = F1 * (1/${formatNum(1 / factor)})`,
        matrix: m.map((r) => [...r]),
      })
    }
  } else {
    if (m[0][0] !== 1) {
      const factor = m[0][0]
      m[0] = m[0].map((v) => v / factor)
      steps.push({
        label: `F1 = F1 / ${formatNum(factor)}`,
        matrix: m.map((r) => [...r]),
      })
    }
  }

  // Step 2: Eliminate m[1][0]
  if (m[1][0] !== 0) {
    const factor = m[1][0]
    m[1] = m[1].map((v, j) => v - factor * m[0][j])
    steps.push({
      label: `F2 = F2 - (${formatNum(factor)}) * F1`,
      matrix: m.map((r) => [...r]),
    })
  }

  // Check for zero row
  const isZeroRow =
    Math.abs(m[1][0]) < 1e-10 && Math.abs(m[1][1]) < 1e-10

  if (isZeroRow) {
    if (Math.abs(m[1][2]) > 1e-10) {
      steps.push({
        label: "Fila [0 0 | k] con k != 0 => Contradiccion",
        matrix: m.map((r) => [...r]),
      })
      return { steps, type: "ninguna" }
    }
    steps.push({
      label: "Fila de ceros sin contradiccion => Infinitas soluciones",
      matrix: m.map((r) => [...r]),
    })
    return { steps, type: "infinitas" }
  }

  // Step 3: Make m[1][1] = 1
  if (Math.abs(m[1][1]) > 1e-10 && m[1][1] !== 1) {
    const factor = m[1][1]
    m[1] = m[1].map((v) => v / factor)
    steps.push({
      label: `F2 = F2 / ${formatNum(factor)}`,
      matrix: m.map((r) => [...r]),
    })
  }

  // Step 4: Eliminate m[0][1]
  if (Math.abs(m[0][1]) > 1e-10) {
    const factor = m[0][1]
    m[0] = m[0].map((v, j) => v - factor * m[1][j])
    steps.push({
      label: `F1 = F1 - (${formatNum(factor)}) * F2`,
      matrix: m.map((r) => [...r]),
    })
  }

  const x = m[0][2]
  const y = m[1][2]

  return { steps, type: "unica", x, y }
}

export function DemoSection() {
  const [a1, setA1] = useState("")
  const [b1, setB1] = useState("")
  const [c1, setC1] = useState("")
  const [a2, setA2] = useState("")
  const [b2, setB2] = useState("")
  const [c2, setC2] = useState("")

  const [result, setResult] = useState<ReturnType<typeof solveGaussJordan> | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [showSteps, setShowSteps] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState<SolutionType>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const handleSolve = useCallback(() => {
    const nums = [a1, b1, c1, a2, b2, c2].map(Number)
    if (nums.some(isNaN)) return
    const res = solveGaussJordan(nums[0], nums[1], nums[2], nums[3], nums[4], nums[5])
    setResult(res)
    setCurrentStep(0)
    setShowSteps(false)
    setQuizAnswer(null)
    setShowQuiz(true)
    setQuizSubmitted(false)
  }, [a1, b1, c1, a2, b2, c2])

  const handleReset = () => {
    setA1(""); setB1(""); setC1("")
    setA2(""); setB2(""); setC2("")
    setResult(null)
    setCurrentStep(0)
    setShowSteps(false)
    setShowQuiz(false)
    setQuizAnswer(null)
    setQuizSubmitted(false)
  }

  const loadExample = (ex: number) => {
    if (ex === 1) {
      setA1("2"); setB1("2"); setC1("4")
      setA2("1"); setB2("1"); setC2("2")
    } else if (ex === 2) {
      setA1("1"); setB1("1"); setC1("3")
      setA2("2"); setB2("-1"); setC2("3")
    } else {
      setA1("1"); setB1("2"); setC1("5")
      setA2("2"); setB2("4"); setC2("7")
    }
    setResult(null)
    setShowQuiz(false)
    setQuizSubmitted(false)
  }

  const inputClass =
    "w-16 h-12 text-center font-mono text-lg rounded-lg bg-[hsl(220,25%,8%)] border border-[hsl(170,100%,50%,0.25)] text-[hsl(180,100%,95%)] focus:outline-none focus:border-[hsl(170,100%,50%)] focus:neon-border transition-all"

  return (
    <section id="demo" className="relative py-24 px-4">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, hsla(170,100%,50%,0.03) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto">
        <SectionHeading
          tag="Simulacion"
          title="Demo Interactiva"
          description="Ingresa los coeficientes de un sistema 2x2 y observa como se resuelve paso a paso mediante eliminacion gaussiana."
        />

        {/* Input area */}
        <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[hsl(170,100%,50%)] animate-pulse-neon" />
            <h3 className="font-mono text-sm text-[hsl(170,100%,50%)] tracking-wider uppercase">
              Ingreso de coeficientes
            </h3>
          </div>

          {/* Equation 1 */}
          <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
            <input
              type="number"
              value={a1}
              onChange={(e) => setA1(e.target.value)}
              className={inputClass}
              placeholder="a1"
              aria-label="Coeficiente a1"
            />
            <span className="font-mono text-[hsl(170,100%,50%)] text-lg">x +</span>
            <input
              type="number"
              value={b1}
              onChange={(e) => setB1(e.target.value)}
              className={inputClass}
              placeholder="b1"
              aria-label="Coeficiente b1"
            />
            <span className="font-mono text-[hsl(170,100%,50%)] text-lg">y =</span>
            <input
              type="number"
              value={c1}
              onChange={(e) => setC1(e.target.value)}
              className={inputClass}
              placeholder="c1"
              aria-label="Termino independiente c1"
            />
          </div>

          {/* Equation 2 */}
          <div className="flex flex-wrap items-center gap-2 mb-8 justify-center">
            <input
              type="number"
              value={a2}
              onChange={(e) => setA2(e.target.value)}
              className={inputClass}
              placeholder="a2"
              aria-label="Coeficiente a2"
            />
            <span className="font-mono text-[hsl(170,100%,50%)] text-lg">x +</span>
            <input
              type="number"
              value={b2}
              onChange={(e) => setB2(e.target.value)}
              className={inputClass}
              placeholder="b2"
              aria-label="Coeficiente b2"
            />
            <span className="font-mono text-[hsl(170,100%,50%)] text-lg">y =</span>
            <input
              type="number"
              value={c2}
              onChange={(e) => setC2(e.target.value)}
              className={inputClass}
              placeholder="c2"
              aria-label="Termino independiente c2"
            />
          </div>

          {/* Quick examples */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <span className="text-xs font-mono text-[hsl(200,30%,50%)]">Ejemplos rapidos:</span>
            <button
              onClick={() => loadExample(1)}
              className="px-3 py-1.5 text-xs font-mono rounded-md border border-[hsl(200,100%,55%,0.3)] text-[hsl(200,100%,70%)] hover:bg-[hsl(200,100%,55%,0.1)] transition-colors"
            >
              Infinitas
            </button>
            <button
              onClick={() => loadExample(2)}
              className="px-3 py-1.5 text-xs font-mono rounded-md border border-[hsl(150,100%,50%,0.3)] text-[hsl(150,100%,70%)] hover:bg-[hsl(150,100%,50%,0.1)] transition-colors"
            >
              Unica
            </button>
            <button
              onClick={() => loadExample(3)}
              className="px-3 py-1.5 text-xs font-mono rounded-md border border-[hsl(0,80%,55%,0.3)] text-[hsl(0,80%,70%)] hover:bg-[hsl(0,80%,55%,0.1)] transition-colors"
            >
              Ninguna
            </button>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleSolve}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold text-sm text-[hsl(220,25%,6%)] bg-[hsl(170,100%,50%)] hover:bg-[hsl(170,100%,60%)] transition-all uppercase tracking-wider"
            >
              <Play size={16} /> Aplicar Gauss-Jordan
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold text-sm border border-[hsl(170,100%,50%,0.3)] text-[hsl(170,100%,50%)] hover:bg-[hsl(170,100%,50%,0.08)] transition-all uppercase tracking-wider"
            >
              <RotateCcw size={16} /> Reiniciar
            </button>
          </div>
        </div>

        {/* Quiz */}
        {showQuiz && result && !quizSubmitted && (
          <div className="glass-card rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="text-[hsl(50,100%,55%)]" size={20} />
              <h3 className="font-mono text-sm text-[hsl(50,100%,55%)] tracking-wider uppercase">
                Antes de ver el resultado...
              </h3>
            </div>
            <p className="text-[hsl(180,100%,95%)] mb-6 text-center text-lg">
              Que tipo de solucion crees que tiene el sistema?
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {(["unica", "infinitas", "ninguna"] as SolutionType[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setQuizAnswer(opt)}
                  className={`px-5 py-3 rounded-lg font-mono text-sm border transition-all ${
                    quizAnswer === opt
                      ? "border-[hsl(170,100%,50%)] bg-[hsl(170,100%,50%,0.15)] text-[hsl(170,100%,50%)]"
                      : "border-[hsl(200,40%,20%)] text-[hsl(200,30%,60%)] hover:border-[hsl(200,40%,35%)]"
                  }`}
                >
                  {opt === "unica" ? "Solucion Unica" : opt === "infinitas" ? "Infinitas Soluciones" : "Ninguna Solucion"}
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={!quizAnswer}
                className="px-6 py-3 rounded-lg font-mono text-sm font-bold bg-[hsl(170,100%,50%)] text-[hsl(220,25%,6%)] hover:bg-[hsl(170,100%,60%)] disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
              >
                Verificar respuesta
              </button>
            </div>
          </div>
        )}

        {/* Quiz result */}
        {quizSubmitted && result && (
          <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in-up">
            <div className="text-center">
              {quizAnswer === result.type ? (
                <div className="text-[hsl(150,100%,50%)] font-mono text-lg font-bold mb-2">
                  Correcto!
                </div>
              ) : (
                <div className="text-[hsl(0,80%,60%)] font-mono text-lg font-bold mb-2">
                  Incorrecto
                </div>
              )}
              <p className="text-[hsl(200,30%,60%)] text-sm">
                El sistema tiene:{" "}
                <span className="text-[hsl(170,100%,50%)] font-bold">
                  {result.type === "unica"
                    ? "Solucion Unica"
                    : result.type === "infinitas"
                    ? "Infinitas Soluciones"
                    : "Ninguna Solucion"}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && quizSubmitted && (
          <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[hsl(200,100%,55%)] animate-pulse-neon" />
                <h3 className="font-mono text-sm text-[hsl(200,100%,55%)] tracking-wider uppercase">
                  Resultado
                </h3>
              </div>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex items-center gap-1 text-xs font-mono text-[hsl(170,100%,50%)] border border-[hsl(170,100%,50%,0.3)] px-3 py-1.5 rounded-md hover:bg-[hsl(170,100%,50%,0.08)] transition-colors"
              >
                <ChevronRight
                  size={14}
                  className={`transition-transform ${showSteps ? "rotate-90" : ""}`}
                />
                Ver proceso paso a paso
              </button>
            </div>

            {/* Solution type badge */}
            <div className="flex justify-center mb-6">
              <span
                className={`px-5 py-2 rounded-full font-mono text-sm font-bold border ${
                  result.type === "unica"
                    ? "border-[hsl(150,100%,50%,0.4)] bg-[hsl(150,100%,50%,0.1)] text-[hsl(150,100%,50%)]"
                    : result.type === "infinitas"
                    ? "border-[hsl(50,100%,55%,0.4)] bg-[hsl(50,100%,55%,0.1)] text-[hsl(50,100%,55%)]"
                    : "border-[hsl(0,80%,55%,0.4)] bg-[hsl(0,80%,55%,0.1)] text-[hsl(0,80%,55%)]"
                }`}
              >
                {result.type === "unica"
                  ? `Solucion Unica: x = ${formatNum(result.x!)}, y = ${formatNum(result.y!)}`
                  : result.type === "infinitas"
                  ? "Infinitas Soluciones"
                  : "Ninguna Solucion (Sistema Inconsistente)"}
              </span>
            </div>

            {/* Step-by-step */}
            {showSteps && (
              <div className="space-y-4 animate-fade-in-up">
                {result.steps.map((step, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border transition-all duration-500 ${
                      i <= currentStep
                        ? "bg-[hsl(220,25%,8%)] border-[hsl(170,100%,50%,0.2)] opacity-100"
                        : "bg-[hsl(220,25%,8%,0.5)] border-[hsl(200,40%,15%)] opacity-40"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full bg-[hsl(170,100%,50%,0.15)] border border-[hsl(170,100%,50%,0.4)] text-[hsl(170,100%,50%)] text-xs font-mono font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-mono text-xs text-[hsl(170,100%,50%)]">
                        {step.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 font-mono">
                      <span className="text-[hsl(200,30%,45%)] text-2xl">[</span>
                      <div className="text-center">
                        <div className="text-[hsl(180,100%,90%)]">
                          {formatNum(step.matrix[0][0])}{" "}
                          <span className="mx-2">{formatNum(step.matrix[0][1])}</span>
                          <span className="text-[hsl(200,30%,40%)]">|</span>{" "}
                          <span className="text-[hsl(170,100%,50%)]">
                            {formatNum(step.matrix[0][2])}
                          </span>
                        </div>
                        <div className="text-[hsl(180,100%,90%)]">
                          {formatNum(step.matrix[1][0])}{" "}
                          <span className="mx-2">{formatNum(step.matrix[1][1])}</span>
                          <span className="text-[hsl(200,30%,40%)]">|</span>{" "}
                          <span className="text-[hsl(170,100%,50%)]">
                            {formatNum(step.matrix[1][2])}
                          </span>
                        </div>
                      </div>
                      <span className="text-[hsl(200,30%,45%)] text-2xl">]</span>
                    </div>
                  </div>
                ))}

                {/* Step navigation */}
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="px-4 py-2 rounded-md font-mono text-xs border border-[hsl(200,40%,20%)] text-[hsl(200,30%,60%)] hover:border-[hsl(170,100%,50%,0.3)] disabled:opacity-30 transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-2 font-mono text-xs text-[hsl(200,30%,50%)]">
                    Paso {currentStep + 1} de {result.steps.length}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentStep(Math.min(result.steps.length - 1, currentStep + 1))
                    }
                    disabled={currentStep === result.steps.length - 1}
                    className="px-4 py-2 rounded-md font-mono text-xs border border-[hsl(200,40%,20%)] text-[hsl(200,30%,60%)] hover:border-[hsl(170,100%,50%,0.3)] disabled:opacity-30 transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* Final matrix display (when steps hidden) */}
            {!showSteps && result.steps.length > 0 && (
              <div className="flex justify-center">
                <div className="p-4 rounded-lg bg-[hsl(220,25%,8%)] border border-[hsl(170,100%,50%,0.15)] font-mono">
                  <div className="text-xs text-[hsl(200,30%,50%)] mb-2 text-center">
                    Matriz escalonada final
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[hsl(200,30%,45%)] text-2xl">[</span>
                    <div className="text-center">
                      {result.steps[result.steps.length - 1].matrix.map((row, ri) => (
                        <div key={ri} className="text-[hsl(180,100%,90%)]">
                          {formatNum(row[0])}{" "}
                          <span className="mx-2">{formatNum(row[1])}</span>
                          <span className="text-[hsl(200,30%,40%)]">|</span>{" "}
                          <span className="text-[hsl(170,100%,50%)]">
                            {formatNum(row[2])}
                          </span>
                        </div>
                      ))}
                    </div>
                    <span className="text-[hsl(200,30%,45%)] text-2xl">]</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
