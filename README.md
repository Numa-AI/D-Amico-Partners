# Sito D'Amico & Partners

Sito web statico unificato per **D'Amico & Partners** (Brescia). HTML5 + CSS3 + JS vanilla, zero build, zero dipendenze npm.

Il sito è una **single-page** dal tema scuro (antracite + accento azzurro `#29ABE2`), con hero video del vaso che si ricompone nel logo, sezioni Divisioni (Consulting / Advisory), Servizi, Metodo, Chi siamo, Strumenti, A chi ci rivolgiamo, Perché sceglierci e Contatti. Le pagine legali sono separate ma condividono lo stesso tema.

## Struttura

```text
sito/
├── index.html            Home (single-page: tutte le sezioni)
├── privacy.html          Informativa privacy (GDPR)
├── cookie.html           Cookie policy
├── note-legali.html      Note legali & dati societari
├── 404.html              Pagina di errore
├── style.css             Token, reset, base, topbar, hero
├── sections.css          Componenti delle sezioni + pagine legali
├── main.js               State machine dell'hero video (+ audio sintetizzato)
├── site.js               Nav, accordion, tabs, form Web3Forms, reveal, sticky bar
├── logo-chiaro-trasparente.png
├── hero.mp4 · hero-poster.jpg · hero-fine.jpg
├── chi-siamo-brescia.avif
├── sitemap.xml · robots.txt
├── _redirects            Regole redirect per Netlify
└── vercel.json           Config Vercel (cleanUrls, redirect storici, cache)
```

> `main.js` è dedicato all'hero e viene incluso **solo** in `index.html`; le pagine
> legali e la 404 caricano soltanto `site.js` (che è null-safe).

## Anteprima locale

```bash
cd sito && python -m http.server 8765
```

Poi aprire <http://localhost:8765/>

## Note

- **Web3Forms**: il form (in `index.html`) invia a `https://api.web3forms.com/submit` con il campo nascosto `access_key` valorizzato al placeholder `WEB3FORMS_ACCESS_KEY`. Sostituirlo con la propria access key (dashboard su web3forms.com) per attivare l'invio. Infrastruttura UE: nessun trasferimento dati extra-UE.
- **Deploy**: hosting statico (Vercel via `vercel.json`, o Netlify via `_redirects`). Il dominio `damicoadvisory.it` reindirizza a `damicoandpartners.it`.
- **Privacy**: l'informativa è una bozza da far validare dal consulente privacy / DPO (v. banner in `privacy.html`).
