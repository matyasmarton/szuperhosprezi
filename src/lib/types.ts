export type Point = { level: number; text: string }
export type SourceParagraph = { page?: string; text: string }
export type SourceEntry = {
  title: string
  author?: string
  url?: string
  cite?: string
  paragraphs: SourceParagraph[]
}
export type Subsection = {
  id: string
  name: string
  subtitle?: string
  points: Point[]
  hasGallery: boolean
  hasVideo: boolean
  folder?: string
  sources: SourceEntry[]
}
export type Section = { id: string; name: string; subsections: Subsection[] }
export type Presentation = { title: string; sections: Section[] }
