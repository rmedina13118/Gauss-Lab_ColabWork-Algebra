"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Play, RotateCcw, ChevronRight, ChevronLeft, HelpCircle, Cpu, Zap, Sparkles } from "lucide-react"
import { SectionHeading } from "./section-heading"

type SolutionType = "unica" | "infinitas" | "ninguna" | null

interface Step {
  label: string
  matrix: number[][]
  operation?: string
  changedCells?: [number, number][]
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
    operation: "Construyendo la matriz aumentada [A|b] a partir del sistema de ecuaciones...",
    matrix: m.map((r) => [...r]),
    changedCells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
  })

  if (m[0][0] === 0 && m[1][0] !== 0) {
    m = [m[1], m[0]]
    steps.push({
      label: "Intercambio F1 <-> F2",
      operation: "Detectado pivote nulo en posicion (1,1). Intercambiando filas para obtener pivote no nulo...",
      matrix: m.map((r) => [...r]),
      changedCells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
    })
  }

  if (m[0][0] === 0) {
    if (m[0][1] === 0 && m[1][1] === 0) {
      if (m[0][2] !== 0 || m[1][2] !== 0) {
        return { steps, type: "ninguna" }
      }
      return { steps, type: "infinitas" }
    }
    if (m[0][1] !== 0) {
      const factor = 1 / m[0][1]
      m[0] = m[0].map((v) => v * factor)
      steps.push({
        label: `F1 = F1 * (1/${formatNum(1 / factor)})`,
        operation: `Normalizando fila 1: multiplicando por 1/${formatNum(1 / factor)} para obtener pivote = 1...`,
        matrix: m.map((r) => [...r]),
        changedCells: [[0, 0], [0, 1], [0, 2]],
      })
    }
  } else {
    if (m[0][0] !== 1) {
      const factor = m[0][0]
      m[0] = m[0].map((v) => v / factor)
      steps.push({
        label: `F1 = F1 / ${formatNum(factor)}`,
        operation: `Normalizando fila 1: dividiendo por ${formatNum(factor)} para hacer el pivote igual a 1...`,
        matrix: m.map((r) => [...r]),
        changedCells: [[0, 0], [0, 1], [0, 2]],
      })
    }
  }

  if (m[1][0] !== 0) {
    const factor = m[1][0]
    m[1] = m[1].map((v, j) => v - factor * m[0][j])
    steps.push({
      label: `F2 = F2 - (${formatNum(factor)}) * F1`,
      operation: `Eliminando coeficiente en posicion (2,1): restando ${formatNum(factor)} veces la fila 1...`,
      matrix: m.map((r) => [...r]),
      changedCells: [[1, 0], [1, 1], [1, 2]],
    })
  }

  const isZeroRow = Math.abs(m[1][0]) < 1e-10 && Math.abs(m[1][1]) < 1e-10

  if (isZeroRow) {
    if (Math.abs(m[1][2]) > 1e-10) {
      steps.push({
        label: "Fila [0 0 | k] con k != 0 => Contradiccion",
        operation: "Analisis: La fila [0 0 | k] con k distinto de 0 representa una contradiccion. El sistema es inconsistente.",
        matrix: m.map((r) => [...r]),
        changedCells: [[1, 0], [1, 1], [1, 2]],
      })
      return { steps, type: "ninguna" }
    }
    steps.push({
      label: "Fila de ceros sin contradiccion => Infinitas soluciones",
      operation: "Analisis: Fila nula [0 0 | 0] detectada. No hay contradiccion, el sistema tiene infinitas soluciones (ecuaciones dependientes).",
      matrix: m.map((r) => [...r]),
      changedCells: [[1, 0], [1, 1], [1, 2]],
    })
    return { steps, type: "infinitas" }
  }

  if (Math.abs(m[1][1]) > 1e-10 && m[1][1] !== 1) {
    const factor = m[1][1]
    m[1] = m[1].map((v) => v / factor)
    steps.push({
      label: `F2 = F2 / ${formatNum(factor)}`,
      operation: `Normalizando fila 2: dividiendo por ${formatNum(factor)} para hacer el pivote igual a 1...`,
      matrix: m.map((r) => [...r]),
      changedCells: [[1, 0], [1, 1], [1, 2]],
    })
  }

  if (Math.abs(m[0][1]) > 1e-10) {
    const factor = m[0][1]
    m[0] = m[0].map((v, j) => v - factor * m[1][j])
    steps.push({
      label: `F1 = F1 - (${formatNum(factor)}) * F2`,
      operation: `Eliminacion hacia atras: limpiando coeficiente en posicion (1,2) restando ${formatNum(factor)} veces la fila 2...`,
      matrix: m.map((r) => [...r]),
      changedCells: [[0, 0], [0, 1], [0, 2]],
    })
  }

  const x = m[0][2]
  const y = m[1][2]
  return { steps, type: "unica", x, y }
}

/* ──── Thinking dots animation ──── */
function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[hsl(170,100%,50%)]"
          style={{
            animation: `thinking-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  )
}

/* ──── Typewriter text component ──── */
function TypewriterText({ text, speed = 25, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed("")
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setDone(true)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <span>
      {displayed}
      {!done && <span className="animate-typing-cursor text-[hsl(170,100%,50%)]">|</span>}
    </span>
  )
}

/* ──── Animated matrix cell ──── */
function AnimatedCell({
  value,
  isChanged,
  delay,
  isAugmented,
}: {
  value: number
  isChanged: boolean
  delay: number
  isAugmented?: boolean
}) {
  const [visible, setVisible] = useState(!isChanged)
  const [morphing, setMorphing] = useState(false)

  useEffect(() => {
    if (!isChanged) {
      setVisible(true)
      return
    }
    setVisible(false)
    setMorphing(false)
    const t1 = setTimeout(() => {
      setVisible(true)
      setMorphing(true)
    }, delay)
    const t2 = setTimeout(() => setMorphing(false), delay + 700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [isChanged, delay, value])

  return (
    <span
      className={`
        inline-block min-w-[2.5rem] text-center transition-all duration-300
        ${!visible ? "opacity-0 scale-50 blur-sm" : ""}
        ${visible && isChanged ? "animate-cell-appear" : ""}
        ${morphing ? "animate-cell-morph" : ""}
        ${isAugmented ? "text-[hsl(170,100%,50%)] font-bold" : "text-[hsl(180,100%,90%)]"}
      `}
    >
      {visible ? formatNum(value) : "\u00A0"}
    </span>
  )
}

/* ──── Animated bracket ──── */
function AnimatedBracket({ side, show }: { side: "left" | "right"; show: boolean }) {
  return (
    <span
      className={`
        text-3xl font-light text-[hsl(170,100%,50%,0.6)] transition-all duration-500
        ${show ? "animate-bracket-draw opacity-100" : "opacity-0"}
      `}
    >
      {side === "left" ? "[" : "]"}
    </span>
  )
}

/* ──── Step progress bar ──── */
function StepProgress({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100
  return (
    <div className="w-full h-1.5 rounded-full bg-[hsl(220,25%,12%)] overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[hsl(170,100%,50%)] to-[hsl(200,100%,55%)] transition-all duration-700 ease-out animate-progress-glow"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* ──── AI processing message log ──── */
function ProcessingLog({ messages, isThinking }: { messages: string[]; isThinking: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={scrollRef}
      className="font-mono text-xs leading-relaxed max-h-28 overflow-y-auto pr-2 space-y-1"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "hsl(170,100%,30%) transparent",
      }}
    >
      {messages.map((msg, i) => (
        <div
          key={i}
          className="flex items-start gap-2 animate-text-scramble"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <span className="text-[hsl(170,100%,50%)] shrink-0">{">"}</span>
          <span className="text-[hsl(200,30%,60%)]">{msg}</span>
        </div>
      ))}
      {isThinking && (
        <div className="flex items-center gap-2 text-[hsl(170,100%,50%)]">
          <span>{">"}</span>
          <span>Procesando</span>
          <ThinkingDots />
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN DEMO SECTION
   ══════════════════════════════════════════════════════════════ */
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

  // AI animation states
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiPhase, setAiPhase] = useState<"idle" | "reading" | "building" | "analyzing" | "done">("idle")
  const [logMessages, setLogMessages] = useState<string[]>([])
  const [showMatrix, setShowMatrix] = useState(false)
  const [bracketsVisible, setBracketsVisible] = useState(false)
  const [cellRevealIndex, setCellRevealIndex] = useState(-1)
  const [stepAnimating, setStepAnimating] = useState(false)
  const [operationText, setOperationText] = useState("")
  const [showResult, setShowResult] = useState(false)

  const addLog = useCallback((msg: string) => {
    setLogMessages((prev) => [...prev, msg])
  }, [])

  /* ── AI-style solve sequence ── */
  const handleSolve = useCallback(() => {
    const nums = [a1, b1, c1, a2, b2, c2].map(Number)
    if (nums.some(isNaN) || nums.every((n) => n === 0)) return

    // Reset everything
    setResult(null)
    setCurrentStep(0)
    setShowSteps(false)
    setQuizAnswer(null)
    setShowQuiz(false)
    setQuizSubmitted(false)
    setIsProcessing(true)
    setAiPhase("reading")
    setLogMessages([])
    setShowMatrix(false)
    setBracketsVisible(false)
    setCellRevealIndex(-1)
    setStepAnimating(false)
    setOperationText("")
    setShowResult(false)

    // Phase 1: Reading input
    setTimeout(() => addLog("Inicializando GaussLab Engine v2.0..."), 200)
    setTimeout(() => addLog("Leyendo coeficientes del sistema..."), 600)
    setTimeout(() => addLog(`Ecuacion 1: ${nums[0]}x + ${nums[1]}y = ${nums[2]}`), 1000)
    setTimeout(() => addLog(`Ecuacion 2: ${nums[3]}x + ${nums[4]}y = ${nums[5]}`), 1300)
    setTimeout(() => addLog("Validando sistema de ecuaciones..."), 1600)

    // Phase 2: Building matrix
    setTimeout(() => {
      setAiPhase("building")
      addLog("Construyendo matriz aumentada [A|b]...")
      setShowMatrix(true)
    }, 2000)

    setTimeout(() => setBracketsVisible(true), 2300)

    // Reveal cells one by one
    const cellOrder = [0, 1, 2, 3, 4, 5]
    cellOrder.forEach((cellIdx, i) => {
      setTimeout(() => {
        setCellRevealIndex(cellIdx)
        const row = cellIdx < 3 ? 0 : 1
        const col = cellIdx % 3
        addLog(`Posicionando a${row + 1}${col + 1} = ${nums[row * 3 + col]}`)
      }, 2500 + i * 300)
    })

    // Phase 3: Analyzing
    setTimeout(() => {
      setAiPhase("analyzing")
      addLog("Matriz construida exitosamente.")
      addLog("Iniciando analisis del tipo de solucion...")
      const res = solveGaussJordan(nums[0], nums[1], nums[2], nums[3], nums[4], nums[5])
      setResult(res)
    }, 4500)

    // Phase 4: Show quiz
    setTimeout(() => {
      setAiPhase("done")
      setIsProcessing(false)
      addLog("Analisis completo. Esperando respuesta del usuario...")
      setShowQuiz(true)
    }, 5200)
  }, [a1, b1, c1, a2, b2, c2, addLog])

  const handleReset = () => {
    setA1(""); setB1(""); setC1("")
    setA2(""); setB2(""); setC2("")
    setResult(null)
    setCurrentStep(0)
    setShowSteps(false)
    setShowQuiz(false)
    setQuizAnswer(null)
    setQuizSubmitted(false)
    setIsProcessing(false)
    setAiPhase("idle")
    setLogMessages([])
    setShowMatrix(false)
    setBracketsVisible(false)
    setCellRevealIndex(-1)
    setStepAnimating(false)
    setOperationText("")
    setShowResult(false)
  }

  const loadExample = (ex: number) => {
    handleReset()
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
  }

  /* ── Navigate steps with animation ── */
  const goToStep = useCallback(
    (nextStep: number) => {
      if (!result || stepAnimating) return
      setStepAnimating(true)
      setOperationText(result.steps[nextStep]?.operation || "")
      setTimeout(() => {
        setCurrentStep(nextStep)
        setTimeout(() => setStepAnimating(false), 600)
      }, 200)
    },
    [result, stepAnimating]
  )

  const handleShowSteps = () => {
    setShowSteps(true)
    setCurrentStep(0)
    if (result?.steps[0]) {
      setOperationText(result.steps[0].operation || "")
    }
  }

  const inputNums = [a1, b1, c1, a2, b2, c2].map(Number)

  const inputClass =
    "w-16 h-12 text-center font-mono text-lg rounded-lg bg-[hsl(220,25%,8%)] border border-[hsl(170,100%,50%,0.25)] text-[hsl(180,100%,95%)] focus:outline-none focus:border-[hsl(170,100%,50%)] focus:neon-border transition-all placeholder:text-[hsl(200,30%,30%)]"

  return (
    <section id="demo" className="relative py-24 px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsla(170,100%,50%,0.03) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto">
        <SectionHeading
          tag="Simulacion"
          title="Demo Interactiva"
          description="Ingresa los coeficientes de un sistema 2x2 y observa como la IA de GaussLab construye y resuelve la matriz paso a paso."
        />

        {/* ─── INPUT AREA ─── */}
        <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="text-[hsl(170,100%,50%)]" size={16} />
            <h3 className="font-mono text-sm text-[hsl(170,100%,50%)] tracking-wider uppercase">
              Terminal de entrada
            </h3>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[hsl(0,80%,50%)]" />
              <span className="w-2 h-2 rounded-full bg-[hsl(50,90%,50%)]" />
              <span className="w-2 h-2 rounded-full bg-[hsl(150,80%,50%)]" />
            </span>
          </div>

          {/* Equation 1 */}
          <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
            <span className="font-mono text-xs text-[hsl(200,30%,45%)] mr-1">Ec.1:</span>
            <input type="number" value={a1} onChange={(e) => setA1(e.target.value)} className={inputClass} placeholder="a1" aria-label="Coeficiente a1" />
            <span className="font-mono text-[hsl(170,100%,50%)] text-lg">x +</span>
            <input type="number" value={b1} onChange={(e) => setB1(e.target.value)} className={inputClass} placeholder="b1" aria-label="Coeficiente b1" />
            <span className="font-mono text-[hsl(170,100%,50%)] text-lg">y =</span>
            <input type="number" value={c1} onChange={(e) => setC1(e.target.value)} className={inputClass} placeholder="c1" aria-label="Termino independiente c1" />
          </div>

          {/* Equation 2 */}
          <div className="flex flex-wrap items-center gap-2 mb-8 justify-center">
            <span className="font-mono text-xs text-[hsl(200,30%,45%)] mr-1">Ec.2:</span>
            <input type="number" value={a2} onChange={(e) => setA2(e.target.value)} className={inputClass} placeholder="a2" aria-label="Coeficiente a2" />
            <span className="font-mono text-[hsl(170,100%,50%)] text-lg">x +</span>
            <input type="number" value={b2} onChange={(e) => setB2(e.target.value)} className={inputClass} placeholder="b2" aria-label="Coeficiente b2" />
            <span className="font-mono text-[hsl(170,100%,50%)] text-lg">y =</span>
            <input type="number" value={c2} onChange={(e) => setC2(e.target.value)} className={inputClass} placeholder="c2" aria-label="Termino independiente c2" />
          </div>

          {/* Quick examples */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <span className="text-xs font-mono text-[hsl(200,30%,50%)]">Cargar ejemplo:</span>
            <button onClick={() => loadExample(1)} className="px-3 py-1.5 text-xs font-mono rounded-md border border-[hsl(200,100%,55%,0.3)] text-[hsl(200,100%,70%)] hover:bg-[hsl(200,100%,55%,0.1)] transition-all hover:scale-105">
              Infinitas
            </button>
            <button onClick={() => loadExample(2)} className="px-3 py-1.5 text-xs font-mono rounded-md border border-[hsl(150,100%,50%,0.3)] text-[hsl(150,100%,70%)] hover:bg-[hsl(150,100%,50%,0.1)] transition-all hover:scale-105">
              Unica
            </button>
            <button onClick={() => loadExample(3)} className="px-3 py-1.5 text-xs font-mono rounded-md border border-[hsl(0,80%,55%,0.3)] text-[hsl(0,80%,70%)] hover:bg-[hsl(0,80%,55%,0.1)] transition-all hover:scale-105">
              Ninguna
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleSolve}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold text-sm text-[hsl(220,25%,6%)] bg-[hsl(170,100%,50%)] hover:bg-[hsl(170,100%,60%)] disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider group"
            >
              {isProcessing ? (
                <>
                  <Cpu size={16} className="animate-spin" /> Procesando
                  <ThinkingDots />
                </>
              ) : (
                <>
                  <Play size={16} className="group-hover:scale-110 transition-transform" /> Aplicar Gauss-Jordan
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold text-sm border border-[hsl(170,100%,50%,0.3)] text-[hsl(170,100%,50%)] hover:bg-[hsl(170,100%,50%,0.08)] transition-all uppercase tracking-wider"
            >
              <RotateCcw size={16} /> Reiniciar
            </button>
          </div>
        </div>

        {/* ─── AI PROCESSING PANEL ─── */}
        {aiPhase !== "idle" && (
          <div className="glass-card rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Cpu
                  className={`text-[hsl(170,100%,50%)] ${isProcessing ? "animate-spin" : ""}`}
                  size={20}
                />
                {isProcessing && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[hsl(170,100%,50%)] animate-pulse-neon" />
                )}
              </div>
              <div>
                <h3 className="font-mono text-sm text-[hsl(170,100%,50%)] tracking-wider uppercase">
                  GaussLab Engine
                </h3>
                <p className="font-mono text-[10px] text-[hsl(200,30%,45%)]">
                  {aiPhase === "reading" && "Leyendo datos de entrada..."}
                  {aiPhase === "building" && "Construyendo matriz aumentada..."}
                  {aiPhase === "analyzing" && "Ejecutando eliminacion gaussiana..."}
                  {aiPhase === "done" && "Analisis completado"}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${isProcessing
                      ? "bg-[hsl(50,100%,55%)] animate-pulse-neon"
                      : "bg-[hsl(150,100%,50%)]"
                    }`}
                />
                <span className="font-mono text-[10px] text-[hsl(200,30%,45%)]">
                  {isProcessing ? "WORKING" : "READY"}
                </span>
              </div>
            </div>

            {/* Processing log */}
            <div className="bg-[hsl(220,25%,5%)] rounded-lg p-4 mb-5 border border-[hsl(200,40%,15%)]">
              <ProcessingLog messages={logMessages} isThinking={isProcessing} />
            </div>

            {/* ─── ANIMATED MATRIX CONSTRUCTION ─── */}
            {showMatrix && (
              <div className="flex flex-col items-center gap-4 animate-fade-in-up">
                <div className="flex items-center gap-1">
                  <Sparkles className="text-[hsl(170,100%,50%)]" size={14} />
                  <span className="font-mono text-xs text-[hsl(200,30%,55%)] uppercase tracking-wider">
                    Matriz Aumentada [A|b]
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <AnimatedBracket side="left" show={bracketsVisible} />

                  <div className="flex flex-col gap-2">
                    {/* Row 0 */}
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-500 ${cellRevealIndex >= 0 && cellRevealIndex <= 2 ? "animate-row-highlight" : ""}`}>
                      <AnimatedCell value={inputNums[0]} isChanged={cellRevealIndex >= 0} delay={0} />
                      <AnimatedCell value={inputNums[1]} isChanged={cellRevealIndex >= 1} delay={150} />
                      <span className={`text-[hsl(200,30%,35%)] text-lg transition-opacity duration-300 ${cellRevealIndex >= 2 ? "opacity-100" : "opacity-0"}`}>|</span>
                      <AnimatedCell value={inputNums[2]} isChanged={cellRevealIndex >= 2} delay={300} isAugmented />
                    </div>

                    {/* Row 1 */}
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-500 ${cellRevealIndex >= 3 && cellRevealIndex <= 5 ? "animate-row-highlight" : ""}`}>
                      <AnimatedCell value={inputNums[3]} isChanged={cellRevealIndex >= 3} delay={0} />
                      <AnimatedCell value={inputNums[4]} isChanged={cellRevealIndex >= 4} delay={150} />
                      <span className={`text-[hsl(200,30%,35%)] text-lg transition-opacity duration-300 ${cellRevealIndex >= 5 ? "opacity-100" : "opacity-0"}`}>|</span>
                      <AnimatedCell value={inputNums[5]} isChanged={cellRevealIndex >= 5} delay={300} isAugmented />
                    </div>
                  </div>

                  <AnimatedBracket side="right" show={bracketsVisible} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── QUIZ ─── */}
        {showQuiz && result && !quizSubmitted && (
          <div className="glass-card rounded-2xl p-6 md:p-8 mb-8 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="text-[hsl(50,100%,55%)]" size={20} />
              <h3 className="font-mono text-sm text-[hsl(50,100%,55%)] tracking-wider uppercase">
                Antes de ver el resultado...
              </h3>
            </div>
            <p className="text-[hsl(180,100%,95%)] mb-6 text-center text-lg">
              <TypewriterText text="Que tipo de solucióncrees que tiene este sistema?" speed={30} />
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {(["unica", "infinitas", "ninguna"] as SolutionType[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setQuizAnswer(opt)}
                  className={`px-5 py-3 rounded-lg font-mono text-sm border transition-all duration-300 hover:scale-105 ${quizAnswer === opt
                      ? "border-[hsl(170,100%,50%)] bg-[hsl(170,100%,50%,0.15)] text-[hsl(170,100%,50%)] neon-border"
                      : "border-[hsl(200,40%,20%)] text-[hsl(200,30%,60%)] hover:border-[hsl(200,40%,35%)]"
                    }`}
                >
                  {opt === "unica" ? "soluciónUnica" : opt === "infinitas" ? "Infinitas Soluciones" : "Ninguna Solucion"}
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setQuizSubmitted(true)
                  setShowResult(true)
                }}
                disabled={!quizAnswer}
                className="px-6 py-3 rounded-lg font-mono text-sm font-bold bg-[hsl(170,100%,50%)] text-[hsl(220,25%,6%)] hover:bg-[hsl(170,100%,60%)] disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
              >
                Verificar respuesta
              </button>
            </div>
          </div>
        )}

        {/* ─── QUIZ RESULT ─── */}
        {quizSubmitted && result && (
          <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in-up">
            <div className="text-center">
              {quizAnswer === result.type ? (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="text-[hsl(150,100%,50%)]" size={20} />
                  <span className="text-[hsl(150,100%,50%)] font-mono text-lg font-bold">
                    Correcto!
                  </span>
                  <Zap className="text-[hsl(150,100%,50%)]" size={20} />
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
                    ? "soluciónUnica"
                    : result.type === "infinitas"
                      ? "Infinitas Soluciones"
                      : "Ninguna Solucion"}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* ─── RESULT PANEL WITH ANIMATED STEPS ─── */}
        {showResult && result && quizSubmitted && (
          <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[hsl(200,100%,55%)] animate-pulse-neon" size={16} />
                <h3 className="font-mono text-sm text-[hsl(200,100%,55%)] tracking-wider uppercase">
                  Resultado
                </h3>
              </div>
              {!showSteps && (
                <button
                  onClick={handleShowSteps}
                  className="flex items-center gap-1 text-xs font-mono text-[hsl(170,100%,50%)] border border-[hsl(170,100%,50%,0.3)] px-3 py-1.5 rounded-md hover:bg-[hsl(170,100%,50%,0.08)] transition-all hover:scale-105"
                >
                  <Cpu size={14} />
                  Ver proceso paso a paso (IA)
                </button>
              )}
            </div>

            {/* Solution type badge */}
            <div className="flex justify-center mb-6">
              <span
                className={`px-5 py-2 rounded-full font-mono text-sm font-bold border transition-all duration-500 ${result.type === "unica"
                    ? "border-[hsl(150,100%,50%,0.4)] bg-[hsl(150,100%,50%,0.1)] text-[hsl(150,100%,50%)]"
                    : result.type === "infinitas"
                      ? "border-[hsl(50,100%,55%,0.4)] bg-[hsl(50,100%,55%,0.1)] text-[hsl(50,100%,55%)]"
                      : "border-[hsl(0,80%,55%,0.4)] bg-[hsl(0,80%,55%,0.1)] text-[hsl(0,80%,55%)]"
                  }`}
              >
                {result.type === "unica"
                  ? `soluciónUnica: x = ${formatNum(result.x!)}, y = ${formatNum(result.y!)}`
                  : result.type === "infinitas"
                    ? "Infinitas Soluciones"
                    : "Ninguna solución(Sistema Inconsistente)"}
              </span>
            </div>

            {/* ── STEP-BY-STEP WITH AI ANIMATION ── */}
            {showSteps && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Progress bar */}
                <StepProgress current={currentStep} total={result.steps.length} />

                {/* Step counter */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[hsl(200,30%,45%)]">
                    Paso {currentStep + 1} de {result.steps.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(170,100%,50%)] animate-pulse-neon" />
                    <span className="font-mono text-[10px] text-[hsl(170,100%,50%)]">
                      {stepAnimating ? "TRANSFORMANDO" : "LISTO"}
                    </span>
                  </div>
                </div>

                {/* Operation description (typewriter) */}
                <div className="bg-[hsl(220,25%,5%)] rounded-lg p-4 border border-[hsl(200,40%,15%)] min-h-[3.5rem]">
                  <div className="flex items-start gap-2">
                    <Cpu className="text-[hsl(170,100%,50%)] shrink-0 mt-0.5" size={14} />
                    <p className="font-mono text-xs text-[hsl(200,30%,60%)] leading-relaxed">
                      <TypewriterText
                        key={`${currentStep}-${operationText}`}
                        text={operationText || result.steps[currentStep]?.operation || result.steps[currentStep]?.label || ""}
                        speed={20}
                      />
                    </p>
                  </div>
                </div>

                {/* Current step label */}
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[hsl(170,100%,50%,0.15)] border border-[hsl(170,100%,50%,0.4)] text-[hsl(170,100%,50%)] text-xs font-mono font-bold flex items-center justify-center">
                    {currentStep + 1}
                  </span>
                  <span className="font-mono text-sm text-[hsl(170,100%,50%)] font-bold">
                    {result.steps[currentStep]?.label}
                  </span>
                </div>

                {/* ── ANIMATED MATRIX FOR CURRENT STEP ── */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`flex items-center gap-3 transition-all duration-500 ${stepAnimating ? "scale-95 opacity-70" : "scale-100 opacity-100"}`}>
                    <span className="text-3xl font-light text-[hsl(170,100%,50%,0.6)] animate-bracket-draw">[</span>

                    <div className="flex flex-col gap-2">
                      {result.steps[currentStep]?.matrix.map((row, ri) => {
                        const isRowChanged = result.steps[currentStep]?.changedCells?.some(
                          ([r]) => r === ri
                        )
                        return (
                          <div
                            key={ri}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-500 ${isRowChanged ? "animate-row-highlight" : ""
                              }`}
                          >
                            {row.map((val, ci) => {
                              const isCellChanged = result.steps[currentStep]?.changedCells?.some(
                                ([r, c]) => r === ri && c === ci
                              )
                              const isAug = ci === 2
                              return (
                                <span key={ci} className="flex items-center gap-3">
                                  {isAug && (
                                    <span className="text-[hsl(200,30%,35%)] text-lg">|</span>
                                  )}
                                  <span
                                    className={`
                                      inline-block min-w-[2.5rem] text-center font-mono text-lg
                                      transition-all duration-500
                                      ${isCellChanged ? "animate-cell-morph" : ""}
                                      ${isAug ? "text-[hsl(170,100%,50%)] font-bold" : "text-[hsl(180,100%,90%)]"}
                                    `}
                                  >
                                    {formatNum(val)}
                                  </span>
                                </span>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>

                    <span className="text-3xl font-light text-[hsl(170,100%,50%,0.6)] animate-bracket-draw">]</span>
                  </div>
                </div>

                {/* ── Small matrix timeline ── */}
                <div className="flex items-center justify-center gap-1 flex-wrap mt-2">
                  {result.steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToStep(i)}
                      className={`w-8 h-8 rounded-md font-mono text-[10px] font-bold border transition-all duration-300 ${i === currentStep
                          ? "bg-[hsl(170,100%,50%,0.2)] border-[hsl(170,100%,50%)] text-[hsl(170,100%,50%)] scale-110 neon-border"
                          : i < currentStep
                            ? "bg-[hsl(170,100%,50%,0.05)] border-[hsl(170,100%,50%,0.2)] text-[hsl(170,100%,50%,0.6)]"
                            : "bg-[hsl(220,25%,8%)] border-[hsl(200,40%,15%)] text-[hsl(200,30%,40%)]"
                        }`}
                      aria-label={`Ir al paso ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                {/* Step navigation */}
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => goToStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0 || stepAnimating}
                    className="flex items-center gap-1 px-5 py-2.5 rounded-md font-mono text-xs border border-[hsl(200,40%,20%)] text-[hsl(200,30%,60%)] hover:border-[hsl(170,100%,50%,0.3)] hover:text-[hsl(170,100%,50%)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>
                  <button
                    onClick={() => goToStep(Math.min(result.steps.length - 1, currentStep + 1))}
                    disabled={currentStep === result.steps.length - 1 || stepAnimating}
                    className="flex items-center gap-1 px-5 py-2.5 rounded-md font-mono text-xs border border-[hsl(170,100%,50%,0.3)] text-[hsl(170,100%,50%)] hover:bg-[hsl(170,100%,50%,0.08)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Siguiente <ChevronRight size={14} />
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
                    <span className="text-[hsl(170,100%,50%,0.6)] text-2xl">[</span>
                    <div className="text-center">
                      {result.steps[result.steps.length - 1].matrix.map((row, ri) => (
                        <div key={ri} className="text-[hsl(180,100%,90%)]">
                          {formatNum(row[0])}{" "}
                          <span className="mx-2">{formatNum(row[1])}</span>
                          <span className="text-[hsl(200,30%,40%)]">|</span>{" "}
                          <span className="text-[hsl(170,100%,50%)]">{formatNum(row[2])}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-[hsl(170,100%,50%,0.6)] text-2xl">]</span>
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
