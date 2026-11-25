// Terminbuchung: Leistung, Barbier, Tag und Uhrzeit, mit Live-Zusammenfassung.
// Demo: Termine liegen im localStorage. Für den echten Betrieb nur load/save gegen eine API tauschen.
(function () {
  const D = window.NB;
  const KEY = "nachtbarbier-v1";
  const STEP = 30;          // Startzeiten im 30-Minuten-Raster
  const DAYS_AHEAD = 21;
  const LEAD = 60;          // heute frühestens in einer Stunde

  const $ = (id) => document.getElementById(id);
  const form = $("bookForm");

  // ---------------------------------------------------------------------------
  // Eingaben prüfen: Name und Telefonnummer.
  // Jede Prüfung gibt { value } (bereinigt) oder { msg } (Fehlertext für den Kunden) zurück.
  // ---------------------------------------------------------------------------
  function checkName(v) {
    const name = v.trim().replace(/\s+/g, " ");
    if (!name) return { msg: "Tragen Sie Ihren Namen ein. Wir reservieren den Termin auf diesen Namen." };
    if (/\d/.test(name)) return { msg: "Der Name darf keine Ziffern enthalten." };
    if (!/^\p{L}[\p{L}\p{M} .'’-]*$/u.test(name)) return { msg: "Bitte nur Buchstaben, Leerzeichen, Bindestrich und Apostroph verwenden." };
    if ((name.match(/\p{L}/gu) || []).length < 2) return { msg: "Der Name ist zu kurz." };
    return { value: name };
  }

  // Deutsche Nummern mit Vorwahl (0203 …, 0176 …), auch als +49 / 0049; andere Länder mit + und Ländervorwahl.
  // Ergebnis ist die Nummer im internationalen Format, z. B. +4917612345678.
  function checkPhone(v) {
    const raw = v.trim();
    if (!raw) return { msg: "Tragen Sie Ihre Telefonnummer ein, damit wir den Termin bestätigen können." };
    if (/[^\d\s+()\/.-]/.test(raw)) return { msg: "Die Telefonnummer darf nur Ziffern, Leerzeichen und + - / ( ) enthalten." };
    if ((raw.match(/\+/g) || []).length > 1 || raw.indexOf("+") > 0) return { msg: "Das Pluszeichen ist nur am Anfang erlaubt, z. B. +49 176 12345678." };
    const d = raw.replace(/\D/g, "");
    if (/(\d)\1{6,}/.test(d)) return { msg: "Bitte geben Sie eine echte Telefonnummer ein." };

    let intl = null;
    if (raw.startsWith("+")) intl = d;
    else if (d.startsWith("00")) intl = d.slice(2);

    if (intl !== null && !intl.startsWith("49")) {
      if (intl.length < 8 || intl.length > 15) return { msg: "Diese internationale Telefonnummer hat eine ungültige Länge." };
      return { value: "+" + intl };
    }
    const national = intl !== null ? "0" + intl.slice(2) : d;
    if (!national.startsWith("0") || national.startsWith("00")) {
      return { msg: "Bitte mit Vorwahl angeben, z. B. 0203 123456 oder 0176 12345678." };
    }
    if (/^01[5-7]/.test(national)) {
      if (national.length < 10 || national.length > 12) return { msg: "Eine Handynummer hat 10 bis 12 Ziffern, z. B. 0176 12345678." };
    } else if (national.length < 7 || national.length > 13) {
      return { msg: "Diese Telefonnummer ist zu kurz oder zu lang. Bitte mit Vorwahl angeben." };
    }
    return { value: "+49" + national.slice(1) };
  }

  // Fehler direkt am Feld zeigen: beim Verlassen prüfen, beim Tippen den Fehler löschen, sobald er behoben ist
  function showFieldResult(el, res) {
    const msgEl = $(el.id + "Msg");
    el.setAttribute("aria-invalid", res.msg ? "true" : "false");
    if (msgEl) msgEl.textContent = res.msg || "";
  }
  [["bkName", checkName], ["bkPhone", checkPhone]].forEach(([id, check]) => {
    const el = $(id);
    el.addEventListener("blur", () => { if (el.value.trim()) showFieldResult(el, check(el.value)); });
    el.addEventListener("input", () => {
      if (el.getAttribute("aria-invalid") === "true") showFieldResult(el, check(el.value));
    });
  });

  // Perdenvorhang: Bordeaux-Samt schließt sich, dahinter wechselt die Ansicht, dann öffnet er sich.
  // Bei "Bewegung reduzieren" wechselt die Ansicht sofort.
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  new Image().src = matchMedia("(max-aspect-ratio: 4/5)").matches ? "assets/curtain-m.jpg" : "assets/curtain.jpg";
  function curtain(label, swap) {
    if (reduceMotion.matches) { swap(); return; }
    let el = document.getElementById("curtain");
    if (!el) {
      el = document.createElement("div");
      el.id = "curtain"; el.className = "curtain"; el.setAttribute("aria-hidden", "true");
      el.innerHTML = '<div class="curtain-panel curtain-left"><span class="curtain-img"></span></div>' +
        '<div class="curtain-panel curtain-right"><span class="curtain-img"></span></div><p class="curtain-mark"></p>';
      document.body.append(el);
    }
    el.querySelector(".curtain-mark").textContent = label;
    el.classList.add("is-on");
    void el.offsetWidth;                       // Startzustand rendern, damit die Bewegung sichtbar ist
    el.classList.add("is-closed");
    setTimeout(() => {
      swap();
      const sec = document.getElementById("termin");
      const m = parseFloat(getComputedStyle(sec).scrollMarginTop) || 0;
      window.scrollTo(0, sec.getBoundingClientRect().top + window.scrollY - m);
      setTimeout(() => {
        el.classList.remove("is-closed");      // Vorhang öffnet sich
        setTimeout(() => el.classList.remove("is-on"), 1700);
      }, 650);
    }, 1000);
  }
  const err = $("bookError");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fmtDay = new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long" });
  const fmtWd = new Intl.DateTimeFormat("de-DE", { weekday: "short" });
  const fmtMon = new Intl.DateTimeFormat("de-DE", { month: "short" });
  const dayLabel = (date) => fmtDay.format(new Date(date + "T12:00"));

  // ---- Speicher ----
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l)); return true; } catch (e) { return false; } };

  // ---- Belegung ----
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // Demo-Belegung: feste, pro Tag und Barbier wiederholbare Blöcke, abends voller
  function demoBusy(barber, date) {
    const [open, close] = hoursFor(date) || [0, 0];
    const blocks = [];
    for (let m = open; m < close; m += 60) {
      const late = m >= 19 * 60;
      if (hash(barber + date + m) % (late ? 3 : 5) === 0) blocks.push([m, m + 60]);
    }
    return blocks;
  }
  function busy(barber, date) {
    const booked = load()
      .filter((r) => r.barber === barber && r.date === date && r.status !== "cancelled")
      .map((r) => [toMin(r.time), toMin(r.time) + r.min]);
    return demoBusy(barber, date).concat(booked);
  }
  const overlaps = (a0, a1, b0, b1) => a0 < b1 && b0 < a1;
  const isFree = (barber, date, start, min) =>
    !busy(barber, date).some(([b0, b1]) => overlaps(start, start + min, b0, b1));
  function hoursFor(date) { return D.hours[new Date(date + "T12:00").getDay()] || null; }
  function freeBarber(date, start, min) {
    const pool = state.barber === "any" ? D.barbers.map((b) => b.id) : [state.barber];
    return pool.find((id) => isFree(id, date, start, min)) || null;
  }

  // ---- Zustand und Ausgabe ----
  const state = { service: null, barber: null, date: null, time: null };
  const service = () => D.services.find((s) => s.id === state.service);
  const barberName = (id) => (D.barbers.find((b) => b.id === id) || {}).name;

  const opt = (name, value, face, cls = "", disabled = false, aria = "") =>
    `<label class="opt ${cls}"><input type="radio" name="${name}" value="${esc(value)}"${disabled ? " disabled" : ""}>` +
    `<span class="opt-face"${aria ? ` aria-label="${esc(aria)}"` : ""}>${face}</span></label>`;

  $("serviceChoices").innerHTML = D.services.map((s) => opt("service", s.id,
    `<span class="opt-title">${esc(s.name)}</span><span class="opt-price">${s.price} €</span><span class="opt-sub">${s.min} Minuten</span>`
  )).join("");

  $("barberChoices").innerHTML =
    opt("barber", "any", "Wer zuerst frei ist") +
    D.barbers.map((b) => opt("barber", b.id, esc(b.name.split(" ")[0]))).join("");

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });
  $("dayChoices").innerHTML = days.map((d, i) => {
    const date = iso(d);
    const closed = !hoursFor(date);
    const top = i === 0 ? "Heute" : i === 1 ? "Morgen" : fmtWd.format(d);
    return opt("day", date, `<small>${top}</small><b>${d.getDate()}</b><small>${closed ? "zu" : fmtMon.format(d)}</small>`,
      closed ? "is-off" : "", closed, closed ? `${fmtDay.format(d)}, geschlossen` : "");
  }).join("");

  function renderTimes() {
    const box = $("timeChoices");
    if (!state.service || !state.barber || !state.date) return;
    const [open, close] = hoursFor(state.date);
    const min = service().min;
    const isToday = state.date === iso(today);
    const now = new Date(); const cutoff = now.getHours() * 60 + now.getMinutes() + LEAD;
    let html = "", any = false;
    for (let m = open; m + min <= close; m += STEP) {
      const past = isToday && m < cutoff;
      const free = !past && !!freeBarber(state.date, m, min);
      if (free) any = true;
      html += opt("time", hm(m), hm(m), free ? "" : "is-off", !free, free ? "" : `${hm(m)}, ${past ? "vorbei" : "belegt"}`);
    }
    box.innerHTML = any ? html
      : `<p class="hint">An diesem Tag ist für ${esc(service().name)} nichts mehr frei. Wählen Sie einen anderen Tag oder einen anderen Barbier.</p>`;
    const keep = state.time && box.querySelector(`input[value="${state.time}"]:not(:disabled)`);
    if (keep) keep.checked = true; else state.time = null;
    renderSummary();
  }

  const rows = { service: $("sumService"), barber: $("sumBarber"), day: $("sumDay"), time: $("sumTime") };
  function row(el, text) {
    el.textContent = text || el.dataset.empty;
    el.classList.toggle("is-set", !!text);
  }
  function renderSummary() {
    const s = service();
    row(rows.service, s && s.name);
    row(rows.barber, state.barber && (state.barber === "any" ? "Bei wem zuerst frei ist" : "Bei " + barberName(state.barber).split(" ")[0]));
    row(rows.day, state.date && dayLabel(state.date));
    row(rows.time, state.time && `${state.time} bis ${hm(toMin(state.time) + s.min)} Uhr`);
    $("sumPrice").textContent = s ? `${s.price} €, ${s.min} Minuten` : "";
  }
  renderSummary();

  form.addEventListener("change", (e) => {
    const t = e.target;
    if (!["service", "barber", "day", "time"].includes(t.name)) return;
    err.textContent = "";
    if (t.name === "day") state.date = t.value; else state[t.name] = t.value;
    if (t.name === "time") renderSummary(); else renderTimes();
    if (!(state.service && state.barber && state.date)) renderSummary();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameEl = $("bkName"), phoneEl = $("bkPhone");
    const nameRes = checkName(nameEl.value), phoneRes = checkPhone(phoneEl.value);
    const name = nameRes.value || "", phone = phoneRes.value || "", note = $("bkNote").value.trim();
    const first = (sel) => form.querySelector(sel);
    let msg = "", focus = null;
    if (!state.service) { msg = "Wählen Sie eine Leistung."; focus = first('[name="service"]'); }
    else if (!state.barber) { msg = "Wählen Sie einen Barbier."; focus = first('[name="barber"]'); }
    else if (!state.date) { msg = "Wählen Sie einen Tag."; focus = first('[name="day"]:not(:disabled)'); }
    else if (!state.time) { msg = "Wählen Sie eine freie Uhrzeit."; focus = first('[name="time"]:not(:disabled)'); }
    else if (nameRes.msg) { msg = nameRes.msg; focus = nameEl; showFieldResult(nameEl, nameRes); }
    else if (phoneRes.msg) { msg = phoneRes.msg; focus = phoneEl; showFieldResult(phoneEl, phoneRes); }
    if (msg) { err.textContent = msg; if (focus) focus.focus(); return; }

    const s = service(), start = toMin(state.time);
    const digits = (x) => x.replace(/\D/g, "");
    const dup = load().find((r) => r.status !== "cancelled" && r.date === state.date &&
      digits(r.phone) === digits(phone) && overlaps(start, start + s.min, toMin(r.time), toMin(r.time) + r.min));
    if (dup) { err.textContent = `Sie haben zu dieser Zeit schon einen Termin (${dup.id}). Wählen Sie eine andere Uhrzeit.`; return; }

    const barber = freeBarber(state.date, start, s.min);
    if (!barber) { err.textContent = "Diese Uhrzeit wurde gerade vergeben. Wählen Sie eine andere."; renderTimes(); return; }

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const id = "NB-" + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const list = load();
    list.push({ id, service: s.id, min: s.min, price: s.price, barber, date: state.date, time: state.time,
      name, phone, note, status: "pending", createdAt: new Date().toISOString() });
    if (!save(list)) { err.textContent = "Der Termin konnte nicht gespeichert werden. Ihr Browser erlaubt keine Speicherung."; return; }

    $("doneWhen").textContent = `${dayLabel(state.date)}, ${state.time} Uhr`;
    const meta = $("doneMeta");
    meta.textContent = `${s.name} bei ${barberName(barber)}, reserviert auf den Namen ${name}. Ihre Buchungsnummer: `;
    const code = document.createElement("span"); code.className = "done-code"; code.textContent = id;
    meta.append(code);
    curtain("Ihr Termin", () => {
      form.hidden = true; $("bookDone").hidden = false; $("bookDone").focus({ preventScroll: true });
    });
  });

  $("bookAgain").addEventListener("click", () => {
    form.reset();
    Object.keys(state).forEach((k) => (state[k] = null));
    $("timeChoices").innerHTML = '<p class="hint">Wählen Sie zuerst Leistung, Barbier und Tag. Dann erscheinen hier die freien Zeiten.</p>';
    err.textContent = "";
    renderSummary();
    ["bkName", "bkPhone"].forEach((id) => showFieldResult($(id), {}));
    curtain("Neuer Termin", () => {
      $("bookDone").hidden = true; form.hidden = false;
      const firstOpt = form.querySelector('[name="service"]');
      if (firstOpt) firstOpt.focus({ preventScroll: true });
    });
  });
})();
