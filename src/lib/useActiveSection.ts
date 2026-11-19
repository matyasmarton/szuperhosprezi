import { useEffect, useState } from 'react'

export function useActiveSection() {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')]
    let observer: IntersectionObserver | undefined
    function observe() {
      observer?.disconnect()
      // Pixel margins keep the band relative to viewport height, not width.
      const margin = Math.round(window.innerHeight * 0.45)
      observer = new IntersectionObserver((entries) => {
        if (!entries.length) return
        const midpoint = window.innerHeight / 2
        const active = sections.find((section) => {
          const { top, bottom } = section.getBoundingClientRect()
          return top <= midpoint && bottom > midpoint
        }) ?? sections.find((section) => {
          const { top, bottom } = section.getBoundingClientRect()
          return top < window.innerHeight - margin && bottom > margin
        })
        setActiveSectionId(active?.id ?? null)
      }, { rootMargin: `-${margin}px 0px` })
      sections.forEach((section) => observer?.observe(section))
    }
    observe()
    window.addEventListener('resize', observe)
    return () => {
      window.removeEventListener('resize', observe)
      observer?.disconnect()
    }
  }, [])

  return activeSectionId
}
