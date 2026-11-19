import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { galleryUrls } from '@/lib/media'

const button = 'size-10 rounded-none border-[3px] border-ink bg-paper text-ink hover:bg-red hover:text-paper'
const placeholders = ['1/3', '2/3', '3/3']

export function GallerySlot({ folder, name }: { folder: string; name: string }) {
  const images = galleryUrls(folder)
  return (
    <figure data-gallery className="mt-8">
      <Carousel aria-label={`${name} — galéria`} aria-roledescription="képgaléria">
        <CarouselContent className="ml-0">
          {images.length ? images.map((url, index) => (
            <CarouselItem key={url} className="pl-0" aria-roledescription="kép">
              <img className="ink-frame aspect-[4/3] w-full bg-ink object-cover" loading="lazy" src={url} alt={`${name} — ${index + 1}. kép`} />
            </CarouselItem>
          )) : placeholders.map((label) => (
            <CarouselItem key={label} className="pl-0" aria-roledescription="kép">
              <div className="halftone relative grid aspect-[4/3] place-items-center border-[3px] border-dashed border-ink">
                <span className="absolute top-3 left-3 bg-paper px-1 font-display text-lg text-red">{label}</span>
                <span className="bg-paper px-2 font-display text-2xl tracking-wide">KÉP HELYE</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length !== 1 && <>
          <CarouselPrevious className={`${button} left-3`} />
          <CarouselNext className={`${button} right-3`} />
        </>}
      </Carousel>
      <figcaption className="mt-2 text-xs tracking-widest text-ink-soft uppercase">
        {images.length ? 'Galéria' : 'Galéria — feltöltés alatt'}
      </figcaption>
    </figure>
  )
}
