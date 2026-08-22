# Speed Reader

Vite Module Federation remote that exposes `speed_reader/SpeedReader` for the CV Builder host.

## Local development

```bash
npm i && npm run dev
```

The remote runs on port **3002**. The host loads:

`http://localhost:3002/mf-manifest.json`

Standalone preview (after a production build):

```bash
npm run build && npm run preview
```

Preview also uses port 3002. Manifest URL:

`http://localhost:3002/mf-manifest.json`

## Production

Set `VITE_PUBLIC_ORIGIN` to the Vercel URL **before** `npm run build` so `remoteEntry.js` and `mf-manifest.json` emit absolute asset URLs.

```bash
VITE_PUBLIC_ORIGIN=https://your-app.vercel.app npm run build
```
