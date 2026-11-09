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
