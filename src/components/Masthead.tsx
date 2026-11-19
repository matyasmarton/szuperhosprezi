import { useEffect, useRef } from 'react'
import type { Section } from '@/lib/types'

export function Masthead({ sections, activeSectionId }: { sections: Section[]; activeSectionId: string | null }) {
  const progress = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    function updateProgress() {
      frame = 0
      const root = document.documentElement
      const scrollable = root.scrollHeight - window.innerHeight
      const fraction = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
      if (progress.current) progress.current.style.transform = `scaleX(${fraction})`
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(updateProgress)
    }
    updateProgress()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-4 py-2 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
        <a href="#eleje" className="w-fit shrink-0 font-display text-xl tracking-wider hover:text-red">SZUPERHŐSÖK</a>
        <nav aria-label="Fejezetek" className="flex flex-wrap gap-x-4 gap-y-1 sm:gap-x-6">
          {sections.map(({ id, name }) => (
            <a key={id} href={`#${id}`} aria-current={id === activeSectionId ? 'location' : undefined}
              className={`font-display text-sm tracking-wide uppercase ${id === activeSectionId ? 'text-red underline decoration-[3px] underline-offset-4' : 'text-ink-soft hover:text-ink'}`}>
              {name}
            </a>
          ))}
        </nav>
      </div>
      <div ref={progress} aria-hidden="true" className="h-[3px] origin-left bg-red" style={{ transform: 'scaleX(0)' }} />
    </header>
  )
}
