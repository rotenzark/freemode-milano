/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'freemode-milano', // usato per localStorage lang
    whatsapp: {
      number: '393888330696',
      message: 'Ciao Freemode! Vorrei informazioni su un capo.',
      ids: ['testaWhatsapp', 'drawerWhatsapp', 'heroWhatsapp', 'passWhatsapp', 'compraWhatsapp', 'speditoWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    hours: {
      0: [],
      1: [['15:00', '19:20']],
      2: [['10:00', '13:00'], ['15:00', '19:20']],
      3: [['10:00', '13:00'], ['15:00', '19:20']],
      4: [['10:00', '13:00'], ['15:00', '19:20']],
      5: [['10:00', '13:00'], ['15:00', '19:20']],
      6: [['10:00', '13:00'], ['15:00', '19:30']]
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1700,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "i.via": "Via Giambellino 79 · Milan",
      "i.skip": "Skip",
      "m.top": "Freemode Milano, back to the top",
      "m.top2": "Freemode Milano",
      "m.nav": "Sections",
      "m.lingua": "Language",
      "m.menu": "Open the menu",
      "m.lightbox": "Enlarged photo",
      "m.chiudi": "Close",
      "n.pass": "Runway",
      "n.compra": "How to buy",
      "n.negozio": "The shop",
      "n.dove": "Where and when",
      "n.rec": "Reviews",
      "n.wa": "Message us on WhatsApp",
      "h.eti": "Via Giambellino 79 · Milan · menswear, street and casual",
      "h.voto": "<b>4.8 on Google</b> · 120 reviews",
      "h.motto": "The sidewalk is our runway.",
      "h.p": "We shoot our looks right outside, in front of the shop window. Then you'll find them in store, on Instagram and on WhatsApp, and we'll help you with sizes and outfits.",
      "h.cta1": "See the runway",
      "h.cta2": "Message us on WhatsApp",
      "h.fotoz": "Enlarge the photo of the shop window",
      "h.fotoa": "Freemode's two shop windows at Via Giambellino 79 in the evening, with the FREEMODE signs lit and the mannequins",
      "h.fotof": "The Via Giambellino 79 shop window, in the evening",
      "p.eti": "The runway",
      "p.t": "Ten looks, one sidewalk.",
      "p.p": "Some of our looks, shot right outside on the Via Giambellino sidewalk. The pieces change all the time: to find out what's in your size today, message us.",
      "p.pista": "The looks, one after another: they scroll sideways",
      "l.1": "Sage green band-collar shirt · white pleated trousers · white sneakers",
      "l.1z": "Enlarge look 01",
      "l.1a": "Look 01: sage green band-collar shirt, white pleated trousers and white sneakers, on the sidewalk outside the shop",
      "l.2": "Peach suit · black T-shirt · black ankle boots",
      "l.2z": "Enlarge look 02",
      "l.2a": "Look 02: peach suit with a black T-shirt and black ankle boots, on the sidewalk outside the shop",
      "l.3": "White shirt · black high-waisted trousers with two buttons · white sneakers",
      "l.3z": "Enlarge look 03",
      "l.3a": "Look 03: white shirt, black high-waisted trousers with two buttons and white sneakers, on the sidewalk outside the shop",
      "l.4": "Pink off-the-shoulder playsuit with a tie belt · espadrilles",
      "l.4z": "Enlarge look 04",
      "l.4a": "Look 04: pink off-the-shoulder playsuit with a tie belt and espadrilles, on the sidewalk",
      "l.5": "Black and gold print shirt · dark blue creased trousers · black sneakers",
      "l.5z": "Enlarge look 05",
      "l.5a": "Look 05: black and gold print shirt, dark blue creased trousers and black sneakers, on the sidewalk outside the shop",
      "l.6": "Grey ribbed turtleneck · check trousers with a chain · black Chelsea boots",
      "l.6z": "Enlarge look 06",
      "l.6a": "Look 06: grey ribbed turtleneck, check trousers with a chain and black Chelsea boots, on the sidewalk",
      "l.7": "Crop top and ruffled skirt, animal print",
      "l.7z": "Enlarge look 07",
      "l.7a": "Look 07: crop top and ruffled skirt in animal print",
      "l.8": "Black shirt · black drawstring trousers · black sneakers",
      "l.8z": "Enlarge look 08",
      "l.8a": "Look 08: black shirt, black trousers with a white drawstring and black sneakers, on the sidewalk",
      "l.9": "Black and gold baroque print shirt · white trousers · black Chelsea boots",
      "l.9z": "Enlarge look 09",
      "l.9a": "Look 09: black and gold baroque print shirt, white trousers and black Chelsea boots, on the sidewalk",
      "l.10": "Navy double-breasted suit · white T-shirt · black sneakers",
      "l.10z": "Enlarge look 10",
      "l.10a": "Look 10: navy double-breasted suit with a white T-shirt and black sneakers, on the sidewalk outside the shop",
      "p.fine1": "The rest is in store.",
      "p.fine2": "And on Instagram, where we post the new arrivals.",
      "p.wa": "Ask for a size",
      "p.hint": "Scroll",
      "c.eti": "How to buy",
      "c.t": "In store, or from wherever you are.",
      "c.1t": "In store",
      "c.1p": "Via Giambellino 79, from Monday afternoon to Saturday. Try things on, and we'll help you with the size and what to wear it with.",
      "c.1a": "Directions",
      "c.2t": "On Instagram",
      "c.2p": "DM us at @freemodemilano: photos, sizes, colours, availability.",
      "c.2a": "Open Instagram",
      "c.3t": "On WhatsApp",
      "c.3p": "At +39 388 833 0696: we'll send you photos and tell you what's in your size.",
      "c.3a": "Message us",
      "c.4t": "We ship it",
      "c.4p": "If you can't come to the shop, the parcel reaches your home or office. We'll tell you times and costs when you message us.",
      "c.4a": "Ask",
      "c.5t": "Gift card",
      "c.5p": "For a present: DM us on Instagram and we'll prepare it.",
      "c.5a": "Send a DM",
      "v.big": "Over 50,000",
      "v.lbl": "people follow us on Instagram",
      "v.p": "That's where we post the new arrivals: in our story highlights you'll find them month by month. See a piece you like? Comment, or DM us.",
      "v.btn": "Follow us on Instagram",
      "g.eti": "The shop",
      "g.t": "Small and tidy. Here you try things on.",
      "g.p1": "Shirts, trousers, knitwear, jackets and jeans, mostly for men. Come in, try things on, and we'll help you choose the size and what to pair it with.",
      "g.p2": "The entrance is wheelchair accessible, and you can pay by card and contactless.",
      "g.az": "Enlarge the photo of the shop",
      "g.aa": "Inside the shop: the grey wall with FREEMODE MILANO in raised letters and a rail of shirts",
      "g.af": "Our name on the wall, inside",
      "g.bz": "Enlarge the photo of the fitting rooms",
      "g.ba": "The fitting rooms with grey curtains under the FREEMODE MILANO panel",
      "g.bf": "The fitting rooms",
      "g.cz": "Enlarge the photo of the shirts",
      "g.ca": "White and black shirts on hangers printed with FREEMODE",
      "g.cf": "Shirts, on our own hangers",
      "r.eti": "Reviews",
      "r.t": "In our customers' words.",
      "r.voto": "out of 5 · 120 Google reviews",
      "rc.1": "I've been buying online from him for a long time. Great value for money, never had any problem, and he's always helpful and kind. Highly recommended",
      "rc.f1": "Antonio · 4 months ago · 5 stars",
      "rc.2": "Beautiful men's shop. Every time I need to buy a present I know where to go: low-priced items but above all good quality, with a great fit. Very competent staff, helpful and super kind. On Instagram I always find all the new arrivals. I ABSOLUTELY RECOMMEND IT!",
      "rc.f2": "CC · a year ago · 5 stars",
      "rc.3": "I bought a shirt and two pairs of trousers online for my boyfriend. Impeccable customer service, kind and quick with answers and help. Very fast shipping and delivery, great value for money. We'll definitely buy again!!",
      "rc.f3": "Marica Romeo · a year ago · 5 stars",
      "rc.4": "5 well-deserved stars for reliability, prompt communication both on Instagram and WhatsApp, and fast shipping. Thank you",
      "rc.f4": "M Col · a year ago · 5 stars",
      "rc.5": "I've always been happy buying from Freemode: the clothes are top and the staff know how to make you feel at ease, both in suggesting what comes closest to what you're looking for and in pairing it with other pieces.",
      "rc.f5": "Marco Zanoletti · 4 years ago · 5 stars",
      "o.eti": "Where and when",
      "o.t": "Via Giambellino 79.",
      "o.lun": "Monday",
      "o.mar": "Tuesday",
      "o.mer": "Wednesday",
      "o.gio": "Thursday",
      "o.ven": "Friday",
      "o.sab": "Saturday",
      "o.dom": "Sunday",
      "o.chiuso": "closed",
      "o.ind": "Address",
      "o.indv": "Via Giambellino 79, 20146 Milan (Giambellino)",
      "o.tel": "Phone and WhatsApp",
      "o.pag": "Payments",
      "o.pagv": "Credit and debit cards, contactless",
      "o.acc": "Accessibility",
      "o.accv": "Wheelchair-accessible entrance",
      "o.btn": "Directions",
      "o.wa": "Message us on WhatsApp",
      "o.fotoz": "Enlarge the daytime photo of the shop window",
      "o.fotoa": "The black FREEMODE sign with white letters above the two shop windows, in daylight",
      "o.fotof": "Look for this sign",
      "o.mappa": "Map: Freemode Milano, Via Giambellino 79, Milan",
      "q.eti": "Questions",
      "q.t": "Before you message us.",
      "q.1t": "Can I order without coming to the shop?",
      "q.1p": "Yes: message us on Instagram or WhatsApp. We'll send you photos, tell you what's in your size and ship it to you.",
      "q.2t": "How do I choose the size without trying it on?",
      "q.2p": "Ask us: we'll tell you how the piece fits and which size to take.",
      "q.3t": "Do you do gift cards?",
      "q.3p": "Yes: DM us on Instagram and we'll prepare it.",
      "q.4t": "When do new arrivals come in?",
      "q.4p": "All the time. We post them on Instagram: in our story highlights you'll find them month by month.",
      "q.5t": "Do you have womenswear too?",
      "q.5p": "A little, but we're mostly menswear: ask us what's in right now.",
      "q.6t": "Is the shop accessible?",
      "q.6p": "Yes, the entrance is wheelchair accessible.",
      "q.7t": "How can I pay?",
      "q.7p": "In store by credit or debit card, contactless too.",
      "q.8t": "Which day are you closed?",
      "q.8p": "Sunday. On Mondays we open in the afternoon only.",
      "f.orari": "Monday 15:00–19:20 · Tuesday to Saturday 10:00–13:00 and 15:00–19:20 (Saturday until 19:30) · closed on Sunday",
      "f.cred": "Demo site by <a href=\"https://bespokestud.io\" rel=\"noopener\">Bespoke Studio</a> · texts from their Google listing and their Instagram profile; public reviews on Google (September 2026); photographs from the Google listing.",
      "x.nav": "Quick actions",
      "x.chiama": "Call",
      "x.mappa": "Map"
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  // ── FIRMA «la passerella» (#203 Freemode Milano) ──
  // I loro look sono fotografati sul marciapiede davanti alla vetrina: la pagina li mette in fila come su una passerella.
  // Stato finale nell'HTML/CSS: una striscia orizzontale che si scorre (scroll-snap); contatore e cordolo compaiono col JS.
  // Qui il contatore «Look 01 / 10» e il cordolo seguono la pista; da 900 px in su, con GSAP e senza reduced-motion, la scena
  // si BLOCCA (pin) e la pista scorre in orizzontale con lo scroll verticale (scrub). A fine pista il cartello gira in basso.
  var scena = document.querySelector('[data-passerella]');
  var pista = scena && scena.querySelector('[data-pista]');
  var looks = pista ? Array.prototype.slice.call(pista.querySelectorAll('[data-look]')) : [];
  var numero = scena && scena.querySelector('[data-look-n]');
  var cordolo = scena && scena.querySelector('[data-cordolo]');
  var dueCifre = function (n) { return (n < 10 ? '0' : '') + n; };
  var ultimo = -1;
  var segna = function (i, p) {
    p = Math.max(0, Math.min(1, p));
    if (cordolo) cordolo.style.transform = 'scaleX(' + (0.06 + 0.94 * p).toFixed(4) + ')';
    scena.classList.toggle('a-fine', p > 0.985);
    if (i === ultimo) return;
    ultimo = i;
    if (numero) numero.textContent = 'Look ' + dueCifre(i + 1);
    looks.forEach(function (li, k) { li.classList.toggle('is-qui', k === i); });
  };
  // il look sotto il «punto di lettura», dato lo spostamento della pista (x ≤ 0): il punto va dal 12% all'88% della scena
  // con l'avanzamento p, così all'inizio conta il primo look e alla fine l'ultimo (col centro fisso partiva da «02»)
  var alCentro = function (x, p) {
    var mezzo = scena.clientWidth * (0.12 + 0.76 * p), meglio = 0, dist = Infinity;
    looks.forEach(function (li, k) {
      var d = Math.abs(li.offsetLeft + li.offsetWidth / 2 + x - mezzo);
      if (d < dist) { dist = d; meglio = k; }
    });
    return meglio;
  };
  var nativo = function () {
    if (!scena || scena.classList.contains('is-pinned')) return;
    var max = pista.scrollWidth - pista.clientWidth;
    var p = max > 0 ? pista.scrollLeft / max : 0;
    segna(alCentro(-pista.scrollLeft, p), p);
  };
  if (scena && pista && looks.length) {
    scena.setAttribute('data-attiva', '');
    var inCoda = false;
    pista.addEventListener('scroll', function () {
      if (inCoda) return;
      inCoda = true;
      requestAnimationFrame(function () { inCoda = false; nativo(); });
    }, { passive: true });
    window.addEventListener('resize', nativo);
    // la scena non deve mai scorrere di lato da sola (il focus su un look fuori vista la faceva scorrere, se overflow:hidden)
    scena.addEventListener('scroll', function () { if (scena.scrollLeft) scena.scrollLeft = 0; });
    nativo();
    if (hasST && !reducedMotion) {
      gsap.matchMedia().add('(min-width: 900px)', function () {
        scena.classList.add('is-pinned');
        pista.scrollLeft = 0;
        var corsa = function () { return Math.max(0, pista.scrollWidth - scena.clientWidth); };
        // contatore e cordolo si aggiornano a ogni passo della TWEEN, non dello scroll: con lo scrub la pista arriva dopo lo scroll,
        // e aggiornando sullo scroll il contatore restava indietro (a metà pista diceva «Look 02»: preso da _fm_passerella_check)
        var tw = gsap.to(pista, {
          x: function () { return -corsa(); },
          ease: 'none',
          onUpdate: function () {
            var x = gsap.getProperty(pista, 'x'), c = corsa();
            var p = c ? Math.max(0, Math.min(1, -x / c)) : 0;
            segna(alCentro(x, p), p);
          },
          scrollTrigger: {
            trigger: scena, start: 'top top', end: function () { return '+=' + corsa(); },
            pin: true, scrub: 0.4, invalidateOnRefresh: true, anticipatePin: 1
          }
        });
        var st = tw.scrollTrigger;
        ultimo = -1;
        segna(0, 0);
        // da tastiera: il look che prende il focus viene portato al centro della scena
        var alFocus = function (e) {
          var li = e.target.closest ? e.target.closest('.look') : null;
          if (!li || !st) return;
          var c = li.offsetLeft + li.offsetWidth / 2 - scena.clientWidth / 2;
          var p = Math.max(0, Math.min(1, c / (corsa() || 1)));
          window.scrollTo(0, st.start + p * (st.end - st.start));
        };
        pista.addEventListener('focusin', alFocus);
        return function () {
          pista.removeEventListener('focusin', alFocus);
          scena.classList.remove('is-pinned');
          gsap.set(pista, { clearProps: 'transform' });
          ultimo = -1;
          nativo();
        };
      });
    }
  }
  // entrata dell'insegna: le lettere salgono sul cordolo, il tratto blu si allunga, poi motto e vetrina
  window.bespokeHeroEntrance = function () {
    if (!hasGsap || reducedMotion) return;
    gsap.from('.nome__l', { yPercent: 108, duration: 0.9, ease: 'power3.out', stagger: 0.045, clearProps: 'transform' });
    gsap.from('.insegna__cordolo i', { scaleX: 0, transformOrigin: '0% 50%', duration: 1.1, delay: 0.35, ease: 'power2.inOut', clearProps: 'transform' });
    gsap.from('.insegna__sotto > *', { opacity: 0, y: 24, duration: 0.8, delay: 0.5, stagger: 0.12, ease: 'power2.out', clearProps: 'opacity,transform' });
  };
})();
