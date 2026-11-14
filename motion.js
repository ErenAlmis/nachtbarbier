// Bewegung: Hero-Video, Parallax, Enthüllen beim Scrollen, Fotos am Zeiger.
// Alles langsam und ruhig. Bei "Bewegung reduzieren" bleibt alles still und sofort sichtbar.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;

  // ---------- 1. Hero-Video ----------
  // Lädt assets/hero.mp4 nur, wenn die Datei existiert und Bewegung erwünscht ist.
  const video = document.querySelector(".hero-video");
  const toggle = document.getElementById("videoToggle");
  if (video && !reduce) {
    fetch("assets/hero.mp4", { method: "HEAD" }).then((r) => {
      if (!r.ok || root.classList.contains("seq-razor")) return;
      video.src = "assets/hero.mp4";
      video.hidden = false;
      video.addEventListener("playing", () => video.classList.add("is-playing"), { once: true });
      video.play().catch(() => {}); // Autoplay kann blockiert sein; dann bleibt das Foto
      toggle.hidden = false;
    }).catch(() => {});
    toggle.addEventListener("click", () => {
      const pause = !video.paused;
      if (pause) video.pause(); else video.play();
      toggle.setAttribute("aria-pressed", pause);
      toggle.textContent = pause ? "Video abspielen" : "Video anhalten";
    });
    // Unsichtbar? Dann nicht abspielen (spart Akku und Daten)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) video.pause();
      else if (toggle.getAttribute("aria-pressed") !== "true" && video.src) video.play().catch(() => {});
    });
  }

  if (reduce) return;
  root.classList.add("motion");

  // ---------- 2a. Parallax im Hero ----------
  const hero = document.querySelector(".hero");
  const media = document.querySelector(".hero-media");
  let ticking = false;
  function parallax() {
    ticking = false;
    if (root.classList.contains("seq-razor")) return; // Bildfolge aktiv: kein Parallax
    const h = hero.offsetHeight;
    const y = Math.min(window.scrollY, h);
    media.style.transform = `translate3d(0, ${(y * 0.28).toFixed(1)}px, 0) scale(${(1.06 + y / h * 0.04).toFixed(4)})`;
  }
  window.addEventListener("scroll", () => {
    if (!ticking && window.scrollY < hero.offsetHeight + 100) { ticking = true; requestAnimationFrame(parallax); }
  }, { passive: true });
  parallax();

  // ---------- 2b. Fotos öffnen sich wie ein Vorhang ----------
  if ("IntersectionObserver" in window) {
    const photos = document.querySelectorAll(".photo");
    photos.forEach((p) => p.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    // threshold 0: Ein per clip-path verdecktes Foto hat sichtbare Fläche 0,
    // ein höherer Schwellenwert würde deshalb nie erreicht.
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0 });
    photos.forEach((p) => io.observe(p));
  }

  // ---------- 3. Foto folgt dem Zeiger in der Preisliste ----------
  if (!finePointer) return;
  const D = window.NB;
  const follower = document.createElement("div");
  follower.className = "cursor-photo";
  follower.setAttribute("aria-hidden", "true");
  document.body.appendChild(follower);

  // Nur Fotos verwenden, die wirklich existieren
  const ready = {};
  D.services.forEach((s) => {
    if (!s.img) return;
    const i = new Image();
    i.onload = () => { ready[s.id] = s.img; };
    i.src = s.img;
  });

  const pos = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  let raf = 0, active = false;
  function follow() {
    pos.x += (target.x - pos.x) * 0.14;
    pos.y += (target.y - pos.y) * 0.14;
    follower.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
    raf = active || Math.abs(target.x - pos.x) > 0.5 ? requestAnimationFrame(follow) : 0;
  }

  const list = document.getElementById("priceList");
  const rows = list.querySelectorAll(".price-row");
  rows.forEach((row, i) => {
    const s = D.services[i];
    row.addEventListener("pointerenter", (e) => {
      const src = s && ready[s.id];
      if (!src) return;
      follower.style.backgroundImage = `url("${src}")`;
      if (!active) { pos.x = target.x = e.clientX + 28; pos.y = target.y = e.clientY - 120; }
      active = true;
      follower.classList.add("is-on");
      row.classList.add("is-hovered");
      if (!raf) raf = requestAnimationFrame(follow);
    });
    row.addEventListener("pointerleave", () => {
      row.classList.remove("is-hovered");
    });
  });
  list.addEventListener("pointermove", (e) => { target.x = e.clientX + 28; target.y = e.clientY - 120; });
  list.addEventListener("pointerleave", () => { active = false; follower.classList.remove("is-on"); });
  window.addEventListener("scroll", () => { if (active) { active = false; follower.classList.remove("is-on"); } }, { passive: true });
})();
