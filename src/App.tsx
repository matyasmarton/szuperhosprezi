import { Hero } from '@/components/Hero'
import { Masthead } from '@/components/Masthead'
import { SectionBlock } from '@/components/SectionBlock'
import { SourceSheet } from '@/components/SourceSheet'
import { useActiveSection } from '@/lib/useActiveSection'
import presentation from '../prezi.md?presentation'

function App() {
  const activeSectionId = useActiveSection()
  let mediaOffset = 0
  return (
    <>
      <Hero title={presentation.title} />
      <Masthead sections={presentation.sections} activeSectionId={activeSectionId} />
      <main className="mx-auto max-w-[1200px] space-y-18 px-6 pt-10 pb-20 sm:px-8 md:space-y-24 md:pt-14">
        {presentation.sections.map((section, index) => {
          const offset = mediaOffset
          mediaOffset += section.subsections.filter(({ folder }) => folder).length
          return <SectionBlock key={section.id} section={section} index={index} mediaOffset={offset} />
        })}
      </main>
      <SourceSheet presentation={presentation} activeSectionId={activeSectionId} />
    </>
  )
}

export default App
