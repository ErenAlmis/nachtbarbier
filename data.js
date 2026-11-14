// Inhalte an einer Stelle: Leistungen, Barbiere, Öffnungszeiten.
window.NB = {
  services: [
    // img: Foto, das beim Überfahren der Zeile neben dem Zeiger erscheint
    { id: "schnitt", name: "Haarschnitt", min: 60, price: 95, img: "assets/gallery-2.jpg",
      desc: "Beratung, Waschen, Schnitt mit Schere und Maschine, Styling." },
    { id: "rasur", name: "Nassrasur", min: 45, price: 85, img: "assets/gallery-1.jpg",
      desc: "Heiße Tücher, Rasur mit dem Messer, kalte Kompresse und Balsam." },
    { id: "bart", name: "Bart", min: 45, price: 75, img: "assets/gallery-4.jpg",
      desc: "Kontur, Form und Pflege mit Öl. Für Bärte, die gewollt aussehen." },
    { id: "schnitt-rasur", name: "Haarschnitt und Rasur", min: 105, price: 165, img: "assets/intro.jpg",
      desc: "Beides in einem Termin, mit einer Pause für Kaffee oder Whisky." },
    { id: "lange-nacht", name: "Die lange Nacht", min: 150, price: 290, img: "assets/gallery-5.jpg",
      desc: "Schnitt, Rasur, Gesichtsbehandlung und Kopfmassage im Separee, dazu ein Glas Single Malt." },
  ],
  membership: "Mitgliedschaft: zwei Termine im Monat zu Ihrer festen Uhrzeit, Separee nach Wunsch. 390 € im Monat.",
  barbers: [
    { id: "emre", name: "Emre Aydın", role: "Meisterbarbier und Inhaber",
      bio: "Seit zwanzig Jahren am Messer. Emre rasiert so, wie man es in Istanbul gelernt hat: langsam, heiß und gründlich.",
      photo: "assets/team-emre.jpg" },
    { id: "lukas", name: "Lukas Brandt", role: "Barbier",
      bio: "Klassische Schnitte und saubere Fades. Lukas arbeitet ruhig und erklärt jeden Schritt, wenn Sie möchten.",
      photo: "assets/team-lukas.jpg" },
    { id: "mila", name: "Mila Novak", role: "Barbierin",
      bio: "Bartdesign und Pflege. Mila findet die Form, die zu Ihrem Gesicht passt, nicht die, die gerade Mode ist.",
      photo: "assets/team-mila.jpg" },
  ],
  // Öffnungszeiten in Minuten ab Mitternacht; Sonntag = 0, Montag = 1 geschlossen
  hours: { 2: [900, 1380], 3: [900, 1380], 4: [900, 1380], 5: [900, 1380], 6: [720, 1380] },
};
