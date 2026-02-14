"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Play, Code2, Terminal, ChevronDown, ChevronUp, Copy, Check, RotateCcw, Coffee, FileCode, Cpu } from "lucide-react"
import { SectionHeading } from "./section-heading"

/* ──── Thinking dots ──── */
function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[hsl(40,100%,55%)]"
          style={{ animation: `thinking-dot 1.4s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </span>
  )
}

/* ──── Line-by-line code typewriter ──── */
function CodeTypewriter({
  lines,
  speed = 8,
  onLineComplete,
  onDone,
}: {
  lines: { text: string; className?: string }[]
  speed?: number
  onLineComplete?: (lineIdx: number) => void
  onDone?: () => void
}) {
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [completedLines, setCompletedLines] = useState<number[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentLine >= lines.length) {
      onDone?.()
      return
    }

    const line = lines[currentLine].text
    if (currentChar < line.length) {
      const timeout = setTimeout(() => {
        setCurrentChar((prev) => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else {
      setCompletedLines((prev) => [...prev, currentLine])
      onLineComplete?.(currentLine)
      setCurrentLine((prev) => prev + 1)
      setCurrentChar(0)
    }
  }, [currentLine, currentChar, lines, speed, onLineComplete, onDone])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentLine, currentChar])

  return (
    <div ref={scrollRef} className="overflow-y-auto max-h-[400px]" style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(40,100%,30%) transparent" }}>
      <pre className="font-mono text-xs leading-relaxed">
        {lines.map((line, i) => {
          if (i > currentLine) return null
          const isComplete = completedLines.includes(i)
          const isCurrent = i === currentLine
          const displayText = isCurrent ? line.text.slice(0, currentChar) : line.text

          return (
            <div key={i} className={`flex transition-opacity duration-200 ${i > currentLine ? "opacity-0" : "opacity-100"}`}>
              <span className="inline-block w-10 text-right pr-3 text-[hsl(200,30%,30%)] select-none shrink-0 tabular-nums">
                {i + 1}
              </span>
              <span className={line.className || "text-[hsl(180,100%,90%)]"}>
                {displayText}
                {isCurrent && !isComplete && (
                  <span className="animate-typing-cursor text-[hsl(40,100%,55%)]">|</span>
                )}
              </span>
            </div>
          )
        })}
      </pre>
    </div>
  )
}

/* ──── Console output with typewriter effect ──── */
function ConsoleOutput({
  lines,
  isRunning,
}: {
  lines: { text: string; type: "system" | "output" | "input" | "success" | "error" | "separator" | "header" }[]
  isRunning: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const getLineStyle = (type: string) => {
    switch (type) {
      case "system": return "text-[hsl(200,30%,50%)] italic"
      case "output": return "text-[hsl(180,100%,90%)]"
      case "input": return "text-[hsl(40,100%,55%)]"
      case "success": return "text-[hsl(150,100%,50%)] font-bold"
      case "error": return "text-[hsl(0,80%,60%)] font-bold"
      case "separator": return "text-[hsl(200,30%,30%)]"
      case "header": return "text-[hsl(40,100%,55%)] font-bold"
      default: return "text-[hsl(180,100%,90%)]"
    }
  }

  return (
    <div
      ref={scrollRef}
      className="font-mono text-xs leading-relaxed max-h-[400px] overflow-y-auto space-y-0.5"
      style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(40,100%,30%) transparent" }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          className={`animate-text-scramble ${getLineStyle(line.type)}`}
          style={{ animationDelay: `${Math.min(i * 0.02, 0.5)}s` }}
        >
          {line.type === "input" ? (
            <span className="flex items-center gap-1">
              <span className="text-[hsl(150,100%,50%)]">{">>>"}</span>{" "}
              <span>{line.text}</span>
            </span>
          ) : (
            line.text
          )}
        </div>
      ))}
      {isRunning && (
        <div className="flex items-center gap-1 text-[hsl(40,100%,55%)]">
          <span>Ejecutando</span>
          <ThinkingDots />
        </div>
      )}
    </div>
  )
}

/* ──── Java syntax highlight helper ──── */
function javaHighlight(code: string): { text: string; className?: string }[] {
  return code.split("\n").map((line) => {
    // Comments
    if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*") || line.trimStart().startsWith("/**")) {
      return { text: line, className: "text-[hsl(200,30%,45%)] italic" }
    }
    // Annotations
    if (line.trimStart().startsWith("@")) {
      return { text: line, className: "text-[hsl(40,100%,55%)]" }
    }
    // Import statements
    if (line.trimStart().startsWith("import")) {
      return { text: line, className: "text-[hsl(200,60%,60%)]" }
    }
    // Keywords: class, static, final, public, private, etc.
    if (/^\s*(public|private|static|final|class|enum|void|int|if|else|while|for|return|new|switch|case|this)\b/.test(line)) {
      return { text: line, className: "text-[hsl(280,70%,70%)]" }
    }
    // Strings
    if (line.includes('"')) {
      return { text: line, className: "text-[hsl(120,50%,60%)]" }
    }
    return { text: line, className: "text-[hsl(180,100%,90%)]" }
  })
}

/* ──── JAVA PROTOTYPE SECTION ──── */
const JAVA_SOURCE_PREVIEW = `import java.math.BigInteger;
import java.util.*;

/**
 * GAUSSLAB (Consola) - Archivo unico
 * ---------------------------------
 * - Resuelve sistemas 2x2 con:
 *   (1) Eliminacion Gaussiana (REF)
 *   (2) Gauss-Jordan (RREF)
 * - Muestra pasos (operaciones elementales)
 * - Calcula rank(A) y rank([A|b])
 * - Clasifica: unica / infinitas / ninguna
 */
public class GaussLabConsole {

    public static void main(String[] args) {
        new GameApp().run();
    }

    static final class GameApp {
        private final ConsoleIO io = new ConsoleIO();
        private final List<Level> levels = new ArrayList<>();

        void run() {
            printHeader();
            while (true) {
                System.out.println("\\nMENU PRINCIPAL");
                System.out.println("1) Jugar niveles (modo GaussLab)");
                System.out.println("2) Resolver sistema ingresado (2x2)");
                System.out.println("3) Salir");
                int opt = io.readInt("Elegi una opcion: ", 1, 3);
                if (opt == 1) runLevels();
                if (opt == 2) runCustomSystem();
                if (opt == 3) { System.out.println("Fin!"); return; }
            }
        }

        private void runCustomSystem() {
            System.out.println("\\n=== SISTEMA PERSONALIZADO (2x2) ===");
            Fraction a11 = io.readFraction("a11: ");
            Fraction a12 = io.readFraction("a12: ");
            Fraction b1  = io.readFraction("b1 : ");
            Fraction a21 = io.readFraction("a21: ");
            Fraction a22 = io.readFraction("a22: ");
            Fraction b2  = io.readFraction("b2 : ");

            Matrix augmented = new Matrix(new Fraction[][]{
                {a11, a12, b1},
                {a21, a22, b2}
            });

            GaussJordanResult res = GaussJordanSolver.solve(
                augmented, 2, new String[]{"x","y"}
            );
            // ... muestra pasos y resultado
        }
    }
    // ... (Fraction, Matrix, Solvers, Levels, etc.)
}`

/* Levels data for the simulated execution */
const LEVELS = [
  {
    title: "Puerta 01: Sistema dependiente",
    story: "El panel detecta ecuaciones proporcionales.",
    system: "2x + 2y = 4\nx + y = 2",
    matrix: "[ 2  2  | 4 ]\n[ 1  1  | 2 ]",
    steps: [
      { op: "Matriz aumentada inicial [A|b]", mat: "[ 2  2  | 4 ]\n[ 1  1  | 2 ]" },
      { op: "Normalizar pivote: R1 <- (1/2) R1", mat: "[ 1  1  | 2 ]\n[ 1  1  | 2 ]" },
      { op: "Eliminar: R2 <- R2 - (1) R1", mat: "[ 1  1  | 2 ]\n[ 0  0  | 0 ]" },
    ],
    rankA: 1,
    rankAug: 1,
    type: "Infinitas soluciones",
    solution: "y = t (parametro libre)\nx = 2 - t",
  },
  {
    title: "Puerta 03: Sistema independiente",
    story: "El reactor solo se estabiliza si encontras una solucion exacta.",
    system: "2x + y = 5\nx - y = 1",
    matrix: "[ 2  1  | 5 ]\n[ 1  -1 | 1 ]",
    steps: [
      { op: "Matriz aumentada inicial [A|b]", mat: "[ 2  1  | 5 ]\n[ 1  -1 | 1 ]" },
      { op: "Normalizar pivote: R1 <- (1/2) R1", mat: "[ 1  1/2 | 5/2 ]\n[ 1  -1   | 1   ]" },
      { op: "Eliminar: R2 <- R2 - (1) R1", mat: "[ 1  1/2  | 5/2 ]\n[ 0  -3/2 | -3/2 ]" },
      { op: "Normalizar pivote: R2 <- (-2/3) R2", mat: "[ 1  1/2 | 5/2 ]\n[ 0  1   | 1   ]" },
      { op: "Eliminar: R1 <- R1 - (1/2) R2", mat: "[ 1  0 | 2 ]\n[ 0  1 | 1 ]" },
    ],
    rankA: 2,
    rankAug: 2,
    type: "Solucion unica",
    solution: "x = 2\ny = 1",
  },
  {
    title: "Puerta 04: Contradiccion",
    story: "Dos sensores se contradicen: se puede abrir la puerta?",
    system: "x + y = 2\nx + y = 3",
    matrix: "[ 1  1  | 2 ]\n[ 1  1  | 3 ]",
    steps: [
      { op: "Matriz aumentada inicial [A|b]", mat: "[ 1  1  | 2 ]\n[ 1  1  | 3 ]" },
      { op: "Eliminar: R2 <- R2 - (1) R1", mat: "[ 1  1  | 2 ]\n[ 0  0  | 1 ]" },
    ],
    rankA: 1,
    rankAug: 2,
    type: "Ninguna solucion",
    solution: "El sistema es INCONSISTENTE => NO tiene solucion.",
  },
]

type ConsoleLine = { text: string; type: "system" | "output" | "input" | "success" | "error" | "separator" | "header" }

export function JavaPrototypeSection() {
  const [activeTab, setActiveTab] = useState<"code" | "run">("code")
  const [codeExpanded, setCodeExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([])
  const [currentLevel, setCurrentLevel] = useState(0)
  const [currentStepInLevel, setCurrentStepInLevel] = useState(0)
  const [phase, setPhase] = useState<"idle" | "header" | "menu" | "level-intro" | "solving" | "result" | "next-level" | "done">("idle")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const addLine = useCallback((text: string, type: ConsoleLine["type"] = "output") => {
    setConsoleLines((prev) => [...prev, { text, type }])
  }, [])

  const addLines = useCallback((lines: [string, ConsoleLine["type"]][], baseDelay: number) => {
    lines.forEach(([text, type], i) => {
      timerRef.current = setTimeout(() => addLine(text, type), baseDelay + i * 200)
    })
    return baseDelay + lines.length * 200
  }, [addLine])

  /* ── Simulate running the Java program ── */
  const simulateExecution = useCallback(() => {
    setConsoleLines([])
    setIsRunning(true)
    setCurrentLevel(0)
    setCurrentStepInLevel(0)
    setPhase("header")

    let delay = 0

    // Header
    const headerLines: [string, ConsoleLine["type"]][] = [
      ["$ javac GaussLabConsole.java", "input"],
      ["$ java GaussLabConsole", "input"],
      ["", "output"],
      ["==============================================", "separator"],
      ["       DESAFIO DE GAUSS (Consola)             ", "header"],
      ["  Sistemas 2x2 + Gauss / Gauss-Jordan         ", "header"],
      ["==============================================", "separator"],
    ]
    delay = addLines(headerLines, 300)

    // Menu
    delay += 400
    const menuLines: [string, ConsoleLine["type"]][] = [
      ["", "output"],
      ["MENU PRINCIPAL", "header"],
      ["1) Jugar niveles (modo GaussLab)", "output"],
      ["2) Resolver un sistema ingresado por el usuario (2x2)", "output"],
      ["3) Salir", "output"],
    ]
    delay = addLines(menuLines, delay)

    delay += 300
    timerRef.current = setTimeout(() => {
      addLine("Elegi una opcion: 1", "input")
      setPhase("menu")
    }, delay)

    delay += 400
    const modeLines: [string, ConsoleLine["type"]][] = [
      ["", "output"],
      ["=== MODO HISTORIA: GAUSSLAB ===", "header"],
      ["Regla: primero PREDECIS el tipo de solucion, luego el programa lo verifica.", "system"],
    ]
    delay = addLines(modeLines, delay)

    // Run through levels
    LEVELS.forEach((level, lvlIdx) => {
      delay += 600

      // Level intro
      timerRef.current = setTimeout(() => {
        setCurrentLevel(lvlIdx)
        setPhase("level-intro")
      }, delay)

      const introLines: [string, ConsoleLine["type"]][] = [
        ["", "output"],
        [`--- NIVEL ${lvlIdx + 1}: ${level.title} ---`, "header"],
        [level.story, "system"],
        ["", "output"],
        ["Sistema (ecuaciones):", "output"],
        ...level.system.split("\n").map((l): [string, ConsoleLine["type"]] => [l, "output"]),
        ["", "output"],
        ["Matriz aumentada [A|b]:", "output"],
        ...level.matrix.split("\n").map((l): [string, ConsoleLine["type"]] => [l, "output"]),
      ]
      delay = addLines(introLines, delay)

      // Guess
      delay += 500
      const guessLines: [string, ConsoleLine["type"]][] = [
        ["", "output"],
        ["Antes de resolver, que tipo de solucion crees que tiene?", "output"],
        ["1) Solucion unica", "output"],
        ["2) Infinitas soluciones", "output"],
        ["3) Ninguna solucion", "output"],
      ]
      delay = addLines(guessLines, delay)

      delay += 300
      const guessNum = level.type.includes("unica") ? "1" : level.type.includes("Infinitas") ? "2" : "3"
      timerRef.current = setTimeout(() => addLine(`Tu prediccion: ${guessNum}`, "input"), delay)

      delay += 300
      timerRef.current = setTimeout(() => addLine("Metodo (1=Gauss, 2=Gauss-Jordan): 2", "input"), delay)

      // Steps
      delay += 400
      timerRef.current = setTimeout(() => setPhase("solving"), delay)

      const stepsHeader: [string, ConsoleLine["type"]][] = [
        ["", "output"],
        ["=== PASOS (Gauss-Jordan: RREF) ===", "header"],
      ]
      delay = addLines(stepsHeader, delay)

      level.steps.forEach((step, si) => {
        delay += 350
        timerRef.current = setTimeout(() => {
          setCurrentStepInLevel(si)
          addLine(`Paso ${si}: ${step.op}`, "output")
          step.mat.split("\n").forEach((matLine) => {
            addLine(matLine, "output")
          })
        }, delay)
      })

      // Result
      delay += 500
      timerRef.current = setTimeout(() => setPhase("result"), delay)

      const resultLines: [string, ConsoleLine["type"]][] = [
        ["", "output"],
        [`=== MATRIZ ESCALONADA REDUCIDA FINAL (RREF) ===`, "header"],
        ...level.steps[level.steps.length - 1].mat.split("\n").map((l): [string, ConsoleLine["type"]] => [l, "output"]),
        ["", "output"],
        ["=== ANALISIS POR RANGO ===", "header"],
        [`rank(A)     = ${level.rankA}`, "output"],
        [`rank([A|b]) = ${level.rankAug}`, "output"],
        [`Tipo de solucion: ${level.type}`, level.type.includes("unica") ? "success" : level.type.includes("Infinitas") ? "system" : "error"],
        ["", "output"],
        ["=== SOLUCION ===", "header"],
        ...level.solution.split("\n").map((l): [string, ConsoleLine["type"]] => [l, level.type.includes("Ninguna") ? "error" : "success"]),
        ["", "output"],
        ["=== VERIFICACION ===", "header"],
        [`Tu prediccion:      ${level.type}`, "output"],
        [`Resultado programa: ${level.type}`, "output"],
        ["Acertaste!", "success"],
      ]
      delay = addLines(resultLines, delay)
    })

    // Done
    delay += 600
    timerRef.current = setTimeout(() => {
      addLine("", "output")
      addLine("=== Todos los niveles completados ===", "header")
      addLine("Fin del programa!", "success")
      setIsRunning(false)
      setPhase("done")
    }, delay)
  }, [addLine, addLines])

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setConsoleLines([])
    setIsRunning(false)
    setPhase("idle")
    setCurrentLevel(0)
    setCurrentStepInLevel(0)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JAVA_SOURCE_PREVIEW)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const highlightedCode = javaHighlight(JAVA_SOURCE_PREVIEW)

  return (
    <section id="prototipo" className="relative py-24 px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsla(40,100%,50%,0.02) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto">
        <SectionHeading
          tag="Prototipo"
          title="GaussLab Console (Java)"
          description="Prototipo inicial del proyecto en Java. Explora el codigo fuente y ejecuta una simulacion interactiva de como funciona la aplicacion de consola."
        />

        {/* ── Tab bar ── */}
        <div className="flex items-center gap-1 mb-0 px-2">
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-mono text-xs transition-all ${
              activeTab === "code"
                ? "bg-[hsl(220,25%,8%)] text-[hsl(40,100%,55%)] border border-b-0 border-[hsl(40,100%,55%,0.25)]"
                : "bg-transparent text-[hsl(200,30%,45%)] hover:text-[hsl(200,30%,60%)]"
            }`}
          >
            <FileCode size={14} />
            GaussLabConsole.java
          </button>
          <button
            onClick={() => setActiveTab("run")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-mono text-xs transition-all ${
              activeTab === "run"
                ? "bg-[hsl(220,25%,8%)] text-[hsl(40,100%,55%)] border border-b-0 border-[hsl(40,100%,55%,0.25)]"
                : "bg-transparent text-[hsl(200,30%,45%)] hover:text-[hsl(200,30%,60%)]"
            }`}
          >
            <Terminal size={14} />
            Ejecutar
          </button>
        </div>

        {/* ── Code Tab ── */}
        {activeTab === "code" && (
          <div className="glass-card rounded-2xl rounded-tl-none overflow-hidden border-[hsl(40,100%,55%,0.15)]" style={{ borderColor: "hsla(40,100%,55%,0.15)" }}>
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-[hsl(220,25%,8%)] border-b border-[hsl(40,100%,55%,0.1)]">
              <div className="flex items-center gap-3">
                <Coffee className="text-[hsl(40,100%,55%)]" size={16} />
                <span className="font-mono text-xs text-[hsl(40,100%,55%)] tracking-wider">
                  JAVA 17+ | GaussLabConsole.java
                </span>
                <span className="px-2 py-0.5 text-[8px] font-mono font-bold rounded bg-[hsl(40,100%,55%,0.15)] text-[hsl(40,100%,55%)] border border-[hsl(40,100%,55%,0.2)]">
                  856 lineas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono rounded border border-[hsl(200,40%,20%)] text-[hsl(200,30%,60%)] hover:border-[hsl(40,100%,55%,0.3)] hover:text-[hsl(40,100%,55%)] transition-all"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[hsl(0,80%,50%)]" />
                  <span className="w-2 h-2 rounded-full bg-[hsl(50,90%,50%)]" />
                  <span className="w-2 h-2 rounded-full bg-[hsl(150,80%,50%)]" />
                </span>
              </div>
            </div>

            {/* Code view */}
            <div className={`relative bg-[hsl(220,25%,5%)] p-5 transition-all duration-500 ${codeExpanded ? "max-h-[600px]" : "max-h-[350px]"} overflow-hidden`}>
              <CodeTypewriter lines={highlightedCode} speed={0} />

              {/* Fade overlay for collapsed */}
              {!codeExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[hsl(220,25%,5%)] to-transparent pointer-events-none" />
              )}
            </div>

            {/* Expand/collapse */}
            <button
              onClick={() => setCodeExpanded(!codeExpanded)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[hsl(220,25%,7%)] text-[hsl(200,30%,50%)] hover:text-[hsl(40,100%,55%)] text-xs font-mono transition-all border-t border-[hsl(40,100%,55%,0.05)]"
            >
              {codeExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {codeExpanded ? "Ver menos" : "Ver mas codigo"}
            </button>

            {/* Code structure overview */}
            <div className="px-5 py-4 bg-[hsl(220,25%,7%)] border-t border-[hsl(40,100%,55%,0.08)]">
              <h4 className="font-mono text-[10px] text-[hsl(200,30%,45%)] uppercase tracking-widest mb-3">Estructura del archivo</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { name: "GameApp", desc: "Menu / UI" },
                  { name: "Fraction", desc: "Racionales exactos" },
                  { name: "Matrix", desc: "Operaciones filas" },
                  { name: "GaussJordan", desc: "Solver RREF" },
                  { name: "GaussElim", desc: "Solver REF" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-[hsl(220,25%,9%)] border border-[hsl(40,100%,55%,0.08)] hover:border-[hsl(40,100%,55%,0.2)] transition-all"
                  >
                    <Code2 className="text-[hsl(40,100%,55%)]" size={14} />
                    <span className="font-mono text-[10px] text-[hsl(40,100%,55%)]">{item.name}</span>
                    <span className="font-mono text-[8px] text-[hsl(200,30%,45%)]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Run Tab ── */}
        {activeTab === "run" && (
          <div className="glass-card rounded-2xl rounded-tl-none overflow-hidden" style={{ borderColor: "hsla(40,100%,55%,0.15)" }}>
            {/* Terminal header */}
            <div className="flex items-center justify-between px-5 py-3 bg-[hsl(220,25%,8%)] border-b border-[hsl(40,100%,55%,0.1)]">
              <div className="flex items-center gap-3">
                <Terminal className="text-[hsl(40,100%,55%)]" size={16} />
                <span className="font-mono text-xs text-[hsl(40,100%,55%)] tracking-wider">
                  Simulacion de consola Java
                </span>
                {isRunning && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[hsl(50,100%,55%,0.1)] border border-[hsl(50,100%,55%,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(50,100%,55%)] animate-pulse-neon" />
                    <span className="font-mono text-[8px] text-[hsl(50,100%,55%)]">
                      NIVEL {currentLevel + 1}/{LEVELS.length}
                    </span>
                  </span>
                )}
                {phase === "done" && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[hsl(150,100%,50%,0.1)] border border-[hsl(150,100%,50%,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(150,100%,50%)]" />
                    <span className="font-mono text-[8px] text-[hsl(150,100%,50%)]">COMPLETADO</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[hsl(0,80%,50%)]" />
                  <span className="w-2 h-2 rounded-full bg-[hsl(50,90%,50%)]" />
                  <span className="w-2 h-2 rounded-full bg-[hsl(150,80%,50%)]" />
                </span>
              </div>
            </div>

            {/* Terminal body */}
            <div className="bg-[hsl(220,25%,4%)] p-5 min-h-[350px] max-h-[500px] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(40,100%,30%) transparent" }}>
              {phase === "idle" ? (
                <div className="flex flex-col items-center justify-center h-[300px] gap-6">
                  <div className="relative">
                    <Terminal className="text-[hsl(40,100%,55%,0.3)]" size={48} />
                    <Cpu className="absolute -bottom-1 -right-1 text-[hsl(40,100%,55%)]" size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-[hsl(180,100%,95%)] font-mono text-sm mb-2">Simulador de GaussLabConsole.java</p>
                    <p className="text-[hsl(200,30%,50%)] text-xs max-w-md leading-relaxed">
                      Ejecuta una simulacion interactiva del prototipo Java. Recorre los 3 niveles del modo historia con eliminacion gaussiana paso a paso.
                    </p>
                  </div>
                  <button
                    onClick={simulateExecution}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-lg font-mono font-bold text-sm text-[hsl(220,25%,6%)] bg-[hsl(40,100%,55%)] hover:bg-[hsl(40,100%,65%)] transition-all uppercase tracking-wider group"
                  >
                    <Play size={16} className="group-hover:scale-110 transition-transform" />
                    java GaussLabConsole
                  </button>
                </div>
              ) : (
                <ConsoleOutput lines={consoleLines} isRunning={isRunning} />
              )}
            </div>

            {/* Terminal footer */}
            {phase !== "idle" && (
              <div className="flex items-center justify-between px-5 py-3 bg-[hsl(220,25%,7%)] border-t border-[hsl(40,100%,55%,0.08)]">
                <div className="flex items-center gap-4">
                  {/* Level progress */}
                  <div className="flex items-center gap-1">
                    {LEVELS.map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-1.5 rounded-full transition-all duration-500 ${
                          i < currentLevel
                            ? "bg-[hsl(150,100%,50%)]"
                            : i === currentLevel && isRunning
                            ? "bg-[hsl(50,100%,55%)] animate-pulse-neon"
                            : phase === "done"
                            ? "bg-[hsl(150,100%,50%)]"
                            : "bg-[hsl(220,25%,15%)]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-[hsl(200,30%,45%)]">
                    {isRunning
                      ? `Ejecutando nivel ${currentLevel + 1}...`
                      : phase === "done"
                      ? "Ejecucion finalizada exitosamente"
                      : ""}
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono rounded border border-[hsl(200,40%,20%)] text-[hsl(200,30%,60%)] hover:border-[hsl(40,100%,55%,0.3)] hover:text-[hsl(40,100%,55%)] transition-all"
                >
                  <RotateCcw size={12} /> Reiniciar
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tech details ── */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Coffee,
              title: "Java 17+",
              desc: "Uso de BigInteger para fracciones exactas, switch expressions, records y static inner classes.",
            },
            {
              icon: Code2,
              title: "856 lineas",
              desc: "Archivo unico con 10 clases internas: Fraction, Matrix, Solvers, Level, ConsoleIO, etc.",
            },
            {
              icon: Cpu,
              title: "Prototipo -> Web",
              desc: "Este prototipo de consola evoluciono a la demo web interactiva que ves arriba con animaciones de IA.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="glass-card rounded-xl p-5 group hover:border-[hsl(40,100%,55%,0.3)] transition-all duration-300"
              style={{ borderColor: "hsla(40,100%,55%,0.08)" }}
            >
              <item.icon className="text-[hsl(40,100%,55%)] mb-3 group-hover:scale-110 transition-transform" size={20} />
              <h4 className="font-mono text-sm font-bold text-[hsl(40,100%,55%)] mb-1">{item.title}</h4>
              <p className="text-[hsl(200,30%,55%)] text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
