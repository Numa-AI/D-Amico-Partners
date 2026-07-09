# Sito D'Amico & Partners

Sito web statico unificato per **D'Amico & Partners** (Brescia). HTML5 + CSS3 + JS vanilla, zero build, zero dipendenze npm.

Il sito è una **single-page** dal tema scuro (antracite + accento azzurro `#29ABE2`), con hero video del vaso che si ricompone nel logo, sezioni Divisioni (Consulting / Advisory), Servizi, Metodo, Chi siamo, Strumenti, A chi ci rivolgiamo, Perché sceglierci e Contatti. Le pagine legali sono separate ma condividono lo stesso tema.

## Struttura

```text
sito/
├── index.html             Home (single-page: tutte le sezioni)
├── index-vaso2.html       Variante hero con il video "Vaso 2" (noindex, anteprima)
├── privacy.html           Informativa privacy (GDPR)
├── cookie.html            Cookie policy
├── note-legali.html       Note legali & dati societari
├── 404.html               Pagina di errore
├── favicon-light.png · favicon-dark.png    Favicon adattive al tema
├── sitemap.xml · robots.txt · .nojekyll    Meta + deploy GitHub Pages
└── assets/
    ├── css/
    │   ├── style.css       Token, reset, base, topbar, hero
    │   └── sections.css    Componenti delle sezioni + pagine legali
    ├── js/
    │   ├── main.js         State machine dell'hero video (+ audio sintetizzato)
    │   └── site.js         Nav, accordion, tabs, form Web3Forms, reveal, sticky bar
    ├── fonts/              inter.woff2 · playfair.woff2 (self-hosted, GDPR-clean)
    ├── img/                logo · hero-poster · hero-fine · chi-siamo-brescia · poster video · div-start
    └── video/              hero.mp4 · hero-vaso2.mp4 · bilancio-crescita.mp4
```

> Tutti gli asset (CSS, JS, font, immagini, video) vivono sotto `assets/`; solo le
> pagine `.html`, i favicon e i file di meta/deploy restano nella root (necessario per
> le URL pubbliche e GitHub Pages). `main.js` è dedicato all'hero e viene incluso **solo**
> in `index.html` e `index-vaso2.html`; le pagine legali e la 404 caricano soltanto
> `site.js` (null-safe).

## Anteprima locale

```bash
cd sito && python -m http.server 8765
```

Poi aprire <http://localhost:8765/>

## Note

- **Web3Forms**: il form (in `index.html`) invia a `https://api.web3forms.com/submit` con il campo nascosto `access_key` valorizzato al placeholder `WEB3FORMS_ACCESS_KEY`. Sostituirlo con la propria access key (dashboard su web3forms.com) per attivare l'invio. Infrastruttura UE: nessun trasferimento dati extra-UE.
- **Deploy**: **GitHub Pages** (branch `main`, cartella root). Il file `.nojekyll` evita l'elaborazione Jekyll, così i file sono serviti così come sono. Per il dominio personalizzato `damicoandpartners.it`: aggiungere un file `CNAME` oppure impostarlo da Settings → Pages. Nota: GitHub Pages non supporta redirect server-side (i vecchi URL richiederebbero pagine stub con meta-refresh).
- **Privacy**: l'informativa è una bozza da far validare dal consulente privacy / DPO (v. banner in `privacy.html`).
