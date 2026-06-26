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

  /* ---------- CONTACT / QUOTE FORM -> WhatsApp ---------- */
  (function () {
    var form = document.getElementById('quoteForm');
    if (!form) return;
    var msg = form.querySelector('.form-msg');
    var wa = form.getAttribute('data-wa') || '';
    function show(type, text) {
      if (!msg) return;
      msg.className = 'form-msg ' + type;
      msg.textContent = text;
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function val(name) { var el = form.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ''; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = form.querySelector('[name="botcheck"]');
      if (hp && hp.checked) return;
      var name = val('name'), phone = val('phone');
      if (!name || !phone) { show('err', 'Please add your name and phone number so we can get back to you.'); return; }
      var txt = 'Hi Yorkshire Resin Drives, I’d like a quote.\n\nName: ' + name + '\nPhone: ' + phone;
      if (val('email')) txt += '\nEmail: ' + val('email');
      if (val('area')) txt += '\nArea: ' + val('area');
      if (val('service')) txt += '\nService: ' + val('service');
      if (val('message')) txt += '\nDetails: ' + val('message');
      txt += '\n\n(Sent from your website)';
      window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(txt), '_blank');
      show('ok', 'Opening WhatsApp with your details ready to send — just press send. Prefer to call? Our number is above.');
      form.reset();
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

  /* ---------- REVIEWS SLIDER ---------- */
  document.querySelectorAll('.rev-slider').forEach(function (slider) {
    var track = slider.querySelector('.rev-track');
    if (!track || !track.children.length) return;
    var cards = [].slice.call(track.children);
    var prev = slider.querySelector('.rev-prev');
    var next = slider.querySelector('.rev-next');
    var dotsWrap = slider.querySelector('.rev-dots');
    var dots = [];
    function step() { return cards[0].getBoundingClientRect().width + 20; }
    function pages() { var per = Math.max(1, Math.round(track.clientWidth / step())); return Math.max(1, cards.length - per + 1); }
    function paint() {
      if (!dots.length) return;
      var idx = Math.round(track.scrollLeft / step());
      idx = Math.max(0, Math.min(dots.length - 1, idx));
      dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
    }
    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = ''; dots = [];
      for (var i = 0; i < pages(); i++) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'rev-dot'; b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        (function (idx) { b.addEventListener('click', function () { track.scrollTo({ left: idx * step(), behavior: 'smooth' }); restart(); }); })(i);
        dotsWrap.appendChild(b); dots.push(b);
      }
      paint();
    }
    /* auto-slide */
    var AUTO = 4500, timer = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function tick() {
      var atEnd = Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth - 4;
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step(), behavior: 'smooth' });
    }
    function start() { if (reduce || pages() < 2 || timer) return; timer = setInterval(tick, AUTO); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); setTimeout(start, 800); }

    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); restart(); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); restart(); });
    track.addEventListener('scroll', paint, { passive: true });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('touchstart', stop, { passive: true });
    slider.addEventListener('focusin', stop);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(buildDots, 200); });
    buildDots();
    start();
  });

  /* ---------- CURRENT YEAR ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
