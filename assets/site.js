/* ===================================================================
   Yorkshire Resin Drives — shared behaviour
   Every feature guards on the presence of its markup, so one file
   safely drives every page.
   =================================================================== */
(function () {
  'use strict';

  /* ---------- NAV ---------- */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  if (nav) {
    var solidByDefault = nav.classList.contains('solid');
    if (!solidByDefault) {
      var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 40); };
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    if (burger) {
      burger.addEventListener('click', function () { nav.classList.toggle('open'); });
      document.querySelectorAll('.mobile-menu a').forEach(function (a) {
        a.addEventListener('click', function () { nav.classList.remove('open'); });
      });
    }
  }

  /* ---------- HERO SLIDER ---------- */
  (function () {
    var slides = [].slice.call(document.querySelectorAll('.hero .slide'));
    var dotsWrap = document.getElementById('dots');
    if (slides.length < 2 || !dotsWrap) return;
    var i = 0, t;
    slides.forEach(function (_, n) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Show slide ' + (n + 1));
      b.addEventListener('click', function () { go(n); });
      dotsWrap.appendChild(b);
    });
    var dots = [].slice.call(dotsWrap.children);
    function paint() {
      slides.forEach(function (s, n) { s.classList.toggle('active', n === i); });
      dots.forEach(function (d, n) { d.classList.toggle('on', n === i); });
    }
    function go(n) { i = (n + slides.length) % slides.length; paint(); reset(); }
    function reset() { clearInterval(t); t = setInterval(function () { go(i + 1); }, 6000); }
    paint(); reset();
  })();

  /* ---------- BEFORE / AFTER SLIDERS (all on page) ---------- */
  document.querySelectorAll('.ba').forEach(function (ba) {
    var before = ba.getAttribute('data-before');
    var after = ba.getAttribute('data-after');
    var bLayer = ba.querySelector('.ba-before');
    var aLayer = ba.querySelector('.ba-after');
    if (before && bLayer) bLayer.style.backgroundImage = 'url("' + before + '")';
    if (after && aLayer) aLayer.style.backgroundImage = 'url("' + after + '")';
    var divide = ba.querySelector('.ba-divide');
    var handle = ba.querySelector('.ba-handle');
    var dragging = false;
    function setPos(clientX) {
      var r = ba.getBoundingClientRect();
      var pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      if (aLayer) aLayer.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      if (divide) divide.style.left = pct + '%';
      if (handle) handle.style.left = pct + '%';
    }
    var start = function (e) { dragging = true; setPos((e.touches ? e.touches[0] : e).clientX); };
    var move = function (e) { if (dragging) setPos((e.touches ? e.touches[0] : e).clientX); };
    var end = function () { dragging = false; };
    ba.addEventListener('mousedown', start);
    ba.addEventListener('touchstart', start, { passive: true });
    addEventListener('mousemove', move);
    ba.addEventListener('touchmove', move, { passive: true });
    addEventListener('mouseup', end);
    ba.addEventListener('touchend', end);
    ba.addEventListener('click', function (e) { if (!dragging) setPos(e.clientX); });
  });

  /* ---------- TRANSFORMATION VIDEOS (muted autoplay in view) ---------- */
  (function () {
    var vids = document.querySelectorAll('.tv-vid');
    if (!vids.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: .35 });
    vids.forEach(function (v) { v.muted = true; io.observe(v); });
  })();

  /* ---------- GALLERY LIGHTBOX ---------- */
  (function () {
    var lb = document.getElementById('lb');
    if (!lb) return;
    var img = document.getElementById('lbimg');
    document.querySelectorAll('[data-full]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        img.src = a.getAttribute('data-full');
        img.alt = a.getAttribute('data-alt') || '';
        lb.classList.add('open');
      });
    });
    var close = function () { lb.classList.remove('open'); };
    var x = document.getElementById('lbx');
    if (x) x.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  })();

  /* ---------- FAQ ACCORDION ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var open = item.classList.contains('open');
      if (open) { item.classList.remove('open'); a.style.maxHeight = null; }
      else { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* ---------- CONTACT / QUOTE FORM ---------- */
  (function () {
    var form = document.getElementById('quoteForm');
    if (!form) return;
    var msg = form.querySelector('.form-msg');
    var btn = form.querySelector('[type="submit"]');
    var email = form.getAttribute('data-email') || '';
    var key = (form.querySelector('input[name="access_key"]') || {}).value || '';
    var keyOk = key && key.indexOf('REPLACE') === -1;

    function show(type, text) {
      if (!msg) return;
      msg.className = 'form-msg ' + type;
      msg.textContent = text;
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function val(name) { var el = form.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ''; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('[name="botcheck"]') && form.querySelector('[name="botcheck"]').checked) return;
      var name = val('name'), phone = val('phone');
      if (!name || !phone) { show('err', 'Please add your name and phone number so we can get back to you.'); return; }

      /* Fallback: no Web3Forms key set yet -> open the visitor's email client */
      if (!keyOk) {
        var body = 'Name: ' + name + '%0D%0APhone: ' + phone +
          '%0D%0AEmail: ' + val('email') +
          '%0D%0AArea / postcode: ' + val('area') +
          '%0D%0AService: ' + val('service') +
          '%0D%0ADetails: ' + val('message');
        window.location.href = 'mailto:' + email + '?subject=' +
          encodeURIComponent('Website quote request — ' + name) + '&body=' + body;
        show('ok', 'Opening your email app with the details ready to send. Prefer to talk? Call us any time.');
        return;
      }

      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      }).then(function (r) { return r.json(); }).then(function (data) {
        if (data.success) { form.reset(); show('ok', 'Thank you — your request has been sent. We\'ll be in touch shortly.'); }
        else { show('err', 'Sorry, something went wrong. Please call or email us instead.'); }
      }).catch(function () {
        show('err', 'Sorry, something went wrong. Please call or email us instead.');
      }).finally(function () {
        if (btn) { btn.disabled = false; if (btn.dataset.label) btn.textContent = btn.dataset.label; }
      });
    });
  })();

  /* ---------- REVEAL ON SCROLL ---------- */
  (function () {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- CURRENT YEAR ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
