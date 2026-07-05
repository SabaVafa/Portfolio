// Saba Vafakhah — portfolio interactions

(function () {
  "use strict";

  // ---- Page-load intro ----
  var intro = document.getElementById("intro");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function revealSite() {
    if (document.body.classList.contains("loaded")) return;
    document.body.classList.add("loaded");
    if (intro) {
      intro.classList.add("intro--out");
      setTimeout(function () { if (intro && intro.parentNode) intro.parentNode.removeChild(intro); }, 1050);
    }
  }
  if (reduceMotion || !intro) {
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    document.body.classList.add("loaded");
  } else {
    window.addEventListener("load", function () { setTimeout(revealSite, 1500); });
    setTimeout(revealSite, 3200); // hard fallback if 'load' never fires
  }

  // ---- Custom cursor ----
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !reduceMotion) {
    var ring = document.createElement("div"); ring.className = "cur";
    var dot = document.createElement("div"); dot.className = "cur-dot";
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.body.classList.add("cursor-on");

    var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my, shown = false;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0) translate(-50%,-50%)";
      if (!shown) { shown = true; ring.classList.add("is-shown"); dot.classList.add("is-shown"); }
    });
    document.addEventListener("mouseleave", function () { ring.classList.remove("is-shown"); dot.classList.remove("is-shown"); shown = false; });
    document.addEventListener("mousedown", function () { ring.classList.add("is-down"); });
    document.addEventListener("mouseup", function () { ring.classList.remove("is-down"); });

    var hoverSel = "a, button, .case--feature, .lang__btn, .nav__burger, .case__media";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) { ring.classList.add("is-hover"); dot.classList.add("is-hover"); }
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(hoverSel) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(hoverSel))) {
        ring.classList.remove("is-hover"); dot.classList.remove("is-hover");
      }
    });

    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = "translate3d(" + rx.toFixed(2) + "px," + ry.toFixed(2) + "px,0) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
  }

  // ---- Bilingual toggle (EN / DE) ----
  var langButtons = document.querySelectorAll(".lang__btn");
  function setLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-" + lang + "]").forEach(function (el) {
      var val = el.getAttribute("data-" + lang);
      if (val !== null) el.innerHTML = val;
    });
    langButtons.forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
    });
    try { localStorage.setItem("sv-lang", lang); } catch (e) {}
  }
  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(btn.getAttribute("data-lang")); });
  });
  var saved = "en";
  try { saved = localStorage.getItem("sv-lang") || "en"; } catch (e) {}
  if (saved === "de") setLang("de");

  // ---- Footer year ----
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ---- Mouse-follow spotlight ----
  var hero = document.querySelector(".hero");
  var spot = document.getElementById("spot");
  if (hero && spot) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
      var yy = ((e.clientY - r.top) / r.height * 100).toFixed(1);
      spot.style.setProperty("--mx", x + "%");
      spot.style.setProperty("--my", yy + "%");
    });
  }

  // ---- Magnetic buttons ----
  document.querySelectorAll(".mag").forEach(function (b) {
    b.addEventListener("mousemove", function (e) {
      var r = b.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) / r.width * 14;
      var yy = (e.clientY - r.top - r.height / 2) / r.height * 14;
      b.style.transform = "translate(" + x.toFixed(1) + "px," + yy.toFixed(1) + "px)";
    });
    b.addEventListener("mouseleave", function () { b.style.transform = "translate(0,0)"; });
  });

  // ---- Tilt on hover ----
  document.querySelectorAll(".tilt").forEach(function (c) {
    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect();
      var rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
      var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
      c.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
    });
    c.addEventListener("mouseleave", function () {
      c.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
    });
  });

  // ---- Expandable case studies ----
  document.querySelectorAll(".case__toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var wrap = btn.closest(".case-wrap");
      if (!wrap) return;
      var open = wrap.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  // ---- Scroll reveal ----
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // ---- Mobile nav toggle ----
  var burger = document.getElementById("burger");
  var links = document.querySelector(".nav__links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.style.display === "flex";
      links.style.cssText = open ? "" :
        "display:flex;position:absolute;flex-direction:column;top:62px;right:var(--pad);background:var(--ink-2);padding:16px 20px;border-radius:12px;border:1px solid var(--line-2);gap:14px;";
    });
  }
})();
