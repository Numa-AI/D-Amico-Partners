# BRIEF — nuovo sito D'Amico & Partners (sopravvive alla compattazione del contesto)

Repo: questo clone (`main`, GitHub Pages root). Sorgenti (docx, PNG) nella cartella madre, MAI nel repo.

## Decisioni fisse
- Versione 4 (2026-10-28, rifatta con la skill design-taste-frontend, direzione «The printed annual», seed 2040287961):
  impaginato come un bilancio stampato, asse fisso al 42% (colonna 6 di 12), campiture blu notte / pietra / ottone.
  Scroll NATIVO, nessuna sezione bloccata (il cliente non voleva più i pannelli sticky). Solo entrate e lievi derive.
- Testata home: foto della piazza secondo l'ora di Brescia (giorno 7–18, crepuscolo altrimenti); scorrendo dissolve nell'altra.
- Servizi (home, advisory, consulting): ICONE SVG FERME in riquadri blu notte (tratto bianco, dettaglio ottone), niente foto.
  Bocciate le icone che si disegnano allo scroll («sembrano tagliate»).
- Bocciati (2026-10-28): colonna vuota a sinistra (asse al 42% lasciato vuoto), footer a tutto schermo col nome gigante,
  sito «troppo bianco». Quindi: pagine interne con foto a tutta larghezza e titolo sopra, testo affiancato da foto,
  fasce notte/pietra alternate, footer classico compatto.
- Testi SOLO dal docx. Niente CDN esterne. Footer comune generato a mano (stesso blocco in tutte le pagine).

## Token
--carta #FFFFFF · --pietra #E5E4E1 · --notte #16223B · --inchiostro #141C2E · --soft #4D5669 · --ottone #B38A3E · --azzurro #29ABE2 (solo focus/logo)
Display: Imbue (variabile, opsz) — h1 e marchio in maiuscolo. Testo: Albert Sans. Self-hosted in assets/fonts.
Foto Commons (credito nel footer): img/torrione-portici-1100.webp, img/torrione-piazza-1600.webp — Fred Romero, CC BY 2.0.

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
verify.js jank max < 50ms (CHROME_PATH=/usr/bin/chromium). inspect.mjs della skill taste: 0 FAIL sulla home. copy-gate.js *.html exit 0. detect.mjs di impeccable una volta a fine build.
Contratto dev: ?jump=<y> + window.__ready.
