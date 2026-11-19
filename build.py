"""Regenerate the portable lecture. Python 3.9+, no third-party packages."""

import argparse
from dataclasses import dataclass, field
from html import escape
from pathlib import Path
import re
import shutil
from string import Template
import unicodedata
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
FOLDERS = {
    'zebraman': 'zebraman', 'ultraman': 'ultraman', 'batman-ninja': 'Batman_ninja',
    'afro-samurai': 'afro_samurai', 'cyberpunk-edgerunners': 'edgerunners', 'pluto': 'pluto',
    'monster': 'monster', 'dorohedoro': 'dorohedoro', 'neon-genesis-evangelion': 'evangelion',
}
PHOTO_FOLDERS = {'ultraman': 'Ultraman', 'pluto': 'Pluto'}
GALLERY_FILENAME = re.compile(r'(\d+)\s*-\s*(.+)')
BIBLIOGRAPHY = {
    'ultraman': [dict(title='Transformational Magic: Some Japanese super-heroes and monsters', author='Tom Gill')],
    'afro_samurai': [dict(title='Afro-Samurai: techno-Orientalism and contemporary hip-hop', author='Ken McLeod',
                         url='https://www.jstor.org/stable/24736760', cite='Vol. 32, No. 2 (May 2013), pp. 259–275 (17 pages)')],
    'pluto': [dict(title='Pluto and Doubling', author='Craig Fischer', url='https://www.tcj.com/pluto-and-doubling/')],
    'monster': [dict(title='Urasawa’s Monster and the Aesthetics of Uncertainty', author='Simon Lindblom',
                     url='https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1216&context=dialogue')],
    'dorohedoro': [dict(title='Maturing Manga: An Analysis of Adult Themes in Shonen Manga', author='Audrey Leahy',
                        url='https://digitalcommons.georgiasouthern.edu/cgi/viewcontent.cgi?article=1918&context=honors-theses'),
                   dict(title='Cuteness as Counterculture in Anthropomorphic Japanese Animation', author='Alice Teodorescu',
                        url='https://www.ekphrasisjournal.ro/docs/R1/25E5.pdf')],
    'evangelion': [dict(title='When the Machines Stop: Fantasy, Reality, and Terminal Identity in ”Neon Genesis Evangelion“ and ”Serial Experiments Lain“',
                        url='https://www.jstor.org/stable/4241108')],
}
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.avif'}
VIDEO_EXTENSIONS = {'.mp4', '.webm', '.mov'}
HERO_ORDER = ('Batman_ninja', 'afro_samurai', 'edgerunners', 'monster', 'dorohedoro', 'evangelion')
HERO_EXTRA_ORDER = ('dorohedoro', 'evangelion')
HERO_WEDGES = (
    ('0,0 500,0 655,320 430,320 0,205', 0, 0, 655, 320),
    ('500,0 1010,0 880,320 655,320', 500, 0, 510, 320),
    ('1010,0 1600,0 1600,290 1170,320 880,320', 880, 0, 720, 320),
    ('1600,290 1600,650 1170,570 1170,320', 1170, 290, 430, 360),
    ('1600,650 1600,900 1030,900 900,570 1170,570', 900, 570, 700, 330),
    ('1030,900 560,900 650,570 900,570', 560, 570, 470, 330),
    ('560,900 0,900 0,640 430,570 650,570', 0, 570, 780, 330),
    ('0,640 0,205 430,320 430,570', 0, 205, 430, 435),
)


def slug(text):
    folded = unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', folded).strip('-')


def heading(text):
    return text.replace('*', '').strip()


def inlines(text):
    parts = re.split(r'(\*\*.+?\*\*|_.+?_)', text)
    return ''.join(
        (f'<strong>{inlines(part[2:-2])}</strong>' if part.startswith('**') else f'<em>{inlines(part[1:-1])}</em>')
        if index % 2 else escape(part)
        for index, part in enumerate(parts)
    )


def citation_key(text):
    return ' '.join(text.lower().translate(str.maketrans('–—', '--', '_*')).split()).rstrip('.,:;!?')


def parse_sources(folder, lines):
    citations = BIBLIOGRAPHY.get(folder, [])
    groups = [[] for _ in citations]
    if not groups:
        return []
    keys = [{key: citation_key(value) for key, value in citation.items()} for citation in citations]
    paragraph = []
    group, page = 0, ''

    def flush():
        if paragraph:
            groups[group].append((page, ' '.join(paragraph)))
            paragraph.clear()

    for line in lines:
        text = re.sub(r'</?u>', '', line, flags=re.I)
        text = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', text).strip()
        if not text:
            flush()
        elif re.fullmatch(r'\d+(?:-\d+)?', text):
            flush()
            page = text.replace('-', '–')
        else:
            normalized = citation_key(text)
            title_group = next((i for i, key in enumerate(keys) if len(normalized) >= 8 and normalized in key['title']), -1)
            if title_group != -1 or re.search(r'https?://', text, re.I) or any(
                ('author' in key and key['author'] in normalized) or (len(normalized) >= 8 and normalized in key.get('cite', ''))
                for key in keys
            ):
                flush()
                if title_group > 0 and title_group != group:
                    group, page = title_group, ''
            else:
                paragraph.append(text)
    flush()
    return list(zip(citations, groups))


@dataclass
class Work:
    name: str
    subtitle: str = ''
    folder: str = ''
    points: list = field(default_factory=list)
    gallery: bool = False
    video: bool = False
    sources: list = field(default_factory=list)


@dataclass
class Chapter:
    title: str
    works: list = field(default_factory=list)


def parse_lecture(markdown):
    title = ''
    chapters = []
    work = None
    uses_headings = False
    source_lines = None

    def close_source():
        nonlocal source_lines
        if source_lines is not None and work is not None:
            work.sources.extend(parse_sources(work.folder, source_lines))
        source_lines = None

    for raw in markdown.splitlines():
        indent = raw[:len(raw) - len(raw.lstrip(' \t'))]
        line = indent.replace('    ', '\t') + raw[len(indent):]
        text = line.strip()
        if text.startswith('Forrás:'):
            close_source()
            source_lines = []
            continue
        if source_lines is not None:
            if not text or line.startswith('\t'):
                source_lines.append(text)
                continue
            close_source()
        match = re.fullmatch(r'(#{1,3})\s+(.+)', line)
        if match:
            marks, label = match.groups()
            if marks == '#':
                title = heading(label)
            elif marks == '##':
                chapters.append(Chapter(heading(label)))
                work, uses_headings = None, False
            elif chapters:
                uses_headings = True
                work = Work(heading(label))
                chapters[-1].works.append(work)
            continue
        bullet = re.fullmatch(r'(\t*)\*\s+(.+)', line)
        if not chapters or bullet is None:
            continue
        tabs, point = bullet.groups()
        if not tabs and not uses_headings:
            name, _, subtitle = heading(point).partition(' - ')
            work = Work(name, subtitle.strip(), FOLDERS.get(slug(name), ''))
            chapters[-1].works.append(work)
        elif work is not None:
            marker = heading(point)
            if marker == '[Képek beszúrva, galéria]':
                work.gallery = True
            elif marker == '[Kivágott jelenet videó beágyazva]':
                work.video = True
            else:
                work.points.append((len(tabs), point.strip()))
    close_source()
    return title, chapters


def assets(directory, folder, extensions):
    return sorted(path for path in (ROOT / directory / folder).rglob('*') if path.is_file() and path.suffix.lower() in extensions)


def cover(images):
    return next((path for path in images if 'cover' in path.stem.lower() and not GALLERY_FILENAME.fullmatch(path.stem)), None)


def hero_html(image_url):
    candidates = {}
    for folder in HERO_ORDER:
        images = assets('photo', folder, IMAGE_EXTENSIONS)
        titles = [path for path in images if 'title' in path.stem.lower() and not GALLERY_FILENAME.fullmatch(path.stem)]
        candidates[folder] = titles or [cover(images)]
    ordered = [paths[0] for paths in candidates.values()]
    ordered += [path for folder in HERO_EXTRA_ORDER for path in candidates.get(folder, [])[1:]]
    clips, panels, seams = [], [], []
    for index, (points, x, y, width, height) in enumerate(HERO_WEDGES):
        clip = f'panel-{index + 1}'
        polygon = f'<polygon points="{points}"'
        clips.append(f'<clipPath id="{clip}">{polygon}/></clipPath>')
        box = f'x="{x}" y="{y}" width="{width}" height="{height}"'
        path = ordered[index] if index < len(ordered) else None
        if path:
            content = f'<image href="{image_url(path)}" {box} preserveAspectRatio="xMidYMid slice"/>'
        else:
            content = (f'<rect {box} fill="url(#hero-dots)"/>'
                       f'<text x="{x + width / 2}" y="{y + height / 2}" text-anchor="middle">KÉP HELYE</text>')
        panels.append(f'<g clip-path="url(#{clip})" data-hero-panel>{content}</g>')
        seams.append(f'{polygon} fill="none" stroke="var(--ink)" stroke-width="4" vector-effect="non-scaling-stroke"/>')
    return ('<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">\n'
            '<defs><pattern id="hero-dots" width="6" height="6" patternUnits="userSpaceOnUse">'
            '<circle cx="2" cy="2" r="1" fill="var(--ink)" opacity=".18"/></pattern>\n'
            + '\n'.join(clips) + '</defs>\n' + '\n'.join(panels + seams) + '\n</svg>')


def placeholder(label):
    return f'<div class="placeholder"><span class="placeholder-label">{label}</span></div>'


def gallery_html(images, work_id, name, image_url):
    numbered = []
    for path in images:
        match = GALLERY_FILENAME.fullmatch(path.stem)
        if match:
            caption = unicodedata.normalize('NFC', match[2].strip())
            numbered.append((int(match[1]), path, escape(caption)))
    if not numbered:
        return ('<div data-gallery>' + placeholder('KÉP HELYE')
                + '<p class="gallery-label">Galéria — feltöltés alatt</p></div>')

    numbered.sort()
    gallery_id = f'{work_id}-galeria'
    preview = image_url(numbered[0][1])
    slides = '\n'.join(
        f'<img class="gallery-slide" src="{image_url(path)}" loading="lazy" alt="{caption}" hidden>'
        for _, path, caption in numbered
    )
    if len(numbered) > 1:
        pager = ('<div class="gallery-pager" role="group" aria-label="Lapozás a képek között">'
                 '<button type="button" class="ink-button gallery-prev" aria-label="Előző kép">‹</button>'
                 '<div class="gallery-caption" aria-live="polite"><p></p><span class="gallery-count" aria-hidden="true"></span></div>'
                 '<button type="button" class="ink-button gallery-next" aria-label="Következő kép">›</button></div>')
    else:
        pager = '<div class="gallery-pager"><div class="gallery-caption"><p></p></div></div>'
    return (f'<div data-gallery><button type="button" class="gallery-trigger" aria-haspopup="dialog" aria-controls="{gallery_id}">'
            f'<img src="{preview}" loading="lazy" alt=""><span>Galéria megnyitása · {len(numbered)} kép</span></button>'
            f'<dialog class="gallery-dialog" id="{gallery_id}" aria-labelledby="{gallery_id}-title">'
            f'<header class="dialog-header"><h2 id="{gallery_id}-title">{name} — Galéria</h2>'
            '<form method="dialog"><button class="ink-button close-button" aria-label="Bezárás" autofocus></button></form></header>'
            f'<div class="gallery-images">{slides}</div>{pager}</dialog></div>')


def work_html(work, media_index, asset_url):
    work_id, name = slug(work.name), escape(work.name)
    base_level = 1 if work.folder else 0
    points = []
    for level, text in work.points:
        li = '<li class="nested">' if level > base_level else '<li>'
        points.append(li + inlines(text) + '</li>')
    point_list = '<ul class="points">' + ''.join(points) + '</ul>' if points else ''
    title = f'<h3>{name}</h3>'
    if not work.folder:
        return (f'<article data-subsection class="text-panel" id="{work_id}">{title}'
                f'{point_list or placeholder("SZÖVEG HELYE")}</article>')
    images = assets('photo', PHOTO_FOLDERS.get(work.folder, work.folder), IMAGE_EXTENSIONS)
    cover_image = cover(images)
    cover_markup = (f'<img src="{asset_url(cover_image)}" loading="lazy" alt="{name} — borító">'
                    if cover_image else placeholder('BORÍTÓ HELYE'))
    cover_markup = f'<div class="cover-art">{cover_markup}</div>'
    cover_switch = cover_video = ''
    subtitle = f'<p class="subtitle">{inlines(work.subtitle)}</p>' if work.subtitle else ''
    gallery = gallery_html(images, work_id, name, asset_url) if work.gallery else ''
    video = ''
    if work.video:
        clip = next((path for path in assets('video', work.folder, VIDEO_EXTENSIONS) if 'original' not in path.stem.lower()), None)
        if clip:
            video = (f'<video aria-label="{name} — jelenet" controls playsinline preload="metadata" data-random-preview '
                     f'src="{asset_url(clip)}"></video>')
        else:
            video = '<div class="placeholder"><span class="play-label">VIDEÓ HELYE</span></div>'
        if clip and work.folder == 'dorohedoro':
            frame_id = f'{work_id}-media'
            cover_switch = (
                f'<button type="button" class="cover-switch" role="switch" aria-checked="false" aria-controls="{frame_id}">'
                '<span class="switch-track" aria-hidden="true"></span><span>Videó mutatása</span></button>'
            )
            cover_video = f'<div data-video id="{frame_id}" hidden>{video}</div>'
            video = ''
        else:
            video = f'<div data-video>{video}</div>'
    align = ' reverse' if media_index % 2 else ''
    return (f'<article data-subsection class="media-row{align}" id="{work_id}">'
            f'<div class="cover" data-cover>{cover_switch}{cover_markup}{cover_video}</div>'
            '<div class="media-notes">'
            f'{title}{subtitle}{point_list}{gallery}{video}</div></article>')


def source_entry_html(citation, paragraphs):
    lines = [f'<article class="source-entry"><h4>{escape(citation["title"])}</h4>']
    for key in ('author', 'cite'):
        if key in citation:
            lines.append(f'<p class="source-{key}">{escape(citation[key])}</p>')
    if 'url' in citation:
        url = escape(citation['url'])
        lines.append(f'<a href="{url}" target="_blank" rel="noreferrer">{url}</a>')
    for page, text in paragraphs:
        badge = f'<span class="page" lang="hu">o. {escape(page)}</span>' if page else ''
        lines.append(f'<p class="quotation" lang="en">{badge}{inlines(text)}</p>')
    return '\n'.join(lines) + '</article>'


def render(title, chapters):
    used_assets = set()

    def asset_url(path):
        relative = path.relative_to(ROOT)
        used_assets.add(relative)
        # Git checks out NFC filenames on Linux; macOS accepts both forms.
        return quote(unicodedata.normalize('NFC', relative.as_posix()))

    navigation, sections, sources = [], [], []
    background = ''
    media_index = 0
    for chapter in chapters:
        chapter_id = slug(chapter.title)
        chapter_title = escape(chapter.title)
        if chapter_id == 'hatter-es-elozmeny':
            background = '\n'.join(work_html(work, 0, asset_url) for work in chapter.works)
            continue
        navigation.append(f'<a href="#{chapter_id}">{chapter_title}</a>')
        rows = []
        for work in chapter.works:
            rows.append(work_html(work, media_index, asset_url))
            if work.folder:
                media_index += 1
            if work.sources:
                entries = '\n'.join(source_entry_html(*source) for source in work.sources)
                sources.append(f'<div data-source-for="{slug(work.name)}" hidden>\n{entries}\n</div>')
        sections.append(f'<section id="{chapter_id}" data-section><header class="chapter-header">'
                        f'<h2>{chapter_title}</h2></header>\n' + '\n'.join(rows) + '</section>')
    template = Template((ROOT / 'site/index.template.html').read_text(encoding='utf-8'))
    page = template.substitute(title=escape(title), hero=hero_html(asset_url), navigation='\n'.join(navigation),
                               chapters='\n'.join(sections), sources='\n'.join(sources), background=background)
    return page, used_assets


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--publish', action='store_true', help='also assemble the Netlify publish directory (dist/)')
    args = parser.parse_args()
    title, chapters = parse_lecture((ROOT / 'prezi.md').read_text(encoding='utf-8'))
    if not title or not chapters:
        parser.error('prezi.md must contain a title and at least one chapter')
    page, used_assets = render(title, chapters)
    index = ROOT / 'index.html'
    index.write_text(page, encoding='utf-8')
    if args.publish:
        target = ROOT / 'dist'
        files = {Path('index.html'), Path('site/presentation.css'), Path('site/presentation.js'), *used_assets}
        files.update(path.relative_to(ROOT) for path in (ROOT / 'site/fonts').iterdir() if path.is_file() and not path.name.startswith('.'))
        try:
            if target.exists():
                shutil.rmtree(target)
            for relative in sorted(files):
                dest = target / unicodedata.normalize('NFC', relative.as_posix())
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(ROOT / relative, dest)
        except OSError as error:
            parser.exit(1, f'Could not assemble dist/: {error}\n')


if __name__ == '__main__':
    main()
