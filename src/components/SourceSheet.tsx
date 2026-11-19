import { InlineText } from '@/components/InlineText'
import { chapterNumber } from '@/components/SectionBlock'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { Presentation, Section } from '@/lib/types'

function ChapterSources({ section, grouped = false }: { section: Section; grouped?: boolean }) {
  const subsections = section.subsections.filter(({ sources }) => sources.length)
  if (!subsections.length) return <p className="text-ink-soft italic">Ebben a szekcióban nincs forrás.</p>

  const WorkHeading = grouped ? 'h4' : 'h3'
  const SourceHeading = grouped ? 'h5' : 'h4'
  return (
    <div className="space-y-7">
      {subsections.map(({ id, name, sources }) => (
        <section key={id}>
          <WorkHeading className="font-display text-lg tracking-wide text-red uppercase">{name}</WorkHeading>
          {sources.map(({ title, author, cite, url, paragraphs }) => (
            <article key={title} className="mt-4 border-t-[3px] border-ink pt-4">
              <SourceHeading className="font-display text-xl leading-tight tracking-wide uppercase">{title}</SourceHeading>
              {author && <p className="mt-1 text-ink-soft italic">{author}</p>}
              {cite && <p className="mt-1 text-sm text-ink-soft">{cite}</p>}
              {url && <a href={url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm break-all text-red underline">{url}</a>}
              {paragraphs.map(({ page, text }, index) => (
                <div key={index} className="mt-4" lang="en">
                  {page && <span lang="hu" className="mb-1 block text-[11px] font-bold tracking-widest text-red">o. {page}</span>}
                  <p className="text-sm leading-relaxed text-ink"><InlineText text={text} /></p>
                </div>
              ))}
            </article>
          ))}
        </section>
      ))}
    </div>
  )
}

export function SourceSheet({ presentation, activeSectionId }: { presentation: Presentation; activeSectionId: string | null }) {
  const activeIndex = presentation.sections.findIndex(({ id }) => id === activeSectionId)
  const active = presentation.sections[activeIndex]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" className="fixed top-1/2 right-0 z-50 h-auto -translate-y-1/2 rounded-none border-[3px] border-r-0 border-ink bg-ink px-2 py-4 font-display text-sm tracking-[0.25em] text-paper uppercase [writing-mode:vertical-rl] hover:bg-red focus-visible:border-paper">
          Forrás
        </Button>
      </SheetTrigger>
      <SheetContent side="right" showCloseButton={false} aria-describedby={undefined}
        className="w-[min(92vw,540px)] overflow-y-auto overscroll-contain rounded-none border-l-[3px] border-ink bg-paper p-6">
        <SheetClose asChild>
          <Button type="button" size="icon" variant="outline" aria-label="Bezárás" className="absolute top-5 right-5 size-9 rounded-none border-[3px] border-ink bg-paper text-2xl leading-none hover:bg-red hover:text-paper">
            ×
          </Button>
        </SheetClose>
        <SheetHeader className="border-b-[3px] border-ink p-0 pr-12 pb-4">
          {active && <span aria-hidden="true" lang="ja" className="kanji font-bold text-red">{chapterNumber(activeIndex)}</span>}
          <SheetTitle asChild><h2 className="font-display text-3xl tracking-wide uppercase">{active?.name ?? 'Források'}</h2></SheetTitle>
        </SheetHeader>
        {active ? <ChapterSources section={active} /> : (
          <div className="space-y-8">
            {presentation.sections.map((section) => (
              <section key={section.id}>
                <h3 className="mb-4 font-display text-2xl tracking-wide uppercase">{section.name}</h3>
                <ChapterSources section={section} grouped />
              </section>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
