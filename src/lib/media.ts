import { heroOrder } from '@/content/media'

const images = import.meta.glob<string>('/photo/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true, query: '?url', import: 'default',
})
const videos = import.meta.glob<string>([
  '/video/**/*.{mp4,webm,mov}',
  '!/video/**/*[oO][rR][iI][gG][iI][nN][aA][lL]*',
], { eager: true, query: '?url', import: 'default' })

function folderUrls(assets: Record<string, string>, root: string, folder: string, names: RegExp) {
  const prefix = `/${root}/${folder}/`
  return Object.keys(assets).sort().filter((path) =>
    path.startsWith(prefix) && names.test(path.slice(path.lastIndexOf('/') + 1)),
  ).map((path) => assets[path])
}

export function coverUrl(folder: string): string | undefined {
  return folderUrls(images, 'photo', folder, /cover/i)[0]
}

export function titleUrls(folder: string) {
  return folderUrls(images, 'photo', folder, /title/i)
}

export function galleryUrls(folder: string) {
  return folderUrls(images, 'photo', folder, /^(?!.*(?:cover|title))/i)
}

export function videoUrl(folder: string): string | undefined {
  return folderUrls(videos, 'video', folder, /^(?!.*original)/i)[0]
}

export function heroImages() {
  const candidates = heroOrder.map((folder) => {
    const titles = titleUrls(folder)
    const cover = coverUrl(folder)
    return titles.length ? titles : cover ? [cover] : []
  })
  return [...candidates.flatMap((urls) => urls.slice(0, 1)),
    ...candidates.flatMap((urls) => urls.slice(1))].slice(0, 8)
}
