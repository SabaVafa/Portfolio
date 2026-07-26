// Saba Vafakhah — Portfolio v2 (premium motion: Lenis smooth scroll + GSAP ScrollTrigger)
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var forceStatic = location.search.indexOf("static") > -1;   // ?static = no motion, everything visible (debug)

  /* ---------- Bilingual + year ---------- */
  var langButtons = document.querySelectorAll(".vlang__btn");
  function setLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-" + lang + "]").forEach(function (el) {
      var v = el.getAttribute("data-" + lang); if (v !== null) el.innerHTML = v;
    });
    langButtons.forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-lang") === lang); });
    try { localStorage.setItem("sv-lang", lang); } catch (e) {}
    splitHero();
  }
  function splitHero() {
    document.querySelectorAll(".vhero__title span[data-en], .vhero__title span[data-de]").forEach(function (line) {
      if (line.classList.contains("grad")) return;   // keep gradient line intact (splitting breaks the text-clip)
      if (line.querySelector(".word")) return;
      var words = line.textContent.trim().split(/\s+/);
      line.innerHTML = words.map(function (w) { return '<span class="word">' + w + "</span>"; }).join(" ");
    });
  }
  var savedLang = "en"; try { savedLang = localStorage.getItem("sv-lang") || "en"; } catch (e) {}
  langButtons.forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); }); });
  setLang(savedLang);
  var yEl = document.getElementById("vyear"); if (yEl) yEl.textContent = new Date().getFullYear();

  var progress = document.getElementById("vprogress");

  /* ---------- Custom cursor (shared) ---------- */
  function initCursor() {
    if (!fine || reduce) return;
    var ring = document.createElement("div"); ring.className = "vcur";
    var label = document.createElement("span"); label.className = "vcur__label"; label.textContent = "View ↗"; ring.appendChild(label);
    var dot = document.createElement("div"); dot.className = "vcur-dot";
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.body.classList.add("cursor-on");
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, shown = false;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0) translate(-50%,-50%)";
      if (!shown) { shown = true; ring.classList.add("is-shown"); dot.classList.add("is-shown"); }
    });
    document.addEventListener("mouseover", function (e) {
      if (!e.target.closest) return;
      if (e.target.closest(".vcase__media")) { ring.classList.add("is-media"); dot.classList.add("is-hover"); }
      else if (e.target.closest("a, button, .vlang__btn")) { ring.classList.add("is-hover"); dot.classList.add("is-hover"); }
    });
    document.addEventListener("mouseout", function (e) {
      if (!e.target.closest) return;
      var r = e.relatedTarget;
      if (!(r && r.closest && r.closest(".vcase__media"))) ring.classList.remove("is-media");
      if (!(r && r.closest && r.closest("a, button, .vlang__btn, .vcase__media"))) ring.classList.remove("is-hover");
    });
    (function loop() { rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = "translate3d(" + rx.toFixed(2) + "px," + ry.toFixed(2) + "px,0) translate(-50%,-50%)"; requestAnimationFrame(loop); })();
  }

  /* ---------- Magnetic buttons (shared) ---------- */
  function initMagnetic() {
    if (!fine || reduce) return;
    document.querySelectorAll(".mag").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width * 18;
        var yy = (e.clientY - r.top - r.height / 2) / r.height * 18;
        b.style.transform = "translate(" + x.toFixed(1) + "px," + yy.toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = "translate(0,0)"; });
    });
  }

  /* ---------- Fallback (no GSAP or reduced motion) ---------- */
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (!hasGSAP || reduce || forceStatic) {
    if (forceStatic) document.documentElement.classList.add("vstatic");
    var reveals = document.querySelectorAll(".reveal");
    if (forceStatic || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }); }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    }
    if (progress) {
      window.addEventListener("scroll", function () {
        var max = document.documentElement.scrollHeight - innerHeight;
        progress.style.width = (max > 0 ? scrollY / max * 100 : 0).toFixed(2) + "%";
      }, { passive: true });
    }
    initCursor(); initMagnetic();
    return;
  }

  /* ================= PREMIUM PATH (GSAP + Lenis) ================= */
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("gsap");

  /* Lenis smooth inertia scroll */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    lenis.on("scroll", function (e) { if (progress) progress.style.width = ((e.progress || 0) * 100).toFixed(2) + "%"; });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    // anchor links through Lenis
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); if (id.length > 1) { e.preventDefault(); lenis.scrollTo(id, { offset: -60 }); }
      });
    });
  }

  /* Hero intro timeline */
  var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".veyebrow", { y: 20, opacity: 0, duration: .6 })
    .from(".vhero__title .word, .vhero__title .grad", { yPercent: 120, opacity: 0, stagger: .028, duration: .9 }, "-=.3")
    .from(".vhero__lead", { y: 24, opacity: 0, duration: .7 }, "-=.55")
    .from(".vhero__cta", { y: 24, opacity: 0, duration: .7 }, "-=.55")
    .from(".vhero__photo", { clipPath: "inset(100% 0 0 0)", scale: 1.18, duration: 1.15, ease: "power4.out" }, "-=1.05")
    .from(".vhero__scroll", { opacity: 0, duration: .5 }, "-=.3");

  /* Layered parallax (waves, orb, big numbers, hero title) — scrubbed */
  document.querySelectorAll("[data-parallax]").forEach(function (el) {
    var sp = parseFloat(el.getAttribute("data-parallax")) || 0;
    if (el.tagName === "IMG" && el.closest(".vcase__media")) return;
    gsap.to(el, {
      yPercent: sp * 120, ease: "none",
      scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* Case media: clip-path reveal + scrubbed image drift + scale-in */
  gsap.utils.toArray(".vcase__media").forEach(function (frame) {
    var img = frame.querySelector("img");
    gsap.from(frame, { clipPath: "inset(0 0 100% 0)", duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: frame, start: "top 88%" } });
    if (img) {
      gsap.from(img, { scale: 1.25, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: frame, start: "top 88%" } });
      gsap.fromTo(img, { yPercent: 0 }, { yPercent: -18, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } });
    }
  });

  /* Case content: staggered reveal */
  gsap.utils.toArray(".vcase__content").forEach(function (c) {
    gsap.from(c.querySelectorAll(".vcase__tags, .vcase__title, .vcase__client, .vcase__summary, .vcase__points li, .vlink"),
      { y: 34, opacity: 0, duration: .85, stagger: .07, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 74%" } });
  });

  /* Section heads + about + timeline + contact */
  gsap.utils.toArray(".vsection-head").forEach(function (h) {
    gsap.from(h.children, { y: 30, opacity: 0, duration: .8, stagger: .1, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 82%" } });
  });
  gsap.from(".vabout__copy p", { y: 30, opacity: 0, duration: .9, stagger: .12, ease: "power3.out", scrollTrigger: { trigger: ".vabout__grid", start: "top 78%" } });
  gsap.from(".vfacts li", { y: 20, opacity: 0, duration: .7, stagger: .08, ease: "power3.out", scrollTrigger: { trigger: ".vfacts", start: "top 82%" } });
  gsap.utils.toArray(".vtl").forEach(function (li) {
    gsap.from(li, { y: 34, opacity: 0, duration: .8, ease: "power3.out", scrollTrigger: { trigger: li, start: "top 84%" } });
  });
  gsap.from(".vcontact__inner > *", { y: 30, opacity: 0, duration: .8, stagger: .1, ease: "power3.out", scrollTrigger: { trigger: ".vcontact", start: "top 74%" } });

  /* Velocity-reactive marquee */
  var track = document.querySelector(".vmarquee2__t");
  if (track) {
    track.style.animation = "none";
    var mq = gsap.to(track, { xPercent: -50, ease: "none", duration: 26, repeat: -1 });
    if (lenis) {
      lenis.on("scroll", function (e) {
        var v = e.velocity || 0;
        gsap.to(mq, { timeScale: 1 + gsap.utils.clamp(-5, 5, v / 6), duration: .4, overwrite: true });
      });
    }
  }

  initCursor(); initMagnetic();
  // Recompute trigger positions once fonts/images settle (prevents mis-fired reveals)
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  setTimeout(function () { ScrollTrigger.refresh(); }, 600);
})();
