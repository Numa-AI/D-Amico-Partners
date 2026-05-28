# Sito D'Amico & Partners

Sito web statico unificato per **D'Amico & Partners**. HTML5 + CSS3 + JS vanilla, zero build, zero dipendenze.

## Struttura

```
sito/
├── index.html          Home
├── chi-siamo.html      Chi siamo
├── servizi.html        Servizi (Consulting)
├── advisory.html       Sezione Advisory
├── contatti.html       Contatti + form
├── privacy.html        Informativa privacy
├── cookie.html         Cookie policy
├── note-legali.html    Note legali & dati societari
├── 404.html            Pagina di errore
├── sitemap.xml         Sitemap per i motori di ricerca
├── robots.txt          Direttive crawler
├── _redirects          Regole rewrite/redirect per Netlify
└── assets/
    ├── css/            (reset, tokens, base, components, pages)
    ├── js/             (nav, form, reveal)
    └── img/            (logo, og, hero, icons)
```

Per la mappa concettuale completa, vedere `../CLAUDE.md` e `../design.md` nella cartella principale.

## Anteprima locale (solo per testare prima del deploy)

Per vedere il sito sul tuo computer durante lo sviluppo serve un mini web server perché il browser, quando apri direttamente i file `.html` con doppio click (protocollo `file://`), blocca i percorsi assoluti come `/assets/...` per ragioni di sicurezza. Una volta deployato su GitHub Pages o Vercel **non serve niente di tutto questo** — quei servizi sono il web server.

Tre modi semplici per l'anteprima locale (scegli uno):

```bash
# Python (preinstallato su macOS/Linux, installabile su Windows)
python -m http.server 8080

# Node.js (se hai npm)
npx serve

# VS Code: installa l'estensione "Live Server" e clicca "Go Live"
```

Poi apri `http://localhost:8080` nel browser.

## Configurazioni da completare prima del go-live

1. **Endpoint Formspree** — sostituire la stringa `FORMSPREE_ENDPOINT_PLACEHOLDER` nei file `index.html` e `contatti.html` con l'endpoint reale ottenuto su https://formspree.io (gratis fino a 50 invii/mese).
2. **Privacy policy** — la pagina `privacy.html` contiene un canovaccio standard. Va completata e validata dal consulente privacy/DPO della società.
3. **Google Search Console** — registrare la proprietà dopo il deploy ed inviare `sitemap.xml`.
4. **Analytics** — se desiderato, integrare Google Analytics 4 (richiede cookie banner) oppure soluzioni privacy-friendly come Plausible/Umami (no cookie banner).

## Deploy in produzione

Il sito è 100% statico (zero backend, zero database, zero build). Si può hostare gratis su qualsiasi servizio per static site. Le due opzioni più semplici e raccomandate:

### Opzione 1 — Vercel (raccomandata, deploy in 2 minuti)

**Da interfaccia web (no terminale):**
1. Vai su https://vercel.com e accedi con GitHub (o crea account).
2. Clicca "Add New..." → "Project" → "Import" da GitHub, oppure trascina direttamente la cartella `sito/`.
3. Framework Preset: **Other** (è puro HTML/CSS/JS).
4. Root Directory: imposta `sito/` se il repo contiene altre cartelle, altrimenti lascia `.`.
5. Build Command: lascia vuoto. Output Directory: lascia vuoto.
6. Clicca "Deploy".
7. In 30-60 secondi sarà online su `tuo-progetto.vercel.app`.
8. Per il dominio personalizzato `damicoandpartners.it`: Settings → Domains → aggiungi il dominio → segui le istruzioni per puntare i DNS (record A o CNAME) sul tuo registrar (Aruba, Register, ecc.).

**Note Vercel:**
- Vercel legge automaticamente il file `_redirects` per gestire URL puliti (`/chi-siamo` invece di `/chi-siamo.html`) e redirect dai vecchi URL.
- HTTPS automatico e gratuito con Let's Encrypt.
- Deploy automatico ad ogni `git push` se collegato a GitHub.

### Opzione 2 — GitHub Pages (gratis, perfetto se sei già su GitHub)

1. Crea un nuovo repository su GitHub (pubblico per piano gratuito, oppure usa GitHub Pro per repo privati).
2. Pusha il contenuto di `sito/` nel branch `main`:
   ```bash
   cd sito
   git init
   git add .
   git commit -m "Sito D'Amico & Partners iniziale"
   git branch -M main
   git remote add origin https://github.com/TUO-UTENTE/damico-sito.git
   git push -u origin main
   ```
3. Vai su Settings → Pages.
4. Source: **Deploy from a branch**.
5. Branch: `main` · Folder: `/ (root)` → Save.
6. Aspetta 1-2 minuti: il sito sarà online su `https://TUO-UTENTE.github.io/damico-sito/`.
7. Per il dominio personalizzato:
   - Settings → Pages → Custom domain → inserisci `damicoandpartners.it`.
   - Il sistema crea un file `CNAME` nel repo.
   - Sul registrar del dominio (Aruba, Register…): aggiungi un record `CNAME` `www → TUO-UTENTE.github.io` e un record `A` per la root verso gli IP GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153).
   - HTTPS si attiva automaticamente in ~10-30 minuti.

**Limite GitHub Pages:** non legge il file `_redirects` (che è specifico di Netlify/Vercel). Gli URL puliti `/chi-siamo` non funzioneranno: i visitatori dovranno usare `/chi-siamo.html`. I redirect dai vecchi URL `damicoadvisory.it` vanno comunque gestiti a livello DNS/host del vecchio dominio. **Se questo conta per te, scegli Vercel.**

### Opzione 3 — Hosting tradizionale via FTP (se hai già hosting Aruba/Register/SiteGround)

1. Carica tutto il contenuto di `sito/` nella cartella `public_html` (o `htdocs`) del provider via FTP/SFTP (FileZilla, Cyberduck).
2. Per gli URL puliti, crea un file `.htaccess` nella root (se è Apache):
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^([^.]+)$ $1.html [NC,L]
   ErrorDocument 404 /404.html
   Redirect 301 /area-di-attivita /servizi.html
   ```
3. Punta i DNS del dominio sull'IP del provider.

## QA pre-deploy (checklist)

- [ ] Tutte le pagine raggiungibili dal menu e dal footer.
- [ ] Endpoint Formspree configurato e testato con email di prova.
- [ ] `tel:`, `mailto:`, `wa.me` cliccabili da mobile reale.
- [ ] Lighthouse mobile ≥ 90 su tutte le 4 categorie (Performance, Accessibility, Best Practices, SEO).
- [ ] Test responsive su iPhone SE (375px), iPhone 14 (393px), iPad (768px), Desktop (1440px).
- [ ] Test cross-browser: Chrome, Safari, Firefox, Edge.
- [ ] Validatore W3C HTML pulito (https://validator.w3.org/).
- [ ] axe DevTools o WAVE: nessun errore critico di accessibilità.
- [ ] OG image renderizzata correttamente su https://www.opengraph.xyz/.
- [ ] Sitemap raggiungibile su `/sitemap.xml`.
- [ ] Robots.txt raggiungibile su `/robots.txt`.

## Crediti

- **Logo**: D'Amico & Partners Consulting (di proprietà del cliente).
- **Font**: Inter (https://rsms.me/inter) e Playfair Display (https://fonts.google.com/specimen/Playfair+Display) — entrambi SIL Open Font License.
- **Icone**: SVG inline ispirate al set Lucide (https://lucide.dev) — licenza ISC.

## Manutenzione

- I dati ricorrenti (header, footer, footer-bottom con P.IVA) sono duplicati in tutti i file HTML. Per modifiche a navigazione/footer applicare la stessa modifica in tutti i file (Find&Replace su VS Code consigliato).
- Tutti i colori, font-size, spaziature sono definiti in `assets/css/tokens.css`: modificare lì per propagare il cambiamento ovunque.
- Per aggiungere una pagina nuova: duplicare un file `.html` esistente, aggiornare title, description, canonical, OG, contenuto, e aggiungere la voce in `sitemap.xml` + `_redirects`.

## Roadmap fase 2 (fuori scope MVP)

- News/Blog con archivio e categorie.
- Risorse scaricabili (guide PDF, glossario interattivo).
- Pagina Team con foto reali dei soci.
- Area clienti riservata.
- Versione inglese.
- Check-up online (questionario interattivo di crisi).
