import { GallerySlot } from '@/components/GallerySlot'
import { InlineText } from '@/components/InlineText'
import { VideoSlot } from '@/components/VideoSlot'
import { coverUrl } from '@/lib/media'
import type { Point, Section, Subsection } from '@/lib/types'

const numerals = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

export function chapterNumber(index: number) {
  return `第${numerals[index]}章`
}

function Points({ points, baseLevel }: { points: Point[]; baseLevel: number }) {
  if (!points.length) return null
  return (
    <ul className="mt-5 space-y-2.5 text-lg leading-relaxed">
      {points.map(({ level, text }, index) => (
        <li key={index}
          className={`relative pl-5 before:absolute before:top-[0.65em] before:left-0 before:size-2.5 ${level > baseLevel ? 'ml-6 before:bg-red' : 'before:bg-ink'}`}>
          <InlineText text={text} />
        </li>
      ))}
    </ul>
  )
}

function TextPanel({ sub }: { sub: Subsection }) {
  return (
    <article id={sub.id} data-subsection className="ink-frame scroll-mt-24 bg-paper p-6 md:p-8">
      <h3 className="font-display text-3xl tracking-wide uppercase md:text-4xl">{sub.name}</h3>
      {sub.points.length ? <Points points={sub.points} baseLevel={0} /> : (
        <div className="halftone mt-5 grid min-h-32 place-items-center border-[3px] border-dashed border-ink">
          <span className="bg-paper px-2 font-display text-2xl tracking-wide">SZÖVEG HELYE</span>
        </div>
      )}
    </article>
  )
}

function MediaRow({ sub, folder, index }: { sub: Subsection; folder: string; index: number }) {
  const cover = coverUrl(folder)
  const left = index % 2 === 0
  return (
    <article id={sub.id} data-subsection className="grid scroll-mt-24 items-start gap-8 border-b border-ink/15 py-10 md:grid-cols-2 md:gap-14">
      <div className={`relative isolate ${left ? 'md:order-1 md:-rotate-[0.8deg]' : 'md:order-2 md:rotate-[0.8deg]'}`}>
        {cover ? <>
          <div aria-hidden="true" className="halftone absolute -inset-2 -z-10" />
          <img data-cover className="ink-frame aspect-[3/4] w-full bg-ink object-cover" src={cover} alt={`${sub.name} — borító`} loading="lazy" />
        </> : (
          <div data-cover className="halftone grid aspect-[3/4] place-items-center border-[3px] border-dashed border-ink">
            <span className="bg-paper px-2 font-display text-2xl tracking-wide">BORÍTÓ HELYE</span>
          </div>
        )}
      </div>
      <div className={`min-w-0 ${left ? 'md:order-2' : 'md:order-1'}`}>
        <span aria-hidden="true" lang="ja" className="kanji text-sm font-bold text-red">第{numerals[index]}話</span>
        <h3 className="mt-1 font-display text-3xl tracking-wide uppercase md:text-4xl">{sub.name}</h3>
        {sub.subtitle && <p className="mt-2 text-lg text-ink-soft italic">{sub.subtitle}</p>}
        <Points points={sub.points} baseLevel={1} />
        {sub.hasGallery && <GallerySlot folder={folder} name={sub.name} />}
        {sub.hasVideo && <VideoSlot folder={folder} name={sub.name} />}
      </div>
    </article>
  )
}

export function SectionBlock({ section, index, mediaOffset }: { section: Section; index: number; mediaOffset: number }) {
  let mediaIndex = mediaOffset
  return (
    <section id={section.id} data-section className="scroll-mt-24 sm:scroll-mt-16">
      <header className="mb-6 grid grid-cols-[auto_1fr] items-baseline gap-3 border-y-[3px] border-ink py-5 sm:mb-10 sm:gap-6">
        <span aria-hidden="true" lang="ja" className="kanji text-2xl font-bold text-red sm:text-4xl">{chapterNumber(index)}</span>
        <h2 className="font-display text-4xl tracking-wide uppercase md:text-5xl">{section.name}</h2>
      </header>
      <div className="space-y-6">
        {section.subsections.map((sub) => sub.folder
          ? <MediaRow key={sub.id} sub={sub} folder={sub.folder} index={mediaIndex++} />
          : <TextPanel key={sub.id} sub={sub} />)}
      </div>
    </section>
  )
}
