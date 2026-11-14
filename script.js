// Seite: Preisliste und Team aus data.js, Fotos, Navigation, Kapitel der langen Nacht.
(function () {
  const D = window.NB;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Preisliste
  document.getElementById("priceList").innerHTML = D.services.map((s) => `
    <div class="price-row">
      <h3 class="price-name">${esc(s.name)}</h3>
      <p class="price-value">${s.price} €</p>
      <p class="price-desc">${esc(s.desc)}</p>
      <p class="price-min">${s.min} Minuten</p>
    </div>`).join("") + `<p class="membership">${esc(D.membership)}</p>`;

  // Team: Monogramm, bis das Porträt da ist
  const initials = (n) => n.split(" ").map((w) => w[0]).join("");
  document.getElementById("teamGrid").innerHTML = D.barbers.map((b) => `
    <article class="barber">
      <figure class="photo barber-photo" data-photo="${esc(b.photo)}">
        <span class="monogram" aria-hidden="true">${esc(initials(b.name))}</span>
        <span class="barber-light" aria-hidden="true"></span>
        <span class="barber-frame" aria-hidden="true"></span>
        <a class="barber-book" href="#termin" data-barber="${esc(b.id)}">Bei ${esc(b.name.split(" ")[0])} buchen <span aria-hidden="true">↗</span></a>
      </figure>
      <h3 class="barber-name">${esc(b.name)}</h3>
      <p class="barber-role">${esc(b.role)}</p>
      <p class="barber-bio">${esc(b.bio)}</p>
    </article>`).join("");

  // Fotos: vorhandene Datei wird Hintergrund. Fehlende Fotos in Galerie und Kapiteln
  // werden ausgeblendet; eine leere Galerie verschwindet samt Menüpunkt.
  const gallery = document.getElementById("galerie");
  const galleryLink = document.querySelector('.nav-links a[href="#galerie"]');
  gallery.hidden = galleryLink.hidden = true;
  document.querySelectorAll("[data-photo]").forEach((el) => {
    const optional = el.closest(".gallery-grid") || el.classList.contains("chapter-photo");
    if (optional) el.hidden = true;
    const img = new Image();
    img.onload = () => {
      // Hero: direktes Hintergrundbild (Parallax). Andere Fotos: eigene Ebene (::before) für Enthüllen und Zoom
      if (el.classList.contains("hero-photo")) el.style.backgroundImage = `url("${el.dataset.photo}")`;
      else el.style.setProperty("--img", `url("${el.dataset.photo}")`);
      el.classList.add("has-photo");
      el.hidden = false;
      if (el.closest(".gallery-grid")) gallery.hidden = galleryLink.hidden = false;
      if (el.classList.contains("hero-photo")) document.querySelector(".hero").classList.add("has-photo");
    };
    img.src = el.dataset.photo;
  });

  // Mobiles Menü
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  });

  // Kapitel: das gerade gelesene Kapitel tritt hervor, die anderen treten zurück
  const chapters = [...document.querySelectorAll(".chapter")];
  if ("IntersectionObserver" in window) {
    document.querySelector(".chapters").classList.add("is-reading");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) {
        chapters.forEach((c) => c.classList.toggle("is-active", c === e.target));
      } });
    }, { rootMargin: "-45% 0px -45% 0px" });
    chapters.forEach((c) => io.observe(c));
    chapters[0].classList.add("is-active");
  }

  // Barbier-Porträts: Lampenlicht folgt dem Zeiger; "Bei … buchen" wählt den Barbier im Formular aus
  document.querySelectorAll(".barber-photo").forEach((fig) => {
    fig.addEventListener("pointermove", (e) => {
      const r = fig.getBoundingClientRect();
      fig.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      fig.style.setProperty("--my", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    });
  });
  document.querySelectorAll("[data-barber]").forEach((a) => a.addEventListener("click", () => {
    const input = document.querySelector(`input[name="barber"][value="${a.dataset.barber}"]`);
    if (input && !input.checked) { input.checked = true; input.dispatchEvent(new Event("change", { bubbles: true })); }
  }));

  // "Die lange Nacht buchen" wählt die Leistung im Formular schon aus
  document.querySelectorAll("[data-service]").forEach((a) => a.addEventListener("click", () => {
    const input = document.querySelector(`input[name="service"][value="${a.dataset.service}"]`);
    if (input && !input.checked) { input.checked = true; input.dispatchEvent(new Event("change", { bubbles: true })); }
  }));
})();
