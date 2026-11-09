# Sito D'Amico & Partners

Sito statico di **D'Amico & Partners** (Brescia): HTML, CSS e JavaScript senza build step né dipendenze da installare.
Pubblicato con Cloudflare Pages dal branch `main` (nessun build, cartella root). Il modulo contatti è gestito da `functions/api/contatto.js` (Pages Function) che invia via Brevo.

## Pagine

| File | Contenuto |
|---|---|
| `index.html` | Home: pannelli fotografici a tutto schermo (piazza, arco, crepuscolo), poi Chi siamo, Le nostre attività, video, Il nostro approccio, Competenze integrate, contatti |
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
├── css/style.css     tutto lo stile (token, header, pannelli della home, pagine, footer)
├── js/site.js        header, menu, video in vista, modulo contatti
├── js/home.js        solo home: pannelli fotografici che scorrono uno sopra l'altro (GSAP ScrollTrigger)
├── vendor/           gsap e ScrollTrigger 3.13.0 (copie locali, nessuna CDN)
├── fonts/            Libre Caslon Display e Hanken Grotesk (self-hosted)
├── img/film/         le quattro immagini in WebP, con ritagli per mobile
├── img/              logo DP, poster del video, immagine Open Graph
└── video/            bilancio-crescita.mp4
```

Nessuna risorsa viene caricata da domini esterni: coerente con la cookie policy pubblicata. Il modulo parla solo con
`/api/contatto` (stesso dominio); è la funzione lato server a chiamare Brevo.

## Robot, sicurezza e file di servizio

| File | A cosa serve |
|---|---|
| `_headers` | Intestazioni HTTP di Cloudflare Pages: CSP (solo questo dominio; l'unico script inline è ammesso col suo hash), HSTS, niente iframe, nosniff, Referrer/Permissions-Policy, cache di `assets/`, `noindex` sugli indirizzi `*.pages.dev` e su `prova-torre` |
| `_redirects` | `index-piazza` → home; `README.md`, `BRIEF.md`, `functions/` non pubblici; `/security.txt` → `/.well-known/security.txt` |
| `robots.txt` | Tutto aperto (anche ai crawler AI), tranne `/api/` |
| `sitemap.xml` | Indirizzi senza `.html`, come li serve Cloudflare (che porta `/pagina.html` a `/pagina` con un 308) |
| `llms.txt` | Scheda dello studio per gli assistenti AI, con i testi del sito |
| `.well-known/security.txt` | Dove segnalare una falla. **Scade il 31/10/2027**: rinnovare `Expires` prima |

Se si cambia anche di un carattere lo script inline in testa alle pagine (`classList.add('anim')`), va ricalcolato
l'hash nella CSP di `_headers` (il comando è nel commento): altrimenti le animazioni restano spente.

Il modulo (`functions/api/contatto.js`) accetta solo POST dal sito stesso (controllo dell'Origin), massimo 32 KB,
campi ripuliti e tagliati, due trappole per bot.

### Impostazioni da fare nel pannello Cloudflare (non stanno nel repo)

- **Security → WAF → Rate limiting rules**: una regola su `URI Path equals /api/contatto`, metodo POST,
  5 richieste ogni 10 secondi per IP → Block per 10 secondi (il piano gratuito ne permette una).
- **SSL/TLS**: modalità Full (strict), Always Use HTTPS attivo, Minimum TLS 1.2.
- **Redirect** `damicoandpartners.it` → `https://www.damicoandpartners.it` (Rules → Redirect Rules, 301, conserva percorso).
- **Bot / AI**: lasciare spenti Bot Fight Mode e «Block AI bots»/robots.txt gestito da Cloudflare, se si vuole che lo
  studio compaia nelle risposte degli assistenti AI (scelta da confermare col cliente).
- Dopo il primo deploy controllare le intestazioni su <https://securityheaders.com> e che `/README.md` rimandi alla home.

## Anteprima locale

```bash
python3 -m http.server 8765
```

Poi aprire <http://localhost:8765/>.

## Da fare per attivare il modulo contatti

Variabili in Cloudflare (Pages → Settings → Variables and Secrets): `BREVO_API_KEY` (secret), `MAIL_FROM`
(mittente verificato su Brevo), `MAIL_TO` (casella che riceve). Senza variabili la funzione risponde 503 e il
modulo mostra telefono ed email. Su Cloudflare lasciare spenti Bot Fight Mode e Web Analytics: metterebbero
cookie o script che la cookie policy dichiara assenti. In Brevo disattivare il blocco per IP delle chiavi API
(Security → Authorised IPs), perché Cloudflare chiama da IP variabili.

## Dominio

Per `damicoandpartners.it`: Pages → Custom domains, aggiungere `www.damicoandpartners.it` e
`damicoandpartners.it`. Prima di spostare i nameserver su Cloudflare copiare TUTTI i record DNS esistenti
(soprattutto MX, SPF, DKIM della posta dello studio). `canonical`, `sitemap.xml` e `robots.txt` usano già `https://www.damicoandpartners.it/`.
