"use client"

import { useInView } from "@/hooks/use-in-view"

interface SectionHeadingProps {
  tag: string
  title: string
  description?: string
}

export function SectionHeading({ tag, title, description }: SectionHeadingProps) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={`text-center mb-16 transition-all duration-700 ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <span className="inline-block font-mono text-xs tracking-[0.3em] uppercase text-[hsl(170,100%,50%)] mb-3 px-3 py-1 rounded-full border border-[hsl(170,100%,50%,0.25)] bg-[hsl(170,100%,50%,0.06)]">
        {tag}
      </span>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[hsl(180,100%,95%)] tracking-tight mb-4 text-balance">
        {title}
      </h2>
      {description && (
        <p className="text-[hsl(200,30%,60%)] max-w-2xl mx-auto leading-relaxed text-balance">
          {description}
        </p>
      )}
    </div>
  )
}
