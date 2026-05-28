/* Form — D'Amico & Partners
   - Client-side validation
   - Submit via Formspree (set data-endpoint on the form)
   - Honeypot anti-spam
   - Accessible feedback */
(function () {
  'use strict';

  const forms = document.querySelectorAll('form[data-form]');
  if (!forms.length) return;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  forms.forEach((form) => {
    const feedback = form.querySelector('.form__feedback');
    const submitBtn = form.querySelector('button[type="submit"]');
    const endpoint = form.dataset.endpoint || form.getAttribute('action');

    const showFeedback = (msg, state) => {
      if (!feedback) return;
      feedback.textContent = msg;
      feedback.classList.remove('is-success', 'is-error');
      if (state) feedback.classList.add('is-' + state);
      feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const setError = (field, msg) => {
      const wrap = field.closest('.form__field');
      if (!wrap) return;
      wrap.classList.add('has-error');
      const err = wrap.querySelector('.form__error');
      if (err && msg) err.textContent = msg;
      field.setAttribute('aria-invalid', 'true');
    };

    const clearError = (field) => {
      const wrap = field.closest('.form__field');
      if (!wrap) return;
      wrap.classList.remove('has-error');
      field.removeAttribute('aria-invalid');
    };

    /* Live error clearing */
    form.querySelectorAll('input, textarea, select').forEach((f) => {
      f.addEventListener('input', () => clearError(f));
      f.addEventListener('change', () => clearError(f));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;

      /* Honeypot — if filled, silently abort */
      const honey = form.querySelector('input[name="_gotcha"]');
      if (honey && honey.value) {
        showFeedback('Grazie, abbiamo ricevuto la tua richiesta.', 'success');
        form.reset();
        return;
      }

      /* Required fields */
      form.querySelectorAll('[required]').forEach((field) => {
        if (field.type === 'checkbox') {
          if (!field.checked) { setError(field, 'Devi accettare per continuare.'); valid = false; }
        } else if (!field.value.trim()) {
          setError(field, 'Questo campo è obbligatorio.');
          valid = false;
        }
      });

      /* Email validation */
      const email = form.querySelector('input[type="email"]');
      if (email && email.value && !emailRe.test(email.value.trim())) {
        setError(email, 'Inserisci un indirizzo email valido.');
        valid = false;
      }

      if (!valid) {
        showFeedback('Controlla i campi evidenziati e riprova.', 'error');
        return;
      }

      /* If no endpoint configured, just simulate success */
      if (!endpoint || endpoint.includes('FORMSPREE_ENDPOINT_PLACEHOLDER')) {
        showFeedback('Demo: form pronto. Configura l\'endpoint Formspree per inviare davvero la richiesta.', 'success');
        form.reset();
        return;
      }

      /* Submit to Formspree */
      submitBtn && (submitBtn.disabled = true, submitBtn.textContent = 'Invio in corso...');
      try {
        const data = new FormData(form);
        const res = await fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          showFeedback('Grazie, abbiamo ricevuto la tua richiesta. Ti ricontatteremo al più presto in totale riservatezza.', 'success');
          form.reset();
        } else {
          const json = await res.json().catch(() => ({}));
          const msg = json && json.errors ? json.errors.map((er) => er.message).join(', ') : 'Si è verificato un errore. Riprova o contattaci telefonicamente.';
          showFeedback(msg, 'error');
        }
      } catch (err) {
        showFeedback('Si è verificato un errore di rete. Riprova fra qualche istante o contattaci telefonicamente.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.label || 'Invia richiesta';
        }
      }
    });
  });
})();
