import { bibliography, mediaFolders } from '../content/media.ts'
import type { Presentation, Section, SourceEntry, Subsection } from './types.ts'

function slug(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function cleanHeading(text: string) {
  return text.replaceAll('*', '').trim()
}

function normalizeCitation(text: string) {
  return text.toLowerCase().replace(/[–—]/g, '-').replace(/[_*]/g, '')
    .replace(/\s+/g, ' ').trim().replace(/[.,:;!?]+$/, '')
}

function extractSources(folder: string, lines: string[]): SourceEntry[] {
  const entries: SourceEntry[] = (bibliography[folder] ?? []).map((source) => ({ ...source, paragraphs: [] }))
  const metadata = entries.map(({ title, author, cite }) => ({
    title: normalizeCitation(title), author: author && normalizeCitation(author), cite: cite && normalizeCitation(cite),
  }))
  let group = 0
  let page: string | undefined
  let paragraph: string[] = []

  function flush() {
    if (!paragraph.length) return
    entries[group]?.paragraphs.push({ page, text: paragraph.join(' ') })
    paragraph = []
  }

  // Page and citation lines often abut the quoted prose without blank lines.
  for (const line of lines) {
    const text = line.replace(/<\/?u>/gi, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim()
    if (!text) {
      flush()
      continue
    }
    if (/^\d+(?:-\d+)?$/.test(text)) {
      flush()
      page = text.replace('-', '–')
      continue
    }
    const normalized = normalizeCitation(text)
    const titleGroup = normalized.length >= 8
      ? metadata.findIndex(({ title }) => title.includes(normalized))
      : -1
    if (titleGroup !== -1 || /https?:\/\//i.test(text) || metadata.some(({ author, cite }) =>
      (author && normalized.includes(author)) || (normalized.length >= 8 && cite?.includes(normalized)),
    )) {
      flush()
      if (titleGroup > 0 && titleGroup !== group) {
        group = titleGroup
        page = undefined
      }
      continue
    }
    paragraph.push(text)
  }
  flush()
  return entries
}

export function parsePresentation(markdown: string): Presentation {
  const presentation: Presentation = { title: '', sections: [] }
  let section: Section | undefined
  let subsection: Subsection | undefined
  let hasHeadings = false
  let source: string[] | undefined

  function closeSource() {
    if (source && subsection?.folder) subsection.sources.push(...extractSources(subsection.folder, source))
    source = undefined
  }

  function openSubsection(heading: string, isMedia: boolean) {
    const label = cleanHeading(heading)
    const split = isMedia ? label.indexOf(' - ') : -1
    const name = split === -1 ? label : label.slice(0, split)
    const id = slug(name)
    subsection = {
      id, name, subtitle: split === -1 ? undefined : label.slice(split + 3).trim(),
      folder: isMedia ? mediaFolders[id] : undefined,
      points: [], hasGallery: false, hasVideo: false, sources: [],
    }
    section?.subsections.push(subsection)
  }

  for (const raw of markdown.split(/\r?\n/)) {
    const indent = raw.match(/^[\t ]*/)?.[0] ?? ''
    const line = indent.replace(/ {4}/g, '\t') + raw.slice(indent.length)
    const text = line.trim()
    if (text.startsWith('Forrás:')) {
      closeSource()
      source = []
      continue
    }
    if (source) {
      if (!text || line.startsWith('\t')) {
        source.push(text)
        continue
      }
      closeSource()
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line)
    if (heading) {
      const [, marks, label] = heading
      if (marks === '#') presentation.title = cleanHeading(label)
      if (marks === '##') {
        const name = cleanHeading(label)
        section = { id: slug(name), name, subsections: [] }
        presentation.sections.push(section)
        subsection = undefined
        hasHeadings = false
      }
      if (marks === '###' && section) {
        hasHeadings = true
        openSubsection(label, false)
      }
      continue
    }

    const bullet = /^(\t*)\*\s+(.+)$/.exec(line)
    if (!bullet || !section) continue
    const [, tabs, body] = bullet
    const level = tabs.length
    if (level === 0 && !hasHeadings) {
      openSubsection(body, true)
    } else if (subsection) {
      const point = body.trim()
      const marker = cleanHeading(point)
      if (marker === '[Képek beszúrva, galéria]') subsection.hasGallery = true
      else if (marker === '[Kivágott jelenet videó beágyazva]') subsection.hasVideo = true
      else subsection.points.push({ level, text: point })
    }
  }
  closeSource()
  return presentation
}
