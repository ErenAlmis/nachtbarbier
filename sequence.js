// Scroll-gesteuerte Bildfolgen (wie bei Apple-Produktseiten).
// Jedes Element mit data-seq="name" lädt assets/frames/<name>/manifest.json.
// Fehlt das Manifest, passiert nichts: Hero bleibt statisch, die Whisky-Szene bleibt verborgen.
// Bilder erzeugt make-frames.sh aus einem Video.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  document.querySelectorAll("[data-seq]").forEach(async (track) => {
    const name = track.dataset.seq;
    let base = `assets/frames/${name}/`;
    let meta;
    try {
      const r = await fetch(base + "manifest.json", { cache: "no-cache" });
      if (!r.ok) return;
      meta = await r.json();
      // Schmale Bildschirme: leichteres Bildset, falls vorhanden (spart mobile Daten)
      if (meta.mobile && window.innerWidth < 900) {
        const mBase = `assets/frames/${meta.mobile}/`;
        const m = await fetch(mBase + "manifest.json", { cache: "no-cache" });
        if (m.ok) { meta = { ...meta, ...(await m.json()) }; base = mBase; }
      }
    } catch (e) { return; }

    const canvas = track.querySelector(".seq-canvas");
    const ctx = canvas.getContext("2d");
    const n = meta.count;
    const src = (i) => `${base}${meta.prefix || "frame-"}${String(i + 1).padStart(3, "0")}.${meta.ext || "webp"}`;
    const frames = new Array(n);
    let current = -1;

    track.hidden = false;
    track.classList.add("seq-on");
    // Im Hero ersetzt die Bildfolge Foto und Video
    const video = track.querySelector(".hero-video");
    if (video) { video.pause(); video.removeAttribute("src"); video.load(); }
    document.documentElement.classList.add(`seq-${name}`);
    canvas.hidden = false;

    // Zeichnen wie object-fit: cover, scharf auf Retina
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      current = -1; render();
    }
    function draw(img) {
      const cw = canvas.width, ch = canvas.height;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const fx = meta.focusX ?? 0.5;
      let s, x, y;
      if (ch > cw * 1.1) {
        // Hochformat (Telefon): Motiv ganz zeigen, im oberen Teil; Rest bleibt schwarz wie der Bildhintergrund
        s = (cw * 1.45) / iw;
        x = (cw - iw * s) * fx; y = ch * 0.06;
        ctx.fillStyle = meta.bg || "#000"; ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, x, y, iw * s, ih * s);
        // Bildkanten weich in den Hintergrund auslaufen lassen (oben und unten)
        const h = ih * s, fade = h * 0.22;
        const top = ctx.createLinearGradient(0, y, 0, y + fade);
        top.addColorStop(0, meta.bg || "#000"); top.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = top; ctx.fillRect(0, y - 1, cw, fade + 1);
        const bot = ctx.createLinearGradient(0, y + h - fade, 0, y + h);
        bot.addColorStop(0, "rgba(0,0,0,0)"); bot.addColorStop(1, meta.bg || "#000");
        ctx.fillStyle = bot; ctx.fillRect(0, y + h - fade, cw, fade + 1);
        return;
      } else {
        // Querformat: wie object-fit: cover, Motiv nach focusX ausgerichtet (Motiv rechts, Text links)
        s = Math.max(cw / iw, ch / ih);
        x = (cw - iw * s) * fx; y = (ch - ih * s) / 2;
      }
      ctx.drawImage(img, x, y, iw * s, ih * s);
    }
    function nearestLoaded(i) {
      for (let d = 0; d < n; d++) {
        if (frames[i - d] && frames[i - d].complete) return frames[i - d];
        if (frames[i + d] && frames[i + d].complete) return frames[i + d];
      }
      return null;
    }
    function progress() {
      if (reduce) return meta.restAt ?? 1;
      const r = track.getBoundingClientRect();
      const span = track.offsetHeight - window.innerHeight;
      return span > 0 ? clamp(-r.top / span, 0, 1) : 0;
    }
    function render() {
      const p = progress();
      const i = Math.round(p * (n - 1));
      track.style.setProperty("--p", p.toFixed(4));
      if (i === current) return;
      const img = frames[i] && frames[i].complete ? frames[i] : nearestLoaded(i);
      if (img) { draw(img); current = frames[i] && frames[i].complete ? i : -1; }
    }

    // Laden: zuerst das Bild, das gerade gebraucht wird, dann alle anderen
    function load(i) {
      if (frames[i]) return;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => { if (current < 0 || Math.abs(i - Math.round(progress() * (n - 1))) < 3) { current = -1; render(); } };
      img.src = src(i);
      frames[i] = img;
    }
    const start = Math.round(progress() * (n - 1));
    load(start);
    if (!reduce) {
      // Jedes 4. Bild zuerst (grobe Vorschau beim schnellen Scrollen), dann den Rest
      for (let i = 0; i < n; i += 4) load(i);
      for (let i = 0; i < n; i++) load(i);
    }

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; render(); }); }
    }, { passive: true });
    window.addEventListener("resize", size);
    size();
  });
})();
