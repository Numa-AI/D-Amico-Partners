// DP landing — orchestrazione hero video + suoni + reveal sezioni
// Stati della hero:
//   (nessuna classe) → video in riproduzione
//   .ended  → video finito, congelato sull'ultimo fotogramma (logo ricomposto)
//   .static → fallback senza video (autoplay bloccato o reduced motion)
(function () {
  'use strict';

  var hero = document.querySelector('.hero');
  var video = document.getElementById('heroVideo');
  var replayBtn = document.getElementById('replayBtn');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ Suoni (Web Audio API, sintetizzati: nessun file) ============
     I browser consentono l'audio solo dopo un gesto dell'utente: il primo
     playthrough parte per forza muto; il suono si attiva dal primo click/tap
     in poi e sul replay. Tempi rilevati dal video (7s):
     rottura ~0.75s, convergenza cocci ~4.0s, incastro nel logo ~5.35s. */

  var CUES = [
    { t: 0.95, name: 'shatter' },
    { t: 4.00, name: 'assemble' }
  ];
  var actx = null;
  var soundOn = false;
  var fired = {};

  function ensureAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (!actx) actx = new AC();
    if (actx.state === 'suspended') actx.resume();
    soundOn = true;
    return true;
  }

  function noiseSource(dur) {
    var buf = actx.createBuffer(1, Math.ceil(actx.sampleRate * dur), actx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var src = actx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  function envGain(t0, peak, dur) {
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    g.connect(actx.destination);
    return g;
  }

  function ping(t0, freq, peak, dur) {
    var o = actx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(envGain(t0, peak, dur));
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  // tono d'ambiente: fade-in lento + coda lunghissima. Non un colpo, ma un
  // "respiro" che si gonfia e si dissolve. Ritorna l'oscillatore per poterne
  // modulare la frequenza (portamento) dall'esterno.
  function swell(t0, freq, peak, attack, dur, type) {
    var o = actx.createOscillator();
    o.type = type || 'sine';
    o.frequency.value = freq;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + attack);   // salita lenta
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);    // dissolvenza lunga
    g.connect(actx.destination);
    o.connect(g);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
    return o;
  }

  var sounds = {
    // rottura: botta di rumore "ceramica" + tonfo basso + clink di schegge
    shatter: function () {
      var t0 = actx.currentTime;
      var n = noiseSource(0.5);
      var bp = actx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2600;
      bp.Q.value = 0.9;
      n.connect(bp);
      bp.connect(envGain(t0, 0.11, 0.45));
      n.start(t0);
      ping(t0, 95, 0.09, 0.22);
      for (var i = 0; i < 9; i++) {
        ping(t0 + 0.03 + Math.random() * 0.5,
             1600 + Math.random() * 2800,
             0.012 + Math.random() * 0.02,
             0.09 + Math.random() * 0.15);
      }
    },
    // ricomposizione: non più note percosse, ma un respiro risonante. Un accordo
    // caldo (Do maggiore aperto) le cui voci entrano scaglionate in dissolvenza
    // lenta — come i cocci che si attraggono — mentre una voce sale in portamento
    // verso l'incastro; poi lunga coda dorata che si spegne oltre la fine (kintsugi)
    assemble: function () {
      var t0 = actx.currentTime;
      // C4 E4 G4 C5 E5: accordo spalmato su due ottave, nessuna dissonanza
      var CHORD = [261.63, 329.63, 392.0, 523.25, 659.25];
      for (var i = 0; i < CHORD.length; i++) {
        var attack = 0.8 + i * 0.16;                    // le voci si accendono a scaglioni
        var peak = 0.013 + i * 0.003;                   // tenui e crescenti verso l'acuto
        swell(t0 + i * 0.06, CHORD[i], peak, attack, 4.6 + i * 0.15);
        // gemella disaccordata di pochi cent: leggero battimento "vivo", non piatto
        swell(t0 + i * 0.06, CHORD[i] * 1.004, peak * 0.6, attack, 4.4 + i * 0.15);
      }
      // voce centrale che sale piano G4 → C5: senso di convergenza e risoluzione
      var glide = swell(t0, 392.0, 0.012, 1.0, 4.2);
      glide.frequency.setValueAtTime(392.0, t0);
      glide.frequency.exponentialRampToValueAtTime(523.25, t0 + 2.1);
      // velo cristallino appena percettibile che svanisce dopo l'incastro
      swell(t0 + 0.5, 1046.5, 0.0035, 1.4, 4.4);
    }
  };

  // segna come già suonati i cue precedenti a fromTime (per non recuperarli
  // in ritardo quando l'audio si attiva a metà riproduzione)
  function resetCues(fromTime) {
    fired = {};
    CUES.forEach(function (c) {
      if (c.t < fromTime) { fired[c.name] = true; }
    });
  }

  function cueLoop() {
    if (video.paused || video.ended) { return; }
    if (soundOn) {
      var ct = video.currentTime;
      CUES.forEach(function (c) {
        if (!fired[c.name] && ct >= c.t) {
          fired[c.name] = true;
          try { sounds[c.name](); } catch (e) { /* audio non disponibile */ }
        }
      });
    }
    requestAnimationFrame(cueLoop);
  }

  video.addEventListener('play', function () { requestAnimationFrame(cueLoop); });

  // primo gesto utente della pagina: da qui in poi l'audio è consentito
  document.addEventListener('pointerdown', function firstTap() {
    document.removeEventListener('pointerdown', firstTap);
    if (reducedMotion || hero.classList.contains('static')) { return; }
    if (ensureAudio()) { resetCues(video.currentTime); }
  });

  /* ============ Stati hero ============ */

  function showStatic() {
    hero.classList.remove('ended');
    hero.classList.add('static');
    try { video.pause(); } catch (e) { /* niente */ }
  }

  function onEnded() {
    hero.classList.add('ended');
  }

  // ricomincia il video dall'inizio. enableSound=true (replay esplicito) sblocca
  // l'audio; su false (replay automatico da scroll) il suono parte solo se
  // l'utente lo aveva già attivato in precedenza.
  function replay(enableSound) {
    hero.classList.remove('ended', 'static');
    if (enableSound) { ensureAudio(); }
    resetCues(0);
    try { video.currentTime = 0; } catch (e) { /* niente */ }
    var p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(showStatic);
    }
  }

  if (reducedMotion) {
    // niente animazioni (e niente suoni): subito lo stato finale statico
    showStatic();
  } else {
    video.addEventListener('ended', onEnded);

    // l'autoplay può essere bloccato: in quel caso mostra il finale statico
    var p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(showStatic);
    }

    // tab in background a metà video: al ritorno riprendi (o ripiega sul finale)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden || hero.classList.contains('ended') ||
          hero.classList.contains('static') || video.ended) {
        if (video.ended) { onEnded(); }
        return;
      }
      var resume = video.play();
      if (resume && typeof resume.catch === 'function') {
        resume.catch(showStatic);
      }
    });

    // rete lenta / file mancante: non lasciare la hero vuota
    video.addEventListener('error', showStatic, true);

    // scroll fuori dalla hero e ritorno: il video riparte dall'inizio.
    // Isteresi: consideriamo la hero "uscita" quando è quasi fuori schermo
    // (≤15% visibile) e la facciamo ripartire solo quando torna ben visibile
    // (≥75%), così piccoli scroll vicino al bordo non la ritriggerano.
    if ('IntersectionObserver' in window) {
      var heroWasOut = false;
      var heroIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.intersectionRatio <= 0.15) {
            heroWasOut = true;
          } else if (entry.intersectionRatio >= 0.75 && heroWasOut) {
            heroWasOut = false;
            if (!hero.classList.contains('static')) { replay(false); }
          }
        });
      }, { threshold: [0.15, 0.75] });
      heroIO.observe(hero);
    }
  }

  // il replay è un gesto esplicito: qui l'audio parte dall'inizio, completo
  replayBtn.addEventListener('click', function () { replay(true); });

  // Il reveal on scroll delle sezioni e tutte le altre interazioni della pagina
  // (nav, accordion, tabs, form) vivono in site.js: main.js resta hero.
})();
