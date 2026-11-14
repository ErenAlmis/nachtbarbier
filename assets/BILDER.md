# Görsel Listesi: Nachtbarbier (güncel)

Sitenin yeni hâline göre güncellendi: Zümrüt yeşili, altın ve bordo paleti, hero'da ustura animasyonu.
Görselleri şu klasöre koy, dosya adı doğruysa site onları kendisi yerleştirir:
`C:\Users\Eren\Desktop\claude\nachtbarbier\assets\`

**Artık gerekmeyenler:** `hero.jpg` ve `hero.mp4` (hero'da ustura animasyonu var), `razor.jpg` (yerine `intro.jpg` geldi).

---

## 1. adım: Tanıtım mesajı (yeni bir ChatGPT sohbetinde ilk mesaj)

```
I'm designing a website for a fictional ultra-luxury men's barbershop called "Nachtbarbier" (night barber) in the harbour district of Duisburg, Germany. It's open in the evening until 11 pm, by appointment only. I'll ask you for several photos of this place, one at a time. All of them must look like they were shot in the SAME shop, with the SAME lighting and color grading.

THE SHOP:
- Dark walnut wood panelling, deep emerald-green leather barber chairs with polished brass details
- Warm brass pendant lamps with tungsten bulbs, antique mirrors in thin gold frames
- A dark walnut counter with crystal whisky glasses, wooden combs, shaving brushes, straight razors
- A private back room ("Separee") with one emerald leather chair and a heavy bordeaux-red velvet curtain
- No neon, no logos, no signs, no text anywhere

THE LOOK:
- Night atmosphere, low-key lighting, warm lamps are the only light source, deep shadows
- Color palette: near-black shadows, deep emerald green, warm gold and brass, touches of bordeaux red
- Cinematic, photorealistic, shot on 35mm, slight film grain, calm and exclusive, never flashy

THE TEAM (fictional people, not real or famous persons):
- Emre: master barber and owner, Turkish-German man in his early 40s, short grey-black beard, black shirt with rolled sleeves
- Lukas: German man in his early 30s, tattooed forearms, dark leather apron
- Mila: woman in her late 20s, sleek dark hair tied back, black turtleneck

Please confirm you understood. I'll then ask for the images one by one.
```

---

## 2. adım: Görseller (öncelik sırasıyla)

| # | Dosya | Oran | Sitede nerede |
|---|---|---|---|
| 1 | `intro.jpg` | 2:3 dikey | Giriş bölümü, büyük fotoğraf |
| 2 | `team-emre.jpg` | 2:3 dikey | Ekip |
| 3 | `team-lukas.jpg` | 2:3 dikey | Ekip |
| 4 | `team-mila.jpg` | 2:3 dikey | Ekip |
| 5 | `gallery-1.jpg` | 2:3 dikey | Galeri (büyük), "Heiße Tücher" bölümü, "Nassrasur" fiyat satırı |
| 6 | `gallery-3.jpg` | 1:1 kare | Galeri, "Ein Glas zum Schluss" bölümü |
| 7 | `gallery-5.jpg` | 1:1 kare | Galeri, "Gesicht und Kopf" bölümü, "Die lange Nacht" fiyat satırı |
| 8 | `gallery-2.jpg` | 1:1 kare | Galeri, "Haarschnitt" fiyat satırı |
| 9 | `gallery-4.jpg` | 1:1 kare | Galeri, "Bart" fiyat satırı |

**1. intro.jpg**
```
Image 1, portrait 2:3: Close-up of a steaming hot white towel being folded by a barber's hands, wisps of steam rising and catching the warm lamplight, an emerald leather chair blurred in the dark background.
```

**2. team-emre.jpg**
```
Image 2, portrait 2:3: Portrait of Emre standing next to an emerald leather barber chair, arms crossed, calm and confident, lit from one side by a brass pendant lamp, background dark walnut in shadow.
```

**3. team-lukas.jpg**
```
Image 3, portrait 2:3: Portrait of Lukas holding scissors and a wooden comb, standing in front of an antique gold-framed mirror, warm side light, background dark. Same framing and style as Emre's portrait.
```

**4. team-mila.jpg**
```
Image 4, portrait 2:3: Portrait of Mila leaning lightly against the walnut counter, looking at the camera, warm side light, background dark. Same framing and style as the other two portraits.
```

**5. gallery-1.jpg**
```
Image 5, portrait 2:3: Emre giving a customer a classic wet shave with a straight razor; the customer reclines in an emerald leather chair with a hot towel on his chest, seen from the side, faces partly in shadow.
```

**6. gallery-3.jpg**
```
Image 6, square 1:1: A crystal whisky glass with amber whisky and one large ice cube, a wooden comb and a shaving brush on the dark walnut counter, warm lamplight, shallow depth of field.
```

**7. gallery-5.jpg**
```
Image 7, square 1:1: The private back room: one emerald leather barber chair, the bordeaux velvet curtain half open, a single brass lamp, a whisky glass on a small side table.
```

**8. gallery-2.jpg**
```
Image 8, square 1:1: Close-up of a fresh, sharp skin fade haircut on the back of a man's head, crisp lines, warm lamplight, dark background.
```

**9. gallery-4.jpg**
```
Image 9, square 1:1: Extreme close-up of Mila's hands trimming a customer's dark beard with small scissors, dark background, warm side light.
```

---

## 3. Viski videosu (Kling ile, ustura gibi)

Viski sahnesi bu video gelene kadar sitede gizli kalır.

**Başlangıç görseli** (ChatGPT ya da Gemini), `whisky-start.png`:
```
Landscape 16:9: an empty heavy crystal whisky tumbler with one large clear ice cube on a dark walnut bar counter, a dark glass whisky bottle without label tilted above it, about to pour. Pitch-black background, one warm amber light from the right, subtle reflections in the crystal. The glass is placed slightly right of center, the left third of the image is dark and empty. Photorealistic, cinematic, no text, no logos.
```

**Kling'de video** (sadece başlangıç görselini yükle):
```
Amber whisky pours slowly from the bottle into the glass around the ice cube, the liquid swirls and catches the warm light, the glass fills to about one third, then the bottle lifts away. Static camera, locked tripod shot, no camera movement, no zoom, slow motion, no cuts, no text.
```
Ayarlar: 5 saniye, 16:9. Kaydet: `whisky-pour.mp4`

---

## İpuçları
- Bir görsel stile uymazsa: *"Make it darker, the lamps should be the only light, remove any text"*
- Portreler birbirine benzemiyorsa: *"Same framing, same lighting and the same background as the previous portrait"*
- Günlük limit dolarsa ertesi gün **aynı sohbete** dönüp devam et, mekânı hatırlar.
- Kaydederken JPG ya da PNG olabilir, ama **dosya adı** tablodaki gibi olmalı. PNG kaydettiysen sonunu `.jpg` yapma, bana söyle, ben çeviririm.
