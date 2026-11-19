import { heroImages } from '@/lib/media'

// Each image is cropped to its own wedge's bounding box, not the entire spread.
const panels = [
  { points: '0,0 500,0 655,320 430,320 0,205', bounds: [0, 0, 655, 320] },
  { points: '500,0 1010,0 880,320 655,320', bounds: [500, 0, 510, 320] },
  { points: '1010,0 1600,0 1600,290 1170,320 880,320', bounds: [880, 0, 720, 320] },
  { points: '1600,290 1600,650 1170,570 1170,320', bounds: [1170, 290, 430, 360] },
  { points: '1600,650 1600,900 1030,900 900,570 1170,570', bounds: [900, 570, 700, 330] },
  { points: '1030,900 560,900 650,570 900,570', bounds: [560, 570, 470, 330] },
  { points: '560,900 0,900 0,640 430,570 650,570', bounds: [0, 570, 650, 330] },
  { points: '0,640 0,205 430,320 430,570', bounds: [0, 205, 430, 435] },
]
const images = heroImages()

export function Hero({ title }: { title: string }) {
  return (
    <div className="relative h-svh min-h-[560px] overflow-hidden bg-paper" id="eleje">
      <svg aria-hidden="true" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="hero-dots" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="var(--color-ink)" opacity=".18" />
          </pattern>
          {panels.map(({ points }, index) => (
            <clipPath id={`panel-${index + 1}`} key={points}><polygon points={points} /></clipPath>
          ))}
        </defs>
        {panels.map(({ points, bounds: [x, y, width, height] }, index) => (
          <g key={points} clipPath={`url(#panel-${index + 1})`} data-hero-panel>
            {images[index] ? (
              <image href={images[index]} x={x} y={y} width={width} height={height} preserveAspectRatio="xMidYMid slice" />
            ) : (
              <>
                <rect x={x} y={y} width={width} height={height} fill="url(#hero-dots)" />
                <text x={x + width / 2} y={y + height / 2} textAnchor="middle" className="fill-ink font-display text-3xl">KÉP HELYE</text>
              </>
            )}
          </g>
        ))}
        {panels.map(({ points }) => (
          <polygon key={points} points={points} fill="none" stroke="var(--color-ink)" strokeWidth="4" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="halftone pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute inset-0 border-4 border-ink" />
      <div className="hard-shadow absolute top-1/2 left-1/2 flex min-h-[max(168px,30svh)] w-[max(46%,min(calc(100%-2.5rem),max(470px,85svh)))] max-w-[820px] -translate-1/2 -rotate-[1.2deg] flex-col justify-center border-4 border-ink bg-paper px-6 py-7 text-center sm:px-8">
        <div aria-hidden="true" className="mb-4 flex items-center gap-4">
          <span className="h-[2px] flex-1 bg-ink" />
          <span lang="ja" className="kanji text-sm tracking-[0.3em] text-red">第一号</span>
          <span className="h-[2px] flex-1 bg-ink" />
        </div>
        <h1 className="font-display text-[clamp(1.6rem,3.2vw,3.2rem)] leading-[0.95] tracking-wide text-balance uppercase">{title}</h1>
        <div aria-hidden="true" className="mx-auto mt-5 h-[3px] w-16 bg-red" />
      </div>
    </div>
  )
}
