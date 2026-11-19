const chapters = [...document.querySelectorAll('[data-section]')]
const links = [...document.querySelectorAll('.masthead nav a')]
const progress = document.querySelector('.progress')
const sources = document.querySelector('#sources')
const sourceTitle = sources.querySelector('h2')
const sourceBody = sources.querySelector('.source-body')
const sourceGroups = [...sourceBody.querySelectorAll('[data-source-section]')]
let activeIndex = -1
let frame = 0

function updateScrollState() {
  frame = 0
  const scrollable = document.documentElement.scrollHeight - innerHeight
  progress.style.transform = `scaleX(${scrollable > 0 ? Math.max(0, Math.min(1, scrollY / scrollable)) : 0})`
  let next = chapters.findIndex((chapter) => {
    const { top, bottom } = chapter.getBoundingClientRect()
    return top <= innerHeight / 2 && bottom > innerHeight / 2
  })
  if (next < 0) {
    next = chapters.findIndex((chapter) => {
      const { top, bottom } = chapter.getBoundingClientRect()
      return top < innerHeight * 0.55 && bottom > innerHeight * 0.45
    })
  }
  if (next === activeIndex) return
  links[activeIndex]?.removeAttribute('aria-current')
  links[next]?.setAttribute('aria-current', 'location')
  activeIndex = next
}

function scheduleScrollUpdate() {
  if (!frame) frame = requestAnimationFrame(updateScrollState)
}

addEventListener('scroll', scheduleScrollUpdate, { passive: true })
addEventListener('resize', scheduleScrollUpdate)
addEventListener('pageshow', scheduleScrollUpdate)
updateScrollState()

document.querySelector('.source-tab').addEventListener('click', () => {
  const current = activeIndex >= 0
  sourceTitle.textContent = current ? links[activeIndex].textContent.trim() : 'Források'
  sourceGroups.forEach((group, index) => {
    group.hidden = current && index !== activeIndex
    group.firstElementChild.hidden = current
  })
  sources.showModal()
  sourceBody.scrollTop = 0
})

sources.addEventListener('click', (event) => {
  if (event.target === sources) sources.close()
})

for (const video of document.querySelectorAll('video[data-random-preview]')) {
  const showPreview = () => {
    if (!video.paused || video.currentTime !== 0 || !Number.isFinite(video.duration)) return
    // Sample the clip itself; leave the opening and closing seconds out of the preview.
    const previewTime = video.duration * (0.1 + Math.random() * 0.8)
    video.currentTime = previewTime
    video.addEventListener('play', () => {
      // Play from the beginning unless the viewer has already scrubbed elsewhere.
      if (Math.abs(video.currentTime - previewTime) < 0.25) video.currentTime = 0
    }, { once: true })
  }
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) showPreview()
  else video.addEventListener('loadedmetadata', showPreview, { once: true })
}

for (const gallery of document.querySelectorAll('[data-gallery]')) {
  const track = gallery.querySelector('.gallery-track')
  const previous = gallery.querySelector('.gallery-prev')
  const next = gallery.querySelector('.gallery-next')
  if (!previous || !next) continue
  const slides = track.children
  let selected = 0

  function goTo(index) {
    selected = Math.max(0, Math.min(slides.length - 1, index))
    track.scrollTo({
      left: slides[selected].offsetLeft,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  function updateGallery() {
    if (!track.clientWidth) return
    selected = Math.round(track.scrollLeft / track.clientWidth)
    previous.disabled = selected === 0
    next.disabled = selected >= slides.length - 1
  }

  track.addEventListener('scroll', updateGallery, { passive: true })
  previous.addEventListener('click', () => goTo(selected - 1))
  next.addEventListener('click', () => goTo(selected + 1))
  gallery.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    goTo(selected + (event.key === 'ArrowLeft' ? -1 : 1))
  })
  updateGallery()
}
