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
    // convergenza: carillon sommesso — poche note dolci in scala pentatonica
    // che salgono piano verso l'incastro
    assemble: function () {
      var t0 = actx.currentTime;
      var DUR = 1.3;
      // C5 D5 E5 G5 A5 C6 D6 E6: pentatonica, nessuna dissonanza possibile
      var NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7, 1318.5];
      for (var i = 0; i < NOTES.length; i++) {
        var p = i / (NOTES.length - 1);                 // 0 → 1
        var when = t0 + p * DUR + Math.random() * 0.04;
        var vol = 0.018 + p * 0.032;                    // crescendo appena accennato
        ping(when, NOTES[i], vol, 0.55 + Math.random() * 0.25);
      }
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
  }

  // il replay è un gesto esplicito: qui l'audio parte dall'inizio, completo
  replayBtn.addEventListener('click', function () {
    hero.classList.remove('ended', 'static');
    ensureAudio();
    resetCues(0);
    video.currentTime = 0;
    var p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(showStatic);
    }
  });

  // Il reveal on scroll delle sezioni e tutte le altre interazioni della pagina
  // (nav, accordion, tabs, form) vivono in site.js: main.js resta hero.
})();
