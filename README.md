# Sito D'Amico & Partners

Sito statico di **D'Amico & Partners** (Brescia): HTML, CSS e JavaScript senza build step né dipendenze da installare.
Pubblicato con GitHub Pages dal branch `main` (cartella root, `.nojekyll` presente).

## Pagine

| File | Contenuto |
|---|---|
| `index.html` | Home: film a scorrimento su quattro immagini di Piazza della Vittoria (crepuscolo → giorno → arco → targa), poi Chi siamo, Le nostre attività, video, Il nostro approccio, Competenze integrate, contatti |
| `chi-siamo.html` | Storia dello studio e le due aree |
| `approccio.html` | Il nostro approccio |
| `advisory.html` | D'Amico & Partners Advisory: tre servizi |
| `consulting.html` | D'Amico & Partners Consulting (OAM M640): due servizi e obiettivo finale |
| `contatti.html` | Recapiti, PEC e modulo di contatto |
| `privacy.html` · `cookie.html` · `note-legali.html` | Pagine legali |
| `404.html` | Pagina di errore · `index-piazza.html` reindirizza alla home (vecchia anteprima) |

Header e footer sono ripetuti in ogni pagina: una modifica va replicata a mano in tutti i file.

## Struttura

```text
assets/
├── css/site.css      token, font, tipografia, header, menu, layout, pagine, footer
├── css/film.css      solo home: i quattro quadri del film
├── js/site.js        header, menu mobile, anno, video in vista, modulo contatti
├── js/film.js        solo home: GSAP ScrollTrigger + Lenis (con fallback statico senza JS o con motion ridotto)
├── vendor/           gsap 3.13.0, ScrollTrigger 3.13.0, lenis 1.3.8 (copie locali, nessuna CDN)
├── fonts/            Bodoni Moda e Archivo in woff2 (self-hosted, nessuna richiesta a Google Fonts)
├── img/film/         le quattro immagini in WebP, con ritagli 9:16 per mobile
├── img/              logo DP, poster del video, immagine Open Graph
└── video/            bilancio-crescita.mp4
```

Nessuna risorsa viene caricata da domini esterni: coerente con la cookie policy pubblicata. L'unico servizio esterno
è Web3Forms, contattato solo all'invio del modulo.

## Anteprima locale

```bash
python3 -m http.server 8765
```

Poi aprire <http://localhost:8765/>.

## Da fare per attivare il modulo contatti

In `contatti.html` sostituire il valore `WEB3FORMS_ACCESS_KEY` del campo nascosto `access_key` con la chiave
della dashboard di web3forms.com. Finché resta il segnaposto, il modulo mostra un messaggio con telefono ed email.

## Dominio

Per `damicoandpartners.it`: aggiungere un file `CNAME` con il dominio (o impostarlo da Settings → Pages) e
puntare il DNS a GitHub Pages. `canonical`, `sitemap.xml` e `robots.txt` usano già `https://www.damicoandpartners.it/`.
