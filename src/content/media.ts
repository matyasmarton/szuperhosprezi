import type { SourceEntry } from '../lib/types.ts'

export const mediaFolders: Readonly<Record<string, string | undefined>> = {
  zebraman: 'zebraman',
  ultraman: 'ultraman',
  'batman-ninja': 'Batman_ninja',
  'afro-samurai': 'afro_samurai',
  'cyberpunk-edgerunners': 'edgerunners',
  pluto: 'pluto',
  monster: 'monster',
  dorohedoro: 'dorohedoro',
  'neon-genesis-evangelion': 'evangelion',
}

type Bibliography = Readonly<Record<string, readonly Omit<SourceEntry, 'paragraphs'>[] | undefined>>

export const bibliography: Bibliography = {
  ultraman: [{
    title: 'Transformational Magic: Some Japanese super-heroes and monsters',
    author: 'Tom Gill',
  }],
  afro_samurai: [{
    title: 'Afro-Samurai: techno-Orientalism and contemporary hip-hop',
    author: 'Ken McLeod',
    url: 'https://www.jstor.org/stable/24736760',
    cite: 'Vol. 32, No. 2 (May 2013), pp. 259–275 (17 pages)',
  }],
  pluto: [{
    title: 'Pluto and Doubling',
    author: 'Craig Fischer',
    url: 'https://www.tcj.com/pluto-and-doubling/',
  }],
  monster: [{
    title: 'Urasawa’s Monster and the Aesthetics of Uncertainty',
    author: 'Simon Lindblom',
    url: 'https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1216&context=dialogue',
  }],
  dorohedoro: [{
    title: 'Maturing Manga: An Analysis of Adult Themes in Shonen Manga',
    author: 'Audrey Leahy',
    url: 'https://digitalcommons.georgiasouthern.edu/cgi/viewcontent.cgi?article=1918&context=honors-theses',
  }, {
    title: 'Cuteness as Counterculture in Anthropomorphic Japanese Animation',
    author: 'Alice Teodorescu',
    url: 'https://www.ekphrasisjournal.ro/docs/R1/25E5.pdf',
  }],
  evangelion: [{
    title: 'When the Machines Stop: Fantasy, Reality, and Terminal Identity in ”Neon Genesis Evangelion“ and ”Serial Experiments Lain“',
    url: 'https://www.jstor.org/stable/4241108',
  }],
}

export const heroOrder = ['Batman_ninja', 'afro_samurai', 'edgerunners', 'monster', 'dorohedoro', 'evangelion']
