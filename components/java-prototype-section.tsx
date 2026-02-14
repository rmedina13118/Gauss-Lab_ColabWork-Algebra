"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  Play,
  Code2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
  Coffee,
  Cpu,
  SendHorizontal,
} from "lucide-react"
import { SectionHeading } from "./section-heading"

/* ================================================================
   FRACTION (exact rational arithmetic, ported from Java)
   ================================================================ */
class Fraction {
  readonly num: bigint
  readonly den: bigint

  static ZERO = new Fraction(0n, 1n)
  static ONE = new Fraction(1n, 1n)

  constructor(num: bigint, den: bigint) {
    if (den === 0n) throw new Error("Denominador 0")
    if (den < 0n) { num = -num; den = -den }
    const g = Fraction.gcd(num < 0n ? -num : num, den < 0n ? -den : den)
    this.num = num / g
    this.den = den / g
  }

  private static gcd(a: bigint, b: bigint): bigint {
    a = a < 0n ? -a : a
    b = b < 0n ? -b : b
    while (b !== 0n) { const t = b; b = a % b; a = t }
    return a || 1n
  }

  static of(n: number): Fraction { return new Fraction(BigInt(n), 1n) }

  static parse(s: string): Fraction {
    const t = s.trim()
    if (!t) throw new Error("Entrada vacia")
    if (t.includes("/")) {
      const [a, b] = t.split("/")
      return new Fraction(BigInt(a.trim()), BigInt(b.trim()))
    }
    return new Fraction(BigInt(t), 1n)
  }

  isZero() { return this.num === 0n }
  eq(o: Fraction) { return this.num === o.num && this.den === o.den }
  negate() { return new Fraction(-this.num, this.den) }
  add(o: Fraction) { return new Fraction(this.num * o.den + o.num * this.den, this.den * o.den) }
  sub(o: Fraction) { return new Fraction(this.num * o.den - o.num * this.den, this.den * o.den) }
  mul(o: Fraction) { return new Fraction(this.num * o.num, this.den * o.den) }
  div(o: Fraction) {
    if (o.num === 0n) throw new Error("Div / 0")
    return new Fraction(this.num * o.den, this.den * o.num)
  }
  reciprocal() {
    if (this.num === 0n) throw new Error("0 no tiene reciproco")
    return new Fraction(this.den, this.num)
  }
  gte(o: Fraction) { return this.num * o.den >= o.num * this.den }
  toString() { return this.den === 1n ? `${this.num}` : `${this.num}/${this.den}` }
}

/* ================================================================
   MATRIX (row operations, ported from Java)
   ================================================================ */
class Matrix {
  a: Fraction[][]
  constructor(data: Fraction[][]) {
    this.a = data.map((r) => [...r])
  }
  rows() { return this.a.length }
  cols() { return this.a[0].length }
  get(r: number, c: number) { return this.a[r][c] }
  set(r: number, c: number, v: Fraction) { this.a[r][c] = v }
  copy() { return new Matrix(this.a.map((r) => [...r])) }

  swapRows(r1: number, r2: number) {
    const tmp = this.a[r1]; this.a[r1] = this.a[r2]; this.a[r2] = tmp
  }
  scaleRow(r: number, k: Fraction) {
    for (let c = 0; c < this.cols(); c++) this.a[r][c] = this.a[r][c].mul(k)
  }
  addMultipleOfRow(target: number, source: number, k: Fraction) {
    if (k.isZero()) return
    for (let c = 0; c < this.cols(); c++) this.a[target][c] = this.a[target][c].add(this.a[source][c].mul(k))
  }
  isZeroRowLeft(r: number, nVars: number) {
    for (let c = 0; c < nVars; c++) if (!this.a[r][c].isZero()) return false
    return true
  }
  isZeroRowAll(r: number) {
    for (let c = 0; c < this.cols(); c++) if (!this.a[r][c].isZero()) return false
    return true
  }
  toPretty(splitCol: number) {
    return this.a.map((row) => {
      let s = "[ "
      row.forEach((v, c) => {
        if (c === splitCol) s += "| "
        s += v.toString().padEnd(10)
      })
      return s + "]"
    })
  }
}

/* ================================================================
   SOLVER STEP
   ================================================================ */
interface SolverStep { op: string; snapshot: string[] }

/* ================================================================
   GAUSS-JORDAN SOLVER (RREF) - ported from Java
   ================================================================ */
function solveGaussJordan(aug: Matrix, nVars: number) {
  const m = aug.copy()
  const steps: SolverStep[] = [{ op: "Matriz aumentada inicial [A|b]", snapshot: m.toPretty(nVars) }]
  let r = 0, lead = 0

  while (r < m.rows() && lead < nVars) {
    let i = r
    while (i < m.rows() && m.get(i, lead).isZero()) i++
    if (i === m.rows()) { lead++; continue }

    if (i !== r) {
      m.swapRows(i, r)
      steps.push({ op: `Intercambio: R${i + 1} <-> R${r + 1}`, snapshot: m.toPretty(nVars) })
    }

    const pivot = m.get(r, lead)
    if (!pivot.eq(Fraction.ONE)) {
      const k = pivot.reciprocal()
      m.scaleRow(r, k)
      steps.push({ op: `Normalizar pivote: R${r + 1} <- (${k}) R${r + 1}`, snapshot: m.toPretty(nVars) })
    }

    for (let rr = 0; rr < m.rows(); rr++) {
      if (rr === r) continue
      const factor = m.get(rr, lead)
      if (!factor.isZero()) {
        const k = factor.negate()
        m.addMultipleOfRow(rr, r, k)
        const desc = factor.gte(Fraction.ZERO)
          ? `Eliminar: R${rr + 1} <- R${rr + 1} - (${factor}) R${r + 1}`
          : `Eliminar: R${rr + 1} <- R${rr + 1} + (${factor.negate()}) R${r + 1}`
        steps.push({ op: desc, snapshot: m.toPretty(nVars) })
      }
    }
    r++; lead++
  }

  let rankA = 0, rankAug = 0
  for (let row = 0; row < m.rows(); row++) {
    if (!m.isZeroRowLeft(row, nVars)) rankA++
    if (!m.isZeroRowAll(row)) rankAug++
  }

  let type: "UNIQUE" | "INFINITE" | "NONE"
  if (rankA < rankAug) type = "NONE"
  else if (rankA === nVars) type = "UNIQUE"
  else type = "INFINITE"

  const solLines: string[] = []
  const varNames = ["x", "y"]
  if (type === "NONE") {
    solLines.push("El sistema es INCONSISTENTE => NO tiene solucion.")
  } else if (type === "UNIQUE") {
    solLines.push(`${varNames[0]} = ${m.get(0, 2)}`)
    solLines.push(`${varNames[1]} = ${m.get(1, 2)}`)
  } else {
    const a11 = m.get(0, 0), a12 = m.get(0, 1), b1 = m.get(0, 2)
    if (!a11.isZero()) {
      solLines.push(`${varNames[1]} = t (parametro libre)`)
      solLines.push(`${varNames[0]} = ${b1.div(a11)} - (${a12.div(a11)})*t`)
    } else {
      solLines.push(`${varNames[0]} = t (parametro libre)`)
      solLines.push(`${varNames[1]} = ${b1.div(a12)}`)
    }
    solLines.push("Nota: infinitas soluciones porque rank(A) = rank([A|b]) < 2")
  }

  const typeEs = type === "UNIQUE" ? "soluciónunica" : type === "INFINITE" ? "Infinitas soluciones" : "Ninguna solucion"
  return { steps, rref: m.toPretty(nVars), rankA, rankAug, type: typeEs, solLines }
}

/* ================================================================
   GAUSS ELIMINATION SOLVER (REF) - ported from Java
   ================================================================ */
function solveGaussElim(aug: Matrix, nVars: number) {
  const m = aug.copy()
  const steps: SolverStep[] = [{ op: "Matriz aumentada inicial [A|b]", snapshot: m.toPretty(nVars) }]
  let pivotRow = 0

  for (let col = 0; col < nVars && pivotRow < m.rows(); col++) {
    let best = pivotRow
    while (best < m.rows() && m.get(best, col).isZero()) best++
    if (best === m.rows()) continue

    if (best !== pivotRow) {
      m.swapRows(best, pivotRow)
      steps.push({ op: `Intercambio: R${best + 1} <-> R${pivotRow + 1}`, snapshot: m.toPretty(nVars) })
    }

    const pivot = m.get(pivotRow, col)
    if (!pivot.eq(Fraction.ONE)) {
      const k = pivot.reciprocal()
      m.scaleRow(pivotRow, k)
      steps.push({ op: `Normalizar pivote: R${pivotRow + 1} <- (${k}) R${pivotRow + 1}`, snapshot: m.toPretty(nVars) })
    }

    for (let rr = pivotRow + 1; rr < m.rows(); rr++) {
      const factor = m.get(rr, col)
      if (!factor.isZero()) {
        const k = factor.negate()
        m.addMultipleOfRow(rr, pivotRow, k)
        const desc = factor.gte(Fraction.ZERO)
          ? `Eliminar abajo: R${rr + 1} <- R${rr + 1} - (${factor}) R${pivotRow + 1}`
          : `Eliminar abajo: R${rr + 1} <- R${rr + 1} + (${factor.negate()}) R${pivotRow + 1}`
        steps.push({ op: desc, snapshot: m.toPretty(nVars) })
      }
    }
    pivotRow++
  }

  let rankA = 0, rankAug = 0
  for (let row = 0; row < m.rows(); row++) {
    if (!m.isZeroRowLeft(row, nVars)) rankA++
    if (!m.isZeroRowAll(row)) rankAug++
  }

  let type: "UNIQUE" | "INFINITE" | "NONE"
  if (rankA < rankAug) type = "NONE"
  else if (rankA === nVars) type = "UNIQUE"
  else type = "INFINITE"

  const solLines: string[] = []
  const varNames = ["x", "y"]
  if (type === "NONE") {
    solLines.push("El sistema es INCONSISTENTE => NO tiene solucion.")
  } else if (type === "UNIQUE") {
    const p = m.get(0, 1), q = m.get(0, 2), r1 = m.get(1, 1), r2 = m.get(1, 2)
    const y = r2.div(r1)
    const x = q.sub(p.mul(y))
    solLines.push(`${varNames[0]} = ${x}`)
    solLines.push(`${varNames[1]} = ${y}`)
  } else {
    const a = m.get(0, 0), b = m.get(0, 1), c = m.get(0, 2)
    if (!a.isZero()) {
      solLines.push(`${varNames[1]} = t (parametro libre)`)
      solLines.push(`${varNames[0]} = ${c.div(a)} - (${b.div(a)})*t`)
    } else {
      solLines.push(`${varNames[0]} = t (parametro libre)`)
      solLines.push(`${varNames[1]} = ${c.div(b)}`)
    }
    solLines.push("Nota: infinitas soluciones porque rank(A) = rank([A|b]) < 2")
  }

  const typeEs = type === "UNIQUE" ? "soluciónunica" : type === "INFINITE" ? "Infinitas soluciones" : "Ninguna solucion"
  return { steps, ref: m.toPretty(nVars), rankA, rankAug, type: typeEs, solLines }
}

/* ================================================================
   CONSOLE LINE TYPE
   ================================================================ */
type LineType = "system" | "output" | "input" | "success" | "error" | "separator" | "header" | "prompt"

interface ConLine { text: string; type: LineType }

/* ================================================================
   THINKING DOTS
   ================================================================ */
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

/* ================================================================
   JAVA SYNTAX HIGHLIGHT
   ================================================================ */
function javaHighlight(code: string): { text: string; className?: string }[] {
  return code.split("\n").map((line) => {
    if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*") || line.trimStart().startsWith("/**"))
      return { text: line, className: "text-[hsl(200,30%,45%)] italic" }
    if (line.trimStart().startsWith("@"))
      return { text: line, className: "text-[hsl(40,100%,55%)]" }
    if (line.trimStart().startsWith("import"))
      return { text: line, className: "text-[hsl(200,60%,60%)]" }
    if (/^\s*(public|private|static|final|class|enum|void|int|if|else|while|for|return|new|switch|case|this)\b/.test(line))
      return { text: line, className: "text-[hsl(280,70%,70%)]" }
    if (line.includes('"'))
      return { text: line, className: "text-[hsl(120,50%,60%)]" }
    return { text: line, className: "text-[hsl(180,100%,90%)]" }
  })
}

/* ================================================================
   JAVA SOURCE CODE PREVIEW (abbreviated)
   ================================================================ */
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
            // ... solve and show steps
        }
    }
    // ... Fraction, Matrix, Solvers, Levels (856 lines total)
}`

/* ================================================================
   INTERACTIVE TERMINAL STATE MACHINE
   ================================================================ */
type Phase =
  | "idle"
  | "header"
  | "menu"
  | "level-guess"
  | "level-method"
  | "level-solving"
  | "level-continue"
  | "custom-a11" | "custom-a12" | "custom-b1"
  | "custom-a21" | "custom-a22" | "custom-b2"
  | "custom-method"
  | "custom-solving"
  | "done"

/* LEVEL DATA */
const LEVELS_DATA = [
  {
    title: "Puerta 01: Sistema dependiente",
    story: "El panel detecta ecuaciones proporcionales. Que implica esto?",
    coefs: [2, 2, 4, 1, 1, 2] as const,
    varNames: ["x", "y"],
  },
  {
    title: "Puerta 02: Filas proporcionales",
    story: "Una fila resulta multiplo de la otra. Analiza el tipo de solucion.",
    coefs: [3, 6, 9, 1, 2, 3] as const,
    varNames: ["x", "y"],
  },
  {
    title: "Puerta 03: Sistema independiente",
    story: "El reactor solo se estabiliza si encontras una soluciónexacta para x e y.",
    coefs: [2, 1, 5, 1, -1, 1] as const,
    varNames: ["x", "y"],
  },
  {
    title: "Puerta 04: Contradiccion",
    story: "Dos sensores se contradicen: se puede abrir la puerta?",
    coefs: [1, 1, 2, 1, 1, 3] as const,
    varNames: ["x", "y"],
  },
]

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export function JavaPrototypeSection() {
  const [activeTab, setActiveTab] = useState<"code" | "run">("code")
  const [codeExpanded, setCodeExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  // Terminal state
  const [lines, setLines] = useState<ConLine[]>([])
  const [phase, setPhase] = useState<Phase>("idle")
  const [inputValue, setInputValue] = useState("")
  const [inputPlaceholder, setInputPlaceholder] = useState("")
  const [menuMode, setMenuMode] = useState<"levels" | "custom" | null>(null)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [userGuess, setUserGuess] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Custom system coefficients
  const [customCoefs, setCustomCoefs] = useState<string[]>([])

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })
  }, [])

  const addLine = useCallback((text: string, type: LineType = "output") => {
    setLines((prev) => [...prev, { text, type }])
  }, [])

  const addLines = useCallback((newLines: [string, LineType][]) => {
    setLines((prev) => [...prev, ...newLines.map(([text, type]) => ({ text, type }))])
  }, [])

  useEffect(() => { scrollToBottom() }, [lines, scrollToBottom])
  useEffect(() => { if (phase !== "idle" && phase !== "done" && inputRef.current) inputRef.current.focus() }, [phase])

  /* ── Start program ── */
  const startProgram = useCallback(() => {
    setLines([])
    setPhase("header")
    setCurrentLevel(0)
    setCustomCoefs([])
    setMenuMode(null)

    const headerLines: [string, LineType][] = [
      ["$ javac GaussLabConsole.java", "input"],
      ["$ java GaussLabConsole", "input"],
      ["", "output"],
      ["==============================================", "separator"],
      ["       DESAFIO DE GAUSS (Consola)             ", "header"],
      ["  Sistemas 2x2 + Gauss / Gauss-Jordan         ", "header"],
      ["==============================================", "separator"],
      ["", "output"],
      ["MENU PRINCIPAL", "header"],
      ["1) Jugar niveles (modo GaussLab)", "output"],
      ["2) Resolver un sistema ingresado por el usuario (2x2)", "output"],
      ["3) Salir", "output"],
    ]

    setLines(headerLines.map(([text, type]) => ({ text, type })))
    setPhase("menu")
    setInputPlaceholder("Elegi una opcion (1, 2, 3)...")
  }, [])

  /* ── Show a level intro ── */
  const showLevelIntro = useCallback((lvlIdx: number) => {
    const lvl = LEVELS_DATA[lvlIdx]
    const [a11, a12, b1, a21, a22, b2] = lvl.coefs
    const aug = new Matrix([
      [Fraction.of(a11), Fraction.of(a12), Fraction.of(b1)],
      [Fraction.of(a21), Fraction.of(a22), Fraction.of(b2)],
    ])
    const pretty = aug.toPretty(2)

    const introLines: [string, LineType][] = [
      ["", "output"],
      [`--- NIVEL ${lvlIdx + 1}: ${lvl.title} ---`, "header"],
      [lvl.story, "system"],
      ["", "output"],
      ["Sistema (ecuaciones):", "output"],
      [`${a11}*x + ${a12}*y = ${b1}`, "output"],
      [`${a21}*x + ${a22}*y = ${b2}`, "output"],
      ["", "output"],
      ["Matriz aumentada [A|b]:", "output"],
      ...pretty.map((l): [string, LineType] => [l, "output"]),
      ["", "output"],
      ["Antes de resolver, que tipo de solucióncrees que tiene?", "output"],
      ["1) soluciónunica", "output"],
      ["2) Infinitas soluciones", "output"],
      ["3) Ninguna solucion", "output"],
    ]
    addLines(introLines)
    setPhase("level-guess")
    setInputPlaceholder("Tu prediccion (1, 2 o 3)...")
  }, [addLines])

  /* ── Solve a level ── */
  const solveLevel = useCallback((lvlIdx: number, method: number) => {
    setIsProcessing(true)
    const lvl = LEVELS_DATA[lvlIdx]
    const [a11, a12, b1, a21, a22, b2] = lvl.coefs
    const aug = new Matrix([
      [Fraction.of(a11), Fraction.of(a12), Fraction.of(b1)],
      [Fraction.of(a21), Fraction.of(a22), Fraction.of(b2)],
    ])

    const guessMap: Record<string, string> = { "1": "soluciónunica", "2": "Infinitas soluciones", "3": "Ninguna solucion" }

    setTimeout(() => {
      if (method === 2) {
        const res = solveGaussJordan(aug, 2)
        const outLines: [string, LineType][] = [
          ["", "output"],
          ["=== PASOS (Gauss-Jordan: RREF) ===", "header"],
        ]
        res.steps.forEach((step, i) => {
          outLines.push([`Paso ${i}: ${step.op}`, "output"])
          step.snapshot.forEach((l) => outLines.push([l, "output"]))
        })
        outLines.push(["", "output"])
        outLines.push(["=== MATRIZ ESCALONADA REDUCIDA FINAL (RREF) ===", "header"])
        res.rref.forEach((l) => outLines.push([l, "output"]))
        outLines.push(["", "output"])
        outLines.push(["=== ANALISIS POR RANGO ===", "header"])
        outLines.push([`rank(A)     = ${res.rankA}`, "output"])
        outLines.push([`rank([A|b]) = ${res.rankAug}`, "output"])
        const typeColor: LineType = res.type.includes("unica") ? "success" : res.type.includes("Infinitas") ? "system" : "error"
        outLines.push([`Tipo de solucion: ${res.type}`, typeColor])
        outLines.push(["", "output"])
        outLines.push(["=== solución===", "header"])
        res.solLines.forEach((l) => outLines.push([l, res.type.includes("Ninguna") ? "error" : "success"]))

        // Verification
        outLines.push(["", "output"])
        outLines.push(["=== VERIFICACION ===", "header"])
        outLines.push([`Tu prediccion:      ${guessMap[userGuess] || "?"}`, "output"])
        outLines.push([`Resultado programa: ${res.type}`, "output"])
        if (guessMap[userGuess] === res.type) outLines.push(["Acertaste!", "success"])
        else outLines.push(["No acertaste esta vez.", "error"])

        addLines(outLines)
      } else {
        const res = solveGaussElim(aug, 2)
        const outLines: [string, LineType][] = [
          ["", "output"],
          ["=== PASOS (Eliminacion de Gauss: REF) ===", "header"],
        ]
        res.steps.forEach((step, i) => {
          outLines.push([`Paso ${i}: ${step.op}`, "output"])
          step.snapshot.forEach((l) => outLines.push([l, "output"]))
        })
        outLines.push(["", "output"])
        outLines.push(["=== MATRIZ ESCALONADA FINAL (REF) ===", "header"])
        res.ref.forEach((l) => outLines.push([l, "output"]))
        outLines.push(["", "output"])
        outLines.push(["=== ANALISIS POR RANGO ===", "header"])
        outLines.push([`rank(A)     = ${res.rankA}`, "output"])
        outLines.push([`rank([A|b]) = ${res.rankAug}`, "output"])
        const typeColor: LineType = res.type.includes("unica") ? "success" : res.type.includes("Infinitas") ? "system" : "error"
        outLines.push([`Tipo de solucion: ${res.type}`, typeColor])
        outLines.push(["", "output"])
        outLines.push(["=== solución===", "header"])
        res.solLines.forEach((l) => outLines.push([l, res.type.includes("Ninguna") ? "error" : "success"]))

        outLines.push(["", "output"])
        outLines.push(["=== VERIFICACION ===", "header"])
        outLines.push([`Tu prediccion:      ${guessMap[userGuess] || "?"}`, "output"])
        outLines.push([`Resultado programa: ${res.type}`, "output"])
        if (guessMap[userGuess] === res.type) outLines.push(["Acertaste!", "success"])
        else outLines.push(["No acertaste esta vez.", "error"])

        addLines(outLines)
      }

      setIsProcessing(false)

      if (lvlIdx < LEVELS_DATA.length - 1) {
        addLine("", "output")
        addLine("Presiona ENTER para continuar al siguiente nivel...", "prompt")
        setPhase("level-continue")
        setInputPlaceholder("Presiona ENTER...")
      } else {
        addLine("", "output")
        addLine("=== Todos los niveles completados! ===", "header")
        addLine("", "output")
        addLine("MENU PRINCIPAL", "header")
        addLine("1) Jugar niveles (modo GaussLab)", "output")
        addLine("2) Resolver un sistema ingresado por el usuario (2x2)", "output")
        addLine("3) Salir", "output")
        setPhase("menu")
        setInputPlaceholder("Elegi una opcion (1, 2, 3)...")
      }
    }, 600)
  }, [addLines, addLine, userGuess])

  /* ── Solve custom system ── */
  const solveCustom = useCallback((coefs: string[], method: number) => {
    setIsProcessing(true)
    setTimeout(() => {
      try {
        const fracs = coefs.map((c) => Fraction.parse(c))
        const aug = new Matrix([
          [fracs[0], fracs[1], fracs[2]],
          [fracs[3], fracs[4], fracs[5]],
        ])

        addLine("", "output")
        addLine("Sistema ingresado:", "output")
        addLine(`${fracs[0]}*x + ${fracs[1]}*y = ${fracs[2]}`, "output")
        addLine(`${fracs[3]}*x + ${fracs[4]}*y = ${fracs[5]}`, "output")
        addLine("", "output")
        addLine("Matriz aumentada [A|b]:", "output")
        aug.toPretty(2).forEach((l) => addLine(l, "output"))

        if (method === 2) {
          const res = solveGaussJordan(aug, 2)
          addLine("", "output")
          addLine("=== PASOS (Gauss-Jordan: RREF) ===", "header")
          res.steps.forEach((step, i) => {
            addLine(`Paso ${i}: ${step.op}`, "output")
            step.snapshot.forEach((l) => addLine(l, "output"))
          })
          addLine("", "output")
          addLine("=== MATRIZ ESCALONADA REDUCIDA FINAL (RREF) ===", "header")
          res.rref.forEach((l) => addLine(l, "output"))
          addLine("", "output")
          addLine("=== ANALISIS POR RANGO ===", "header")
          addLine(`rank(A)     = ${res.rankA}`, "output")
          addLine(`rank([A|b]) = ${res.rankAug}`, "output")
          const typeColor: LineType = res.type.includes("unica") ? "success" : res.type.includes("Infinitas") ? "system" : "error"
          addLine(`Tipo de solucion: ${res.type}`, typeColor)
          addLine("", "output")
          addLine("=== solución===", "header")
          res.solLines.forEach((l) => addLine(l, res.type.includes("Ninguna") ? "error" : "success"))
        } else {
          const res = solveGaussElim(aug, 2)
          addLine("", "output")
          addLine("=== PASOS (Eliminacion de Gauss: REF) ===", "header")
          res.steps.forEach((step, i) => {
            addLine(`Paso ${i}: ${step.op}`, "output")
            step.snapshot.forEach((l) => addLine(l, "output"))
          })
          addLine("", "output")
          addLine("=== MATRIZ ESCALONADA FINAL (REF) ===", "header")
          res.ref.forEach((l) => addLine(l, "output"))
          addLine("", "output")
          addLine("=== ANALISIS POR RANGO ===", "header")
          addLine(`rank(A)     = ${res.rankA}`, "output")
          addLine(`rank([A|b]) = ${res.rankAug}`, "output")
          const typeColor: LineType = res.type.includes("unica") ? "success" : res.type.includes("Infinitas") ? "system" : "error"
          addLine(`Tipo de solucion: ${res.type}`, typeColor)
          addLine("", "output")
          addLine("=== solución===", "header")
          res.solLines.forEach((l) => addLine(l, res.type.includes("Ninguna") ? "error" : "success"))
        }
      } catch {
        addLine("Error: entrada invalida. Usa enteros o fracciones como 5 o -3/2", "error")
      }

      setIsProcessing(false)
      addLine("", "output")
      addLine("MENU PRINCIPAL", "header")
      addLine("1) Jugar niveles (modo GaussLab)", "output")
      addLine("2) Resolver un sistema ingresado por el usuario (2x2)", "output")
      addLine("3) Salir", "output")
      setPhase("menu")
      setInputPlaceholder("Elegi una opcion (1, 2, 3)...")
    }, 600)
  }, [addLine])

  /* ── Process user input ── */
  const handleInput = useCallback(() => {
    const val = inputValue.trim()
    setInputValue("")

    switch (phase) {
      case "menu": {
        addLine(`>>> ${val}`, "input")
        if (val === "1") {
          setMenuMode("levels")
          setCurrentLevel(0)
          addLine("", "output")
          addLine("=== MODO HISTORIA: GAUSSLAB ===", "header")
          addLine("Regla: primero PREDECIS el tipo de solucion, luego el programa lo verifica.", "system")
          showLevelIntro(0)
        } else if (val === "2") {
          setMenuMode("custom")
          setCustomCoefs([])
          addLine("", "output")
          addLine("=== SISTEMA PERSONALIZADO (2x2) ===", "header")
          addLine("Formato del sistema:", "output")
          addLine("a11*x + a12*y = b1", "output")
          addLine("a21*x + a22*y = b2", "output")
          addLine("Podes ingresar enteros o fracciones: 5  o  -3/2", "system")
          addLine("", "output")
          setPhase("custom-a11")
          setInputPlaceholder("a11: (ej: 2, -3, 1/2)")
        } else if (val === "3") {
          addLine("", "output")
          addLine("Fin del programa!", "success")
          setPhase("done")
        } else {
          addLine("Valor fuera de rango (1..3). Intente de nuevo.", "error")
        }
        break
      }

      case "level-guess": {
        addLine(`>>> Tu prediccion: ${val}`, "input")
        if (["1", "2", "3"].includes(val)) {
          setUserGuess(val)
          setPhase("level-method")
          setInputPlaceholder("Metodo (1=Gauss, 2=Gauss-Jordan)...")
          addLine("Metodo (1=Gauss, 2=Gauss-Jordan):", "output")
        } else {
          addLine("Valor fuera de rango (1..3). Intente de nuevo.", "error")
        }
        break
      }

      case "level-method": {
        addLine(`>>> ${val}`, "input")
        const method = parseInt(val)
        if (method === 1 || method === 2) {
          setPhase("level-solving")
          solveLevel(currentLevel, method)
        } else {
          addLine("Valor fuera de rango (1..2). Intente de nuevo.", "error")
        }
        break
      }

      case "level-continue": {
        addLine(">>> [ENTER]", "input")
        const nextLevel = currentLevel + 1
        setCurrentLevel(nextLevel)
        showLevelIntro(nextLevel)
        break
      }

      case "custom-a11": {
        addLine(`>>> a11: ${val}`, "input")
        try { Fraction.parse(val); setCustomCoefs([val]); setPhase("custom-a12"); setInputPlaceholder("a12: (ej: 2, -3, 1/2)") }
        catch { addLine("Entrada invalida. Use formatos: 5 o -3/2", "error") }
        break
      }
      case "custom-a12": {
        addLine(`>>> a12: ${val}`, "input")
        try { Fraction.parse(val); setCustomCoefs((p) => [...p, val]); setPhase("custom-b1"); setInputPlaceholder("b1: (ej: 5, -1, 3/4)") }
        catch { addLine("Entrada invalida. Use formatos: 5 o -3/2", "error") }
        break
      }
      case "custom-b1": {
        addLine(`>>> b1: ${val}`, "input")
        try { Fraction.parse(val); setCustomCoefs((p) => [...p, val]); setPhase("custom-a21"); setInputPlaceholder("a21: (ej: 1, -2, 5/3)") }
        catch { addLine("Entrada invalida. Use formatos: 5 o -3/2", "error") }
        break
      }
      case "custom-a21": {
        addLine(`>>> a21: ${val}`, "input")
        try { Fraction.parse(val); setCustomCoefs((p) => [...p, val]); setPhase("custom-a22"); setInputPlaceholder("a22: (ej: 3, -1, 7/2)") }
        catch { addLine("Entrada invalida. Use formatos: 5 o -3/2", "error") }
        break
      }
      case "custom-a22": {
        addLine(`>>> a22: ${val}`, "input")
        try { Fraction.parse(val); setCustomCoefs((p) => [...p, val]); setPhase("custom-b2"); setInputPlaceholder("b2: (ej: 4, -2, 9/5)") }
        catch { addLine("Entrada invalida. Use formatos: 5 o -3/2", "error") }
        break
      }
      case "custom-b2": {
        addLine(`>>> b2: ${val}`, "input")
        try {
          Fraction.parse(val)
          const allCoefs = [...customCoefs, val]
          setCustomCoefs(allCoefs)
          setPhase("custom-method")
          setInputPlaceholder("Metodo (1=Gauss, 2=Gauss-Jordan)...")
          addLine("", "output")
          addLine("Metodo (1=Gauss, 2=Gauss-Jordan):", "output")
        } catch { addLine("Entrada invalida. Use formatos: 5 o -3/2", "error") }
        break
      }
      case "custom-method": {
        addLine(`>>> ${val}`, "input")
        const method = parseInt(val)
        if (method === 1 || method === 2) {
          setPhase("custom-solving")
          solveCustom([...customCoefs], method)
        } else {
          addLine("Valor fuera de rango (1..2). Intente de nuevo.", "error")
        }
        break
      }
      default:
        break
    }
  }, [phase, inputValue, addLine, showLevelIntro, solveLevel, solveCustom, currentLevel, customCoefs, userGuess])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isProcessing) handleInput()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JAVA_SOURCE_PREVIEW)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setLines([])
    setPhase("idle")
    setInputValue("")
    setCurrentLevel(0)
    setCustomCoefs([])
    setMenuMode(null)
    setIsProcessing(false)
  }

  const getLineStyle = (type: LineType) => {
    switch (type) {
      case "system": return "text-[hsl(200,30%,55%)] italic"
      case "output": return "text-[hsl(180,100%,90%)]"
      case "input": return "text-[hsl(40,100%,55%)]"
      case "success": return "text-[hsl(150,100%,50%)] font-bold"
      case "error": return "text-[hsl(0,80%,60%)] font-bold"
      case "separator": return "text-[hsl(200,30%,30%)]"
      case "header": return "text-[hsl(40,100%,55%)] font-bold"
      case "prompt": return "text-[hsl(170,100%,50%)] animate-pulse-neon"
      default: return "text-[hsl(180,100%,90%)]"
    }
  }

  const highlightedCode = javaHighlight(JAVA_SOURCE_PREVIEW)

  const showInput = phase !== "idle" && phase !== "done" && phase !== "level-solving" && phase !== "custom-solving"

  return (
    <section id="prototipo" className="relative py-24 px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, hsla(40,100%,50%,0.02) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto">
        <SectionHeading
          tag="Prototipo"
          title="GaussLab Console (Java)"
          description="Prototipo inicial del proyecto en Java. Explora el codigo fuente o ejecuta la consola interactiva: ingresa tus propios coeficientes y resuelve sistemas 2x2 en tiempo real."
        />

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-0 px-2">
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-mono text-xs transition-all ${activeTab === "code"
                ? "bg-[hsl(220,25%,8%)] text-[hsl(40,100%,55%)] border border-b-0 border-[hsl(40,100%,55%,0.25)]"
                : "bg-transparent text-[hsl(200,30%,45%)] hover:text-[hsl(200,30%,60%)]"
              }`}
          >
            <Code2 size={14} />
            GaussLabConsole.java
          </button>
          <button
            onClick={() => setActiveTab("run")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-mono text-xs transition-all ${activeTab === "run"
                ? "bg-[hsl(220,25%,8%)] text-[hsl(40,100%,55%)] border border-b-0 border-[hsl(40,100%,55%,0.25)]"
                : "bg-transparent text-[hsl(200,30%,45%)] hover:text-[hsl(200,30%,60%)]"
              }`}
          >
            <Terminal size={14} />
            Ejecutar
          </button>
        </div>

        {/* ══ CODE TAB ══ */}
        {activeTab === "code" && (
          <div className="glass-card rounded-2xl rounded-tl-none overflow-hidden" style={{ borderColor: "hsla(40,100%,55%,0.15)" }}>
            <div className="flex items-center justify-between px-5 py-3 bg-[hsl(220,25%,8%)] border-b border-[hsl(40,100%,55%,0.1)]">
              <div className="flex items-center gap-3">
                <Coffee className="text-[hsl(40,100%,55%)]" size={16} />
                <span className="font-mono text-xs text-[hsl(40,100%,55%)] tracking-wider">JAVA 17+ | GaussLabConsole.java</span>
                <span className="px-2 py-0.5 text-[8px] font-mono font-bold rounded bg-[hsl(40,100%,55%,0.15)] text-[hsl(40,100%,55%)] border border-[hsl(40,100%,55%,0.2)]">856 lineas</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono rounded border border-[hsl(200,40%,20%)] text-[hsl(200,30%,60%)] hover:border-[hsl(40,100%,55%,0.3)] hover:text-[hsl(40,100%,55%)] transition-all">
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

            <div className={`relative bg-[hsl(220,25%,5%)] p-5 transition-all duration-500 ${codeExpanded ? "max-h-[600px]" : "max-h-[350px]"} overflow-y-auto`} style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(40,100%,30%) transparent" }}>
              <pre className="font-mono text-xs leading-relaxed">
                {highlightedCode.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="inline-block w-10 text-right pr-3 text-[hsl(200,30%,30%)] select-none shrink-0 tabular-nums">{i + 1}</span>
                    <span className={line.className || "text-[hsl(180,100%,90%)]"}>{line.text}</span>
                  </div>
                ))}
              </pre>
              {!codeExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[hsl(220,25%,5%)] to-transparent pointer-events-none" />
              )}
            </div>

            <button
              onClick={() => setCodeExpanded(!codeExpanded)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[hsl(220,25%,7%)] text-[hsl(200,30%,50%)] hover:text-[hsl(40,100%,55%)] text-xs font-mono transition-all border-t border-[hsl(40,100%,55%,0.05)]"
            >
              {codeExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {codeExpanded ? "Ver menos" : "Ver mas codigo"}
            </button>

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
                  <div key={item.name} className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-[hsl(220,25%,9%)] border border-[hsl(40,100%,55%,0.08)] hover:border-[hsl(40,100%,55%,0.2)] transition-all">
                    <Code2 className="text-[hsl(40,100%,55%)]" size={14} />
                    <span className="font-mono text-[10px] text-[hsl(40,100%,55%)]">{item.name}</span>
                    <span className="font-mono text-[8px] text-[hsl(200,30%,45%)]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ RUN TAB (Interactive Terminal) ══ */}
        {activeTab === "run" && (
          <div className="glass-card rounded-2xl rounded-tl-none overflow-hidden" style={{ borderColor: "hsla(40,100%,55%,0.15)" }}>
            {/* Terminal header */}
            <div className="flex items-center justify-between px-5 py-3 bg-[hsl(220,25%,8%)] border-b border-[hsl(40,100%,55%,0.1)]">
              <div className="flex items-center gap-3">
                <Terminal className="text-[hsl(40,100%,55%)]" size={16} />
                <span className="font-mono text-xs text-[hsl(40,100%,55%)] tracking-wider">Consola Interactiva Java</span>
                {menuMode === "levels" && phase !== "done" && phase !== "menu" && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[hsl(50,100%,55%,0.1)] border border-[hsl(50,100%,55%,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(50,100%,55%)] animate-pulse-neon" />
                    <span className="font-mono text-[8px] text-[hsl(50,100%,55%)]">NIVEL {currentLevel + 1}/{LEVELS_DATA.length}</span>
                  </span>
                )}
                {menuMode === "custom" && !["menu", "done"].includes(phase) && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[hsl(200,100%,55%,0.1)] border border-[hsl(200,100%,55%,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(200,100%,55%)] animate-pulse-neon" />
                    <span className="font-mono text-[8px] text-[hsl(200,100%,55%)]">PERSONALIZADO</span>
                  </span>
                )}
                {phase === "done" && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[hsl(150,100%,50%,0.1)] border border-[hsl(150,100%,50%,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(150,100%,50%)]" />
                    <span className="font-mono text-[8px] text-[hsl(150,100%,50%)]">FINALIZADO</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {phase !== "idle" && (
                  <button onClick={handleReset} className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono rounded border border-[hsl(200,40%,20%)] text-[hsl(200,30%,60%)] hover:border-[hsl(40,100%,55%,0.3)] hover:text-[hsl(40,100%,55%)] transition-all">
                    <RotateCcw size={12} /> Reiniciar
                  </button>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[hsl(0,80%,50%)]" />
                  <span className="w-2 h-2 rounded-full bg-[hsl(50,90%,50%)]" />
                  <span className="w-2 h-2 rounded-full bg-[hsl(150,80%,50%)]" />
                </span>
              </div>
            </div>

            {/* Terminal body */}
            <div
              ref={scrollRef}
              className="bg-[hsl(220,25%,4%)] p-5 min-h-[400px] max-h-[520px] overflow-y-auto"
              style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(40,100%,30%) transparent" }}
              onClick={() => inputRef.current?.focus()}
            >
              {phase === "idle" ? (
                <div className="flex flex-col items-center justify-center h-[360px] gap-6">
                  <div className="relative">
                    <Terminal className="text-[hsl(40,100%,55%,0.3)]" size={48} />
                    <Cpu className="absolute -bottom-1 -right-1 text-[hsl(40,100%,55%)]" size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-[hsl(180,100%,95%)] font-mono text-sm mb-2 text-balance">Consola Interactiva GaussLabConsole.java</p>
                    <p className="text-[hsl(200,30%,50%)] text-xs max-w-md leading-relaxed">
                      Ejecuta el prototipo Java de forma interactiva. Podes jugar los niveles del modo historia o ingresar tu propio sistema 2x2 con los coeficientes que quieras.
                    </p>
                  </div>
                  <button
                    onClick={startProgram}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-lg font-mono font-bold text-sm text-[hsl(220,25%,6%)] bg-[hsl(40,100%,55%)] hover:bg-[hsl(40,100%,65%)] transition-all uppercase tracking-wider group"
                  >
                    <Play size={16} className="group-hover:scale-110 transition-transform" />
                    java GaussLabConsole
                  </button>
                </div>
              ) : (
                <>
                  {/* Console output */}
                  <div className="font-mono text-xs leading-relaxed space-y-0.5">
                    {lines.map((line, i) => (
                      <div key={i} className={`${getLineStyle(line.type)} animate-text-scramble`} style={{ animationDelay: `${Math.min(i * 0.01, 0.3)}s` }}>
                        {line.text || "\u00A0"}
                      </div>
                    ))}
                  </div>

                  {/* Processing indicator */}
                  {isProcessing && (
                    <div className="flex items-center gap-1 mt-2 text-[hsl(40,100%,55%)] font-mono text-xs">
                      <span>Procesando</span>
                      <ThinkingDots />
                    </div>
                  )}

                  {/* Input line */}
                  {showInput && !isProcessing && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[hsl(200,40%,15%)]">
                      <span className="text-[hsl(150,100%,50%)] font-mono text-xs font-bold shrink-0">{">>>"}</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={inputPlaceholder}
                        className="flex-1 bg-transparent text-[hsl(40,100%,55%)] font-mono text-xs outline-none placeholder:text-[hsl(200,30%,30%)] caret-[hsl(40,100%,55%)]"
                        autoFocus
                      />
                      <button
                        onClick={handleInput}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[hsl(40,100%,55%,0.15)] border border-[hsl(40,100%,55%,0.25)] text-[hsl(40,100%,55%)] hover:bg-[hsl(40,100%,55%,0.25)] transition-all"
                      >
                        <SendHorizontal size={12} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Terminal footer with context hints */}
            {phase !== "idle" && (
              <div className="flex items-center justify-between px-5 py-3 bg-[hsl(220,25%,7%)] border-t border-[hsl(40,100%,55%,0.08)]">
                <div className="flex items-center gap-4">
                  {menuMode === "levels" && (
                    <div className="flex items-center gap-1">
                      {LEVELS_DATA.map((_, i) => (
                        <div
                          key={i}
                          className={`w-6 h-1.5 rounded-full transition-all duration-500 ${i < currentLevel ? "bg-[hsl(150,100%,50%)]"
                              : i === currentLevel && !["menu", "done"].includes(phase) ? "bg-[hsl(50,100%,55%)] animate-pulse-neon"
                                : "bg-[hsl(220,25%,15%)]"
                            }`}
                        />
                      ))}
                    </div>
                  )}
                  {menuMode === "custom" && (
                    <div className="flex items-center gap-1">
                      {["a11", "a12", "b1", "a21", "a22", "b2"].map((label, i) => (
                        <div
                          key={label}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-mono transition-all ${i < customCoefs.length ? "bg-[hsl(150,100%,50%,0.15)] text-[hsl(150,100%,50%)] border border-[hsl(150,100%,50%,0.3)]"
                              : i === customCoefs.length && phase.startsWith("custom-") ? "bg-[hsl(40,100%,55%,0.15)] text-[hsl(40,100%,55%)] border border-[hsl(40,100%,55%,0.3)] animate-pulse-neon"
                                : "bg-[hsl(220,25%,12%)] text-[hsl(200,30%,35%)] border border-[hsl(200,40%,15%)]"
                            }`}
                        >
                          {i < customCoefs.length ? customCoefs[i] : label}
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="font-mono text-[10px] text-[hsl(200,30%,45%)]">
                    {phase === "menu" && "Esperando seleccion del menu..."}
                    {phase === "level-guess" && "Ingresa tu prediccion"}
                    {phase === "level-method" && "Selecciona el metodo de resolucion"}
                    {phase === "level-continue" && "Presiona ENTER para continuar"}
                    {phase.startsWith("custom-") && phase !== "custom-method" && phase !== "custom-solving" && "Ingresa el coeficiente"}
                    {phase === "custom-method" && "Selecciona el metodo de resolucion"}
                    {isProcessing && "Resolviendo sistema..."}
                    {phase === "done" && "Programa finalizado"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tech details */}
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
            <div key={item.title} className="glass-card rounded-xl p-5 group hover:border-[hsl(40,100%,55%,0.3)] transition-all duration-300" style={{ borderColor: "hsla(40,100%,55%,0.08)" }}>
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
