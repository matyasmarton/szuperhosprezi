const chapters = [...document.querySelectorAll('[data-section]')]
const links = [...document.querySelectorAll('.masthead nav a')]
const progress = document.querySelector('.progress')
const sources = document.querySelector('#sources')
const sourceBody = sources.querySelector('.source-body')
const works = [...document.querySelectorAll('main [data-subsection]')]
const sourceWork = sources.querySelector('#source-work')
const sourcePager = sources.querySelector('.source-pager')
const sourceCount = sources.querySelector('.source-count')
const sourceSlides = [...sourceBody.querySelectorAll('[data-source-for]')]
const noSources = sourceBody.querySelector('.no-sources')
const workTitles = new Map(works.map((work) => [work.id, work.querySelector('h3').textContent]))
let sourceIndex = -1
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

function showSource(index, work) {
  if (sourceSlides[sourceIndex]) sourceSlides[sourceIndex].hidden = true
  sourceIndex = index
  const slide = sourceSlides[index]
  if (slide) slide.hidden = false
  sourceWork.textContent = workTitles.get(slide?.dataset.sourceFor ?? work?.id) ?? 'Források'
  sourceCount.textContent = `${slide ? index + 1 : '–'} / ${sourceSlides.length}`
  sourcePager.hidden = sourceSlides.length <= (slide ? 1 : 0)
  noSources.hidden = Boolean(slide)
  sourceBody.scrollTop = 0
}

function cycleSource(direction) {
  if (sourcePager.hidden) return
  const start = sourceIndex === -1 && direction < 0 ? 0 : sourceIndex
  showSource((start + direction + sourceSlides.length) % sourceSlides.length)
}

document.querySelector('[aria-controls="sources"]').addEventListener('click', () => {
  const midpoint = innerHeight / 2
  const work = works.find((row) => {
    const { top, bottom } = row.getBoundingClientRect()
    return top <= midpoint && bottom > midpoint
  }) ?? works.find((row) => {
    const { top, bottom } = row.getBoundingClientRect()
    return row.closest('[data-section]') === chapters[activeIndex] && top < innerHeight && bottom > 0
  })
  const index = work ? sourceSlides.findIndex((slide) => slide.dataset.sourceFor === work.id) : 0
  sources.showModal()
  showSource(index, work)
})

sources.querySelector('.source-prev').addEventListener('click', () => cycleSource(-1))
sources.querySelector('.source-next').addEventListener('click', () => cycleSource(1))
sources.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  cycleSource(event.key === 'ArrowLeft' ? -1 : 1)
})

const background = document.querySelector('#background')
document.querySelector('[aria-controls="background"]').addEventListener('click', () => background.showModal())

for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close()
  })
}

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

for (const toggle of document.querySelectorAll('.cover-switch')) {
  const art = toggle.parentElement.querySelector('.cover-art')
  const frame = document.getElementById(toggle.getAttribute('aria-controls'))
  const video = frame.querySelector('video')

  toggle.addEventListener('click', () => {
    const showVideo = frame.hidden
    toggle.setAttribute('aria-checked', String(showVideo))
    toggle.dataset.toggled = ''
    if (!showVideo) video.pause()
    art.hidden = showVideo
    frame.hidden = !showVideo
  })
}

for (const cycle of document.querySelectorAll('[data-cover-cycle]')) {
  const slides = [...cycle.querySelectorAll('.cover-cycle-slide')]
  const count = cycle.querySelector('.cover-cycle-count')
  let selected = 0

  function showImage(index) {
    slides[selected].hidden = true
    selected = (index + slides.length) % slides.length
    slides[selected].hidden = false
    if (count) count.textContent = `${selected + 1} / ${slides.length}`
  }

  cycle.querySelector('.cover-cycle-prev').addEventListener('click', () => showImage(selected - 1))
  cycle.querySelector('.cover-cycle-next').addEventListener('click', () => showImage(selected + 1))
  showImage(0)
}

for (const dialog of document.querySelectorAll('.gallery-dialog')) {
  const trigger = document.querySelector(`[aria-controls="${dialog.id}"]`)
  const slides = [...dialog.querySelectorAll('.gallery-slide')]
  const caption = dialog.querySelector('.gallery-caption p')
  const count = dialog.querySelector('.gallery-count')
  let selected = 0

  function showImage(index) {
    slides[selected].hidden = true
    selected = (index + slides.length) % slides.length
    slides[selected].hidden = false
    caption.textContent = slides[selected].alt
    if (count) count.textContent = `${selected + 1} / ${slides.length}`
  }

  trigger.addEventListener('click', () => {
    showImage(0)
    dialog.showModal()
  })
  dialog.querySelector('.gallery-prev')?.addEventListener('click', () => showImage(selected - 1))
  dialog.querySelector('.gallery-next')?.addEventListener('click', () => showImage(selected + 1))
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    showImage(selected + (event.key === 'ArrowLeft' ? -1 : 1))
  })
}
