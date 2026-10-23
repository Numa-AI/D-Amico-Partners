# BRIEF — nuovo sito D'Amico & Partners (sopravvive alla compattazione del contesto)

Repo: questo clone (`main`, GitHub Pages root). Sorgenti (docx, PNG) nella cartella madre, MAI nel repo.

## Decisioni fisse
- Versione 3 (rifatta da zero dopo due bocciature): pannelli foto sticky che scorrono uno sopra l'altro, schede bianche,
  blu notte #16223B + pietra #E8E5DF, Libre Caslon Display + Hanken Grotesk. Niente maschere, niente dissolvenze lunghe.
- Testi SOLO dal docx. Niente CDN esterne. Generatore fuori repo (scratchpad/gen/gen2.py).

## Token
--bianco #FFFFFF · --pietra #EFEDE8 · --inchiostro #16213A · --inchiostro-2 #4A546A
--ottone #B8903A · --ottone-scuro #7E6124 · --azzurro #29ABE2 (solo logo/focus/hover) · --muro #D2CCC2 (parete della targa)
Display: 'Bodoni Moda' (variabile, italic+normal, 400-900). Testo/UI: 'Archivo' (300-700). Self-hosted, latin.

## File immagine (assets/img/film)
crepuscolo-1448/1000.webp + crepuscolo-mobile.webp (611×1086, 9:16) — cap. 1
giorno-1448/1000.webp + giorno-mobile.webp (611×1086) — cap. 2
arco-1024/720.webp (portrait 2:3) — cap. 3
targa-desktop.webp (1920×1080, targa composta su muro #D2CCC2 sfumato) + targa-mobile.webp (1080×1920) — cap. 4
targa-1122/800.webp (originale) — hero contatti. og.jpg 1200×630. logo-dp(-bianco)(-96).png.

## Pagine
index · chi-siamo · approccio · advisory · consulting · contatti · privacy · cookie · note-legali · 404
Header/footer duplicati a mano (nessun build). Nav: Chi siamo · Approccio · Advisory · Consulting · Contatti · CTA "Richiedi un incontro".

## Verifica (skill sito-film, scripts già installati)
Server: nohup python3 -m http.server 8765 & (mai in foreground). shot.js 1440×900 e 390×844 a 0/.25/.5/.75/1.
verify.js jank max < 50ms. copy-gate.js *.html exit 0. detect.mjs di impeccable una volta a fine build.
Contratto dev: ?jump=<y> + window.__ready.
