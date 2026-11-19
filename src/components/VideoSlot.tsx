import { coverUrl, videoUrl } from '@/lib/media'

export function VideoSlot({ folder, name }: { folder: string; name: string }) {
  const url = videoUrl(folder)
  return (
    <div data-video className="mt-8">
      {url ? (
        <video aria-label={`${name} — jelenet`} src={url} controls playsInline preload="metadata" poster={coverUrl(folder)} className="ink-frame aspect-video w-full bg-ink" />
      ) : (
        <div className="halftone grid aspect-video place-items-center border-[3px] border-dashed border-ink">
          <div className="flex flex-col items-center gap-3 bg-paper p-2">
            <span aria-hidden="true" className="size-0 border-y-[18px] border-l-[28px] border-y-transparent border-l-ink" />
            <span className="font-display text-xl tracking-wide">VIDEÓ HELYE</span>
          </div>
        </div>
      )}
    </div>
  )
}
