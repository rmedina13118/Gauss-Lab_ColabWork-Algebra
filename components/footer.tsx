"use client"

const quickLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Demo Interactiva", href: "#demo" },
  { label: "Tipos de Solución", href: "#soluciones" },
  { label: "Ejemplos", href: "#ejemplos" },
  { label: "Equipo", href: "#equipo" },
]

const members = [
  "Richard Medina",
  "Yefereson Andara Ruzon",
  "Agustin Benegas",
  "Josefina Carabajal",
]

export function Footer() {
  return (
    <footer className="relative border-t border-[hsl(170,100%,50%,0.1)] bg-[hsl(220,25%,4%)]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="font-mono text-lg font-bold text-[hsl(170,100%,50%)] mb-3">
              {"<"}GaussLab{"/>"}
            </div>
            <p className="text-sm text-[hsl(200,30%,55%)] leading-relaxed">
              Laboratorio interactivo para la resolución de sistemas de ecuaciones lineales 2x2.
            </p>
          </div>

          {/* Academic info */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[hsl(170,100%,50%)] mb-3">
              Informacion Academica
            </h4>
            <ul className="space-y-2 text-sm text-[hsl(200,30%,60%)]">
              <li>Álgebra Lineal <br /> 2° Semestre - Módulo 1</li>
              <li>Profesor: Rafael Martinez</li>
              <li>
                <img src={'/logo-jala.webp'} width={100} height={100} alt="logo-jala" />
                <p>Jala University 2025</p>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[hsl(170,100%,50%)] mb-3">
              Navegacion Rapida
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[hsl(200,30%,60%)] hover:text-[hsl(170,100%,50%)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Team */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[hsl(170,100%,50%)] mb-3">
              Integrantes
            </h4>
            <ul className="space-y-2">
              {members.map((name) => (
                <li key={name} className="text-sm text-[hsl(200,30%,60%)]">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[hsl(200,40%,12%)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[hsl(200,30%,40%)] font-mono">
            GaussLab &mdash; Proyecto Final de Algebra Lineal &copy; 2025
          </p>
          <p className="text-xs text-[hsl(200,30%,35%)] font-mono">
            Desarrollado con Next.js + React + TailwindCSS
          </p>
        </div>
      </div>
    </footer>
  )
}
