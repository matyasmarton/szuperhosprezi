import { Fragment } from 'react'

export function InlineText({ text }: { text: string }) {
  return text.split(/(\*\*.+?\*\*|_.+?_)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}><InlineText text={part.slice(2, -2)} /></strong>
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <em key={index}><InlineText text={part.slice(1, -1)} /></em>
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}
