# Rendhagyó Japán Szuperhősök Prezentáció

```sh
npm ci
npm run dev
npm run build
```

- A prezentáció szövegét a `prezi.md` fájlban szerkeszd.
- A galériaképeket tedd a `photo/<mappa>/` könyvtárba. A `cover` vagy `title` szót tartalmazó fájlnevek a borító- és nyitóképek számára vannak fenntartva.
- A jeleneteket tedd a `video/<mappa>/` könyvtárba (`.mp4`, `.webm` vagy `.mov`). Az `original` szót tartalmazó fájlok nem kerülnek a webes buildbe.
- A pontos mappanevek a `src/content/media.ts` fájlban vannak. A Netlify az `npm run build` parancs kimenetét (`dist/`) teszi közzé.
