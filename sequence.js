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
    const ctx = canvas.getContext("2d", { alpha: false });
    const n = meta.count;
    // "v" im Manifest: neue Bilder mit gleichem Namen umgehen den Browser-Cache
    const ver = meta.v ? `?v=${meta.v}` : "";
    const src = (i) => `${base}${meta.prefix || "frame-"}${String(i + 1).padStart(3, "0")}.${meta.ext || "webp"}${ver}`;
    const frames = new Array(n);
    const ready = new Array(n).fill(false);    // erst nach decode() zeichnen: kein Dekodieren mitten im Scrollen
    let current = -1;
    let lastP = -1;
    let visible = true;
    // --p braucht nur die Textebene der Whisky-Szene; im Hero spart das eine Stil-Neuberechnung pro Scrollbild
    const usesP = !!track.querySelector(".scene-text");

    track.hidden = false;
    track.classList.add("seq-on");
    // Im Hero ersetzt die Bildfolge Foto und Video
    const video = track.querySelector(".hero-video");
    if (video) { video.pause(); video.removeAttribute("src"); video.load(); }
    document.documentElement.classList.add(`seq-${name}`);
    canvas.hidden = false;

    // Zeichnen wie object-fit: cover, scharf auf Retina
    // Nur neu aufbauen, wenn sich die Größe wirklich ändert. Auf Telefonen feuert "resize" bei jedem
    // Ein- und Ausblenden der Adressleiste; ein neues Canvas mitten im Scrollen ruckelt.
    let lastW = 0, lastH = 0;
    function size() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      // Hochformat: 1,5-fache Auflösung reicht für das dunkle, weiche Bild und halbiert die Pixelarbeit
      const dpr = Math.min(window.devicePixelRatio || 1, h > w * 1.1 ? 1.5 : 2);
      if (w === lastW && Math.abs(h - lastH) < 2) return;
      lastW = w; lastH = h;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      fades = null;
      current = -1; render();
    }
    let fades = null;   // Verläufe einmal pro Größe bauen, nicht pro Bild
    function draw(img) {
      const cw = canvas.width, ch = canvas.height;
      const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      const fx = meta.focusX ?? 0.5;
      let s, x, y;
      if (ch > cw * 1.1) {
        // Hochformat (Telefon): Motiv ganz zeigen, im oberen Teil; Rest bleibt schwarz wie der Bildhintergrund
        // pScale: Bildbreite relativ zur Canvasbreite (Telefon-Bilder sind schon auf den sichtbaren Teil zugeschnitten)
        s = (cw * (meta.pScale ?? 1.45)) / iw;
        x = (cw - iw * s) * fx; y = ch * 0.06;
        const h = ih * s, fade = h * 0.22, bg = meta.bg || "#000";
        // Nur die Flächen ober- und unterhalb des Bildes füllen, nicht das ganze Canvas
        ctx.fillStyle = bg; ctx.fillRect(0, 0, cw, Math.ceil(y)); ctx.fillRect(0, Math.floor(y + h), cw, ch);
        ctx.drawImage(img, x, y, iw * s, h);
        // Bildkanten weich in den Hintergrund auslaufen lassen (oben und unten)
        if (!fades) {
          const top = ctx.createLinearGradient(0, y, 0, y + fade);
          top.addColorStop(0, bg); top.addColorStop(1, "rgba(0,0,0,0)");
          const bot = ctx.createLinearGradient(0, y + h - fade, 0, y + h);
          bot.addColorStop(0, "rgba(0,0,0,0)"); bot.addColorStop(1, bg);
          fades = { top, bot };
        }
        ctx.fillStyle = fades.top; ctx.fillRect(0, y - 1, cw, fade + 1);
        ctx.fillStyle = fades.bot; ctx.fillRect(0, y + h - fade, cw, fade + 1);
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
        if (ready[i - d]) return frames[i - d];
        if (ready[i + d]) return frames[i + d];
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
      if (usesP && Math.abs(p - lastP) > 0.0005) { lastP = p; track.style.setProperty("--p", p.toFixed(4)); }
      if (i === current) return;
      const img = ready[i] ? frames[i] : nearestLoaded(i);
      if (img) { draw(img); current = ready[i] ? i : -1; }
    }

    // Laden: zuerst das Bild, das gerade gebraucht wird, dann alle anderen
    function load(i) {
      if (frames[i]) return;
      const img = new Image();
      img.decoding = "async";
      img.src = src(i);
      frames[i] = img;
      const done = async () => {
        // Als ImageBitmap behalten: bleibt dekodiert, der Browser muss beim Scrollen nichts nachladen
        if (window.createImageBitmap) {
          try { frames[i] = await createImageBitmap(img); } catch (e) { /* Bild bleibt als <img> */ }
        }
        ready[i] = true;
        if (current < 0 || Math.abs(i - Math.round(progress() * (n - 1))) < 3) { current = -1; render(); }
      };
      (img.decode ? img.decode() : new Promise((r, j) => { img.onload = r; img.onerror = j; })).then(done, () => {});
    }
    const start = Math.round(progress() * (n - 1));
    load(start);
    if (!reduce) {
      // Jedes 4. Bild zuerst (grobe Vorschau beim schnellen Scrollen), dann den Rest.
      // Erst wenn die Seite geladen ist, damit Fotos und Schriften nicht warten müssen.
      const loadAll = () => {
        for (let i = 0; i < n; i += 4) load(i);
        for (let i = 0; i < n; i++) load(i);
      };
      if (document.readyState === "complete") loadAll(); else window.addEventListener("load", loadAll, { once: true });
    }

    // Nur rechnen, solange die Bildfolge auf dem Bildschirm ist
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) render(); }).observe(track);
    }
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (visible && !ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; render(); }); }
    }, { passive: true });
    window.addEventListener("resize", size);
    size();
  });
})();
