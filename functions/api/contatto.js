// Cloudflare Pages Function: riceve il modulo di contatti.html e lo inoltra allo studio via Brevo.
// Variabili da impostare in Cloudflare (Pages > Settings > Variables and Secrets):
//   BREVO_API_KEY  (segreta)  chiave API di Brevo
//   MAIL_FROM                 mittente verificato su Brevo, es. sito@damicoandpartners.it
//   MAIL_TO                   casella che riceve le richieste, es. info@damicoandpartners.it
// Nessun dato viene salvato: il messaggio passa da qui a Brevo e basta.

const LIMITI = { name: 120, company: 160, email: 200, phone: 40, message: 5000 };
const json = (ok, status, errore) =>
  new Response(JSON.stringify(ok ? { ok: true } : { ok: false, errore }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json(false, 405, 'metodo');
  if (!env.BREVO_API_KEY || !env.MAIL_FROM || !env.MAIL_TO) return json(false, 503, 'non-configurato');

  let f;
  try { f = await request.formData(); } catch { return json(false, 400, 'formato'); }
  const v = (k) => String(f.get(k) || '').trim();

  // trappole per i bot: se compilate, fingiamo successo e non inviamo niente
  if (v('_gotcha') || v('botcheck')) return json(true, 200);

  const d = {};
  for (const k of Object.keys(LIMITI)) d[k] = v(k).slice(0, LIMITI[k]);
  if (!d.name || !d.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || !v('privacy'))
    return json(false, 422, 'campi');

  const testo = [
    'Nuova richiesta dal modulo contatti del sito.',
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
    `Presa visione informativa privacy: sì (${new Date().toISOString()})`,
  ].join('\n');

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Sito D’Amico & Partners', email: env.MAIL_FROM },
      to: [{ email: env.MAIL_TO }],
      replyTo: { email: d.email, name: d.name },
      subject: `Richiesta di incontro dal sito: ${d.name}`,
      textContent: testo,
    }),
  });
  if (!r.ok) {
    console.log('Brevo', r.status, await r.text());
    return json(false, 502, 'invio');
  }
  return json(true, 200);
}
