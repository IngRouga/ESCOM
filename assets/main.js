/* ==========================================================================
   ESCOM Niger — Scripts du site (aucune librairie externe)
   Numéro WhatsApp utilisé par les formulaires : modifier WHATSAPP ci-dessous.
   ========================================================================== */
(function () {
  "use strict";

  var WHATSAPP = "22780323233";
  var PHONE_DISPLAY = "+227 80 32 32 33";
  var EMAIL = "escomniger1@gmail.com";
  var YEAR = "2026–2027";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var wa = function (msg) { return "https://wa.me/" + WHATSAPP + (msg ? "?text=" + encodeURIComponent(msg) : ""); };

  /* ---------- En-tête au défilement ---------- */
  var header = $(".header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 12); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  var menu = $("#mobile-menu");
  var burger = $(".burger");
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("menu-open", open);
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { var c = $(".close-btn", menu); if (c) c.focus(); } else if (burger) burger.focus();
  }
  if (burger) burger.addEventListener("click", function () { setMenu(true); });
  $$("[data-close-menu]").forEach(function (b) { b.addEventListener("click", function () { setMenu(false); }); });
  $$("#mobile-menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  $$(".mobile-nav li").forEach(function (li, i) { li.style.transitionDelay = 80 + i * 40 + "ms"; });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu && menu.classList.contains("open")) setMenu(false); });

  /* ---------- Apparition au défilement ---------- */
  function revealAll() { $$(".reveal, .reveal-img, .board").forEach(function (el) { el.classList.add("is-visible"); }); }
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target.__revealTarget || e.target;
        el.classList.add("is-visible");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    $$(".reveal, .board").forEach(function (el) { io.observe(el); });
    // Une image masquée (clip-path) n'a pas de surface visible : on observe son parent.
    $$(".reveal-img").forEach(function (el) {
      var p = el.parentElement || el;
      p.__revealTarget = el;
      io.observe(p);
    });
  }

  /* ---------- Compteurs animés ---------- */
  function animateCount(el) {
    var to = parseInt(el.getAttribute("data-count"), 10);
    var from = parseInt(el.getAttribute("data-from") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1500, start = null;
    function step(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur);
      var v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$("[data-count]");
  if (!reduceMotion && "IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Onglets (filière logistique) ---------- */
  $$("[data-tabs]").forEach(function (box) {
    var tabs = $$("[role=tab]", box);
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", on ? "true" : "false");
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
      });
    });
  });

  /* ---------- Galerie : filtres + visionneuse ---------- */
  $$("[data-gallery]").forEach(function (wrap) {
    var items = $$(".gallery li", wrap);
    var filters = $$(".filter", wrap);
    filters.forEach(function (f) {
      f.addEventListener("click", function () {
        var cat = f.getAttribute("data-filter");
        filters.forEach(function (x) { x.setAttribute("aria-pressed", x === f ? "true" : "false"); });
        items.forEach(function (li, i) {
          var show = cat === "Tout" || (li.getAttribute("data-cats") || "").split("|").indexOf(cat) > -1;
          li.hidden = !show;
          if (show) { li.style.animation = "none"; li.offsetHeight; li.style.animation = "fade-up .6s var(--ease) " + i * 40 + "ms both"; }
        });
      });
    });

    var lb, current = 0, visible = [], lastBtn = null;
    function visibleItems() { return items.filter(function (li) { return !li.hidden; }); }
    function render() {
      var li = visible[current], img = $("img", li);
      $(".lb-count", lb).textContent = current + 1 + " / " + visible.length;
      var big = $(".lb-stage img", lb);
      big.src = img.src; big.alt = img.alt;
      big.style.animation = "none"; big.offsetHeight; big.style.animation = "";
      $(".lb-cap", lb).textContent = li.getAttribute("data-caption");
      lb.setAttribute("aria-label", li.getAttribute("data-caption"));
    }
    function go(d) { current = (current + d + visible.length) % visible.length; render(); }
    function close() { lb.remove(); lb = null; document.body.classList.remove("menu-open"); document.removeEventListener("keydown", onKey); if (lastBtn) lastBtn.focus(); }
    function onKey(e) { if (e.key === "Escape") close(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }
    function open(li, btn) {
      visible = visibleItems(); current = visible.indexOf(li); lastBtn = btn;
      lb = document.createElement("div");
      lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
      lb.innerHTML =
        '<div class="lb-top"><span class="lb-count"></span><button type="button" class="lb-btn lb-close" aria-label="Fermer">' + ICON_X + "</button></div>" +
        '<div class="lb-stage"><img alt=""><button type="button" class="lb-btn lb-prev" aria-label="Photo précédente">' + ICON_L + '</button><button type="button" class="lb-btn lb-next" aria-label="Photo suivante">' + ICON_R + "</button></div>" +
        '<p class="lb-cap"></p>';
      document.body.appendChild(lb);
      document.body.classList.add("menu-open");
      $(".lb-close", lb).addEventListener("click", close);
      $(".lb-prev", lb).addEventListener("click", function () { go(-1); });
      $(".lb-next", lb).addEventListener("click", function () { go(1); });
      lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-stage")) close(); });
      var x0 = null;
      lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener("touchend", function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); x0 = null; });
      document.addEventListener("keydown", onKey);
      render();
      $(".lb-close", lb).focus();
    }
    items.forEach(function (li) {
      var btn = $("button", li);
      btn.addEventListener("click", function () { open(li, btn); });
    });
  });
  var ICON_X = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var ICON_L = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg>';
  var ICON_R = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg>';

  /* ---------- Liste des formations : filtre par niveau + recherche ---------- */
  var explorer = $("[data-explorer]");
  if (explorer) {
    var cards = $$("[data-group]", explorer);
    var fbtns = $$(".filter", explorer);
    var input = $("input[type=search]", explorer);
    var countEl = $(".result-count", explorer);
    var empty = $(".empty", explorer);
    var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); };
    var params = new URLSearchParams(location.search);
    var group = params.get("niveau") || "tous";
    if (!$('.filter[data-filter="' + group + '"]', explorer)) group = "tous";

    function apply() {
      var q = norm(input.value.trim()), n = 0;
      fbtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filter") === group ? "true" : "false"); });
      cards.forEach(function (c) {
        var ok = (group === "tous" || c.getAttribute("data-group") === group) && (!q || norm(c.getAttribute("data-search")).indexOf(q) > -1);
        c.hidden = !ok; if (ok) n++;
      });
      countEl.textContent = n + (n > 1 ? " filières" : " filière");
      empty.hidden = n > 0;
      $(".q", empty).textContent = input.value;
    }
    fbtns.forEach(function (b) {
      b.addEventListener("click", function () {
        group = b.getAttribute("data-filter");
        var url = group === "tous" ? location.pathname : location.pathname + "?niveau=" + group;
        history.replaceState(null, "", url + location.hash);
        apply();
      });
    });
    input.addEventListener("input", apply);
    $("button", empty).addEventListener("click", function () { input.value = ""; apply(); input.focus(); });
    apply();
  }

  /* ---------- Formulaires ---------- */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var phoneRe = /^[+0-9 ().-]{8,20}$/;

  function setError(form, name, msg) {
    var input = form.elements[name];
    if (!input) return;
    var field = input.closest(".field");
    var err = $(".err", field);
    var hint = $(".hint", field);
    if (msg) {
      input.setAttribute("aria-invalid", "true");
      if (!err) { err = document.createElement("p"); err.className = "err"; err.id = input.id + "-err"; err.setAttribute("role", "alert"); field.appendChild(err); }
      err.textContent = msg;
      input.setAttribute("aria-describedby", err.id);
      if (hint) hint.hidden = true;
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      if (err) err.remove();
      if (hint) hint.hidden = false;
    }
  }
  function val(form, n) { return form.elements[n] ? form.elements[n].value.trim() : ""; }
  function bindClear(form) {
    $$("input, select, textarea", form).forEach(function (el) {
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid")) setError(form, el.name, ""); });
    });
  }
  function showErrors(form, errors) {
    var first = null;
    Object.keys(errors).forEach(function (k) { setError(form, k, errors[k]); if (!first) first = k; });
    if (first) form.elements[first].focus();
    return !first;
  }

  // Préinscription
  var pre = $("#form-preinscription");
  if (pre) {
    bindClear(pre);
    var fParam = new URLSearchParams(location.search).get("formation");
    if (fParam) {
      var opt = $('option[data-slug="' + fParam + '"]', pre);
      if (opt) pre.elements.formation.value = opt.value;
    }
    pre.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = {};
      ["nom", "prenom", "telephone", "email", "naissance", "niveau", "formation", "ville", "message"].forEach(function (k) { d[k] = val(pre, k); });
      var err = {};
      ["nom", "prenom", "telephone", "email", "naissance", "niveau", "formation", "ville"].forEach(function (k) { setError(pre, k, ""); });
      if (!d.nom) err.nom = "Indiquez votre nom.";
      if (!d.prenom) err.prenom = "Indiquez votre prénom.";
      if (!d.telephone) err.telephone = "Indiquez un numéro de téléphone.";
      else if (!phoneRe.test(d.telephone)) err.telephone = "Ce numéro ne semble pas valide. Exemple : +227 80 32 32 33";
      if (d.email && !emailRe.test(d.email)) err.email = "Cette adresse email ne semble pas valide.";
      if (!d.naissance) err.naissance = "Indiquez votre date de naissance.";
      if (!d.niveau) err.niveau = "Choisissez le niveau souhaité.";
      if (!d.formation) err.formation = "Choisissez la formation souhaitée.";
      if (!d.ville) err.ville = "Indiquez votre ville.";
      if (!showErrors(pre, err)) return;

      var msg = [
        "Bonjour ESCOM, je souhaite me préinscrire pour l'année " + YEAR + ".",
        "Nom : " + d.nom, "Prénom : " + d.prenom, "Téléphone : " + d.telephone,
        d.email ? "Email : " + d.email : "", "Date de naissance : " + d.naissance,
        "Niveau souhaité : " + d.niveau, "Formation souhaitée : " + d.formation, "Ville : " + d.ville,
        d.message ? "Message : " + d.message : ""
      ].filter(Boolean).join("\n");
      var mail = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Préinscription " + YEAR + " – " + d.prenom + " " + d.nom) + "&body=" + encodeURIComponent(msg);

      var box = document.createElement("div");
      box.className = "success"; box.setAttribute("role", "status"); box.setAttribute("tabindex", "-1");
      box.innerHTML =
        '<span class="success-ico">' + ICON_OK + "</span>" +
        "<h3>Votre demande est prête</h3>" +
        "<p>Merci " + esc(d.prenom) + ". Pour transmettre votre préinscription au service d’admission, envoyez-la sur WhatsApp : le message est déjà rédigé avec vos informations.</p>" +
        '<div class="btn-row"><a class="btn btn-whatsapp" target="_blank" rel="noopener" href="' + wa(msg) + '">' + ICON_WA + " Envoyer ma demande sur WhatsApp</a>" +
        '<a class="btn btn-outline" href="tel:+' + WHATSAPP + '">Appeler le ' + PHONE_DISPLAY + "</a></div>" +
        '<a class="alt" href="' + mail + '">ou l’envoyer par email</a>';
      pre.replaceWith(box);
      box.focus();
    });
  }

  // Contact
  var ct = $("#form-contact");
  if (ct) {
    bindClear(ct);
    ct.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = { nom: val(ct, "nom"), telephone: val(ct, "telephone"), email: val(ct, "email"), sujet: val(ct, "sujet"), message: val(ct, "message") };
      ["nom", "telephone", "email", "message"].forEach(function (k) { setError(ct, k, ""); });
      var err = {};
      if (!d.nom) err.nom = "Indiquez votre nom.";
      if (!d.telephone && !d.email) err.telephone = "Laissez au moins un téléphone ou un email pour être recontacté(e).";
      else if (d.telephone && !phoneRe.test(d.telephone)) err.telephone = "Ce numéro ne semble pas valide.";
      if (d.email && !emailRe.test(d.email)) err.email = "Cette adresse email ne semble pas valide.";
      if (!d.message) err.message = "Écrivez votre message.";
      if (!showErrors(ct, err)) return;

      var msg = "Bonjour ESCOM,\n" + (d.sujet ? "Sujet : " + d.sujet + "\n" : "") + d.message + "\n\n" + d.nom + (d.telephone ? " – " + d.telephone : "") + (d.email ? " – " + d.email : "");
      var mail = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Message du site – " + (d.sujet || "Contact")) + "&body=" + encodeURIComponent(msg);
      var box = document.createElement("div");
      box.className = "success"; box.setAttribute("role", "status"); box.setAttribute("tabindex", "-1");
      box.innerHTML =
        '<span class="success-ico">' + ICON_OK + "</span><h3>Votre message est prêt</h3>" +
        "<p>Envoyez-le sur WhatsApp ou par email pour qu’il parvienne directement à l’équipe d’ESCOM.</p>" +
        '<div class="btn-row"><a class="btn btn-whatsapp" target="_blank" rel="noopener" href="' + wa(msg) + '">' + ICON_WA + ' Envoyer sur WhatsApp</a><a class="btn btn-outline" href="' + mail + '">Envoyer par email</a></div>';
      ct.replaceWith(box);
      box.focus();
    });
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>';
  var ICON_WA = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 20.5l1.3-4.1A8.5 8.5 0 1 1 8 19.6l-4.5.9z"/></svg>';
})();
