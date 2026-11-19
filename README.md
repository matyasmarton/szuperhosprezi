# Rendhagyó Japán Szuperhősök Prezentáció

Nyisd meg közvetlenül az `index.html` fájlt egy böngészőben. Nem kell szerver, internetkapcsolat, Node.js vagy npm. Az `index.html`, a `site/`, a `photo/` és a `video/` maradjon egymás mellett.

Szöveg- vagy médiafrissítés után futtasd a `python3 build.py` parancsot (Python 3.9+, külső csomagok nélkül), és commitold a frissített `index.html`-t. Az HTML-fájlt ne szerkeszd kézzel.

- A prezentáció szövegét a `prezi.md` fájlban szerkeszd.
- A galériaképeket tedd a `photo/<mappa>/` könyvtárba. A `cover` vagy `title` szót tartalmazó fájlnevek a borító- és nyitóképek számára vannak fenntartva.
- A jeleneteket tedd a `video/<mappa>/` könyvtárba (`.mp4`, `.webm` vagy `.mov`). Az `original` szót tartalmazó fájlokat a generátor nem használja.
- A pontos mappanevek a `build.py` fájl `FOLDERS` táblájában vannak.
- A Netlify a `python3 build.py --publish` paranccsal létrehozott `dist/` mappát teszi közzé. Ez a mappa egyben hordozható példány.
