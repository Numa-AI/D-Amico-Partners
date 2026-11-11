// Cloudflare Pages Function: riceve il modulo di contatti.html e lo inoltra allo studio via Brevo.
// Variabili da impostare in Cloudflare (Pages > Settings > Variables and Secrets):
//   BREVO_API_KEY  (segreta)  chiave API di Brevo
//   MAIL_FROM                 mittente verificato su Brevo, es. sito@damicoandpartners.it
//   MAIL_TO                   casella che riceve le richieste, es. info@damicoandpartners.it
// Nessun dato viene salvato: il messaggio passa da qui a Brevo e basta.

const LIMITI = { name: 120, company: 160, email: 200, phone: 40, message: 5000 };
const MAX_BYTES = 32 * 1024; // il modulo pieno al massimo pesa ~6 KB
const json = (ok, status, errore, extra = {}) =>
  new Response(JSON.stringify(ok ? { ok: true } : { ok: false, errore }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
  });

// GET, HEAD ecc.: l'indirizzo esiste solo per ricevere il modulo
export const onRequest = () => json(false, 405, 'metodo', { Allow: 'POST' });

export async function onRequestPost({ request, env }) {
  // Solo dal nostro sito: un browser che invia da un'altra pagina manda l'Origin di quella pagina.
  // (Chi chiama da script può omettere l'Origin: per quello ci sono trappole e rate limit di Cloudflare.)
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json(false, 403, 'origine');

  const tipo = request.headers.get('Content-Type') || '';
  if (!/^(multipart\/form-data|application\/x-www-form-urlencoded)/i.test(tipo)) return json(false, 415, 'formato');
  if (Number(request.headers.get('Content-Length') || 0) > MAX_BYTES) return json(false, 413, 'troppo-grande');

  if (!env.BREVO_API_KEY || !env.MAIL_FROM || !env.MAIL_TO) return json(false, 503, 'non-configurato');

  let f;
  try {
    const corpo = await request.arrayBuffer(); // anche senza Content-Length il tetto vale
    if (corpo.byteLength > MAX_BYTES) return json(false, 413, 'troppo-grande');
    f = await new Response(corpo, { headers: { 'Content-Type': tipo } }).formData();
  } catch { return json(false, 400, 'formato'); }
  // campi su una riga: via a-capo e caratteri di controllo (finiscono in oggetto e Reply-To)
  const v = (k) => String(f.get(k) || '').replace(k === 'message' ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]+/g, ' ').trim();

  // trappole per i bot: se compilate, fingiamo successo e non inviamo niente
  if (v('_gotcha') || v('botcheck')) return json(true, 200);

  const d = {};
  for (const k of Object.keys(LIMITI)) d[k] = v(k).slice(0, LIMITI[k]);
  if (!d.name || !d.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || !v('privacy'))
    return json(false, 422, 'campi');

  const { html, text } = componi(d, new Date());

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Sito D’Amico & Partners', email: env.MAIL_FROM },
      to: [{ email: env.MAIL_TO }],
      replyTo: { email: d.email, name: d.name },
      subject: `Richiesta di incontro dal sito: ${d.name}`,
      htmlContent: html,
      textContent: text,
    }),
  });
  if (!r.ok) {
    console.log('Brevo', r.status, await r.text());
    return json(false, 502, 'invio');
  }
  return json(true, 200);
}

// ---------------------------------------------------------------- email
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function componi(d, quando) {
  const data = new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(quando);
  const nome1 = d.name.split(/\s+/)[0];
  const tel = d.phone.replace(/[^\d+]/g, '');
  const oggetto = encodeURIComponent('Re: la sua richiesta a D’Amico & Partners');

  const text = [
    `Nuova richiesta dal sito, ${data}`,
    '',
    `Nome e cognome: ${d.name}`,
    `Società: ${d.company || '-'}`,
    `Email: ${d.email}`,
    `Telefono: ${d.phone || '-'}`,
    '',
    'Messaggio:',
    d.message,
    '',
    '---',
    'Per rispondere basta usare "Rispondi": la risposta va direttamente a chi ha scritto.',
    `Il mittente ha dichiarato di aver letto l’informativa privacy (${data}).`,
  ].join('\n');

  const riga = (et, val) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid #E3E1DC;width:110px;font:600 12px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#7A7F8C;vertical-align:top">${et}</td>
<td style="padding:10px 0;border-bottom:1px solid #E3E1DC;font:16px/1.45 Arial,Helvetica,sans-serif;color:#141C2E">${val}</td></tr>`;

  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nuova richiesta dal sito</title></head>
<body style="margin:0;padding:0;background:#ECEBE7">
<div style="display:none;max-height:0;overflow:hidden">${esc(d.name)}${d.company ? ' · ' + esc(d.company) : ''}: ${esc(d.message.slice(0, 110))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECEBE7"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF">
<tr><td style="background:#16223B;padding:22px 32px;border-bottom:3px solid #B38A3E">
<span style="font:500 17px/1 Georgia,'Times New Roman',serif;letter-spacing:.14em;color:#FFFFFF">D’AMICO &amp; PARTNERS</span></td></tr>
<tr><td style="padding:32px 32px 8px">
<p style="margin:0 0 10px;font:600 12px/1 Arial,Helvetica,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#8A6A25">Nuova richiesta dal sito</p>
<h1 style="margin:0;font:400 28px/1.2 Georgia,'Times New Roman',serif;color:#141C2E">${esc(d.name)}</h1>
<p style="margin:8px 0 0;font:14px/1.4 Arial,Helvetica,sans-serif;color:#4D5669">${d.company ? esc(d.company) + ' · ' : ''}${data}</p>
</td></tr>
<tr><td style="padding:20px 32px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${riga('Email', `<a href="mailto:${esc(d.email)}" style="color:#16223B">${esc(d.email)}</a>`)}
${riga('Telefono', d.phone ? `<a href="tel:${esc(tel)}" style="color:#16223B">${esc(d.phone)}</a>` : '<span style="color:#7A7F8C">non indicato</span>')}
${riga('Società', d.company ? esc(d.company) : '<span style="color:#7A7F8C">non indicata</span>')}
</table></td></tr>
<tr><td style="padding:28px 32px 0">
<p style="margin:0 0 10px;font:600 12px/1 Arial,Helvetica,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#7A7F8C">Messaggio</p>
<div style="font:16px/1.65 Arial,Helvetica,sans-serif;color:#141C2E">${esc(d.message).replace(/\r?\n/g, '<br>')}</div>
</td></tr>
<tr><td style="padding:28px 32px 32px">
<a href="mailto:${esc(d.email)}?subject=${oggetto}" style="display:inline-block;background:#16223B;color:#FFFFFF;text-decoration:none;font:600 15px/1 Arial,Helvetica,sans-serif;padding:15px 24px">Rispondi a ${esc(nome1)}</a>
</td></tr>
<tr><td style="padding:18px 32px 24px;border-top:1px solid #E3E1DC;font:12px/1.55 Arial,Helvetica,sans-serif;color:#7A7F8C">
Ricevuta dal modulo contatti di www.damicoandpartners.it. Anche il tasto «Rispondi» del programma di posta risponde direttamente a chi ha scritto.<br>
Il mittente ha dichiarato di aver letto l’informativa privacy (${data}).
</td></tr>
</table></td></tr></table></body></html>`;

  return { html, text };
}
