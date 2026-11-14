# Nachtbarbier: Ultra-Luxury Barbershop Website

A one-page website for a fictional ultra-luxury men's barbershop in Duisburg, Germany. The site is in German.

> **Portfolio project.** Nachtbarbier is a fictional business. The photos and the razor animation are AI-generated.

**▶ Live demo:** https://erenalmis.github.io/nachtbarbier/

## Highlights

- **Scroll-driven razor animation:** The hero stays pinned while a straight razor opens frame by frame as you scroll, like an Apple product page. It uses 96 WebP frames drawn on a `<canvas>`, with a lighter frame set for phones.
- **Online booking:** Guests choose a service, a barber (or "whoever is free first"), a day and a time. Free slots are calculated per barber from each service's duration and the opening hours. Overlapping bookings from the same phone number are blocked.
- **Editorial storytelling:** "Die lange Nacht", a 79 € ritual, is told in five chapters. The chapter you are reading comes forward while the others recede.
- **Curtain reveal:** After booking, bordeaux velvet curtains close and open again to reveal the confirmation.
- **Motion with restraint:** Photos reveal like a curtain, the price list shows a photo that follows the cursor, and buttons have a gold-foil sheen. Everything respects `prefers-reduced-motion`.
- **Design:** Emerald, gold foil and bordeaux, in a cream frame. Fonts are Josefin Sans, Pinyon Script and Hanken Grotesk, all **self-hosted**, so there are no Google Fonts requests (GDPR).
- **No frameworks:** Plain HTML, CSS and JavaScript.

## Tech

HTML, CSS, JavaScript (Canvas, IntersectionObserver), ffmpeg (`make-frames.sh` turns a video into a frame sequence), GitHub Pages.

## Run locally

```bash
python -m http.server 8080
```
