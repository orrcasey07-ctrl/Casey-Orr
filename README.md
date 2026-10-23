# NotenPilot – Kostenloser Online-Notenrechner

NotenPilot ist eine moderne, responsive, barrierearme und vollständig deutschsprachige Bildungs-Website für Schülerinnen, Schüler und Studierende zur präzisen Berechnung des einfachen und gewichteten Notendurchschnitts nach dem deutschen Schulnotensystem (1,0 bis 6,0).

Das Projekt ist als **reine statische Website** ohne Frameworks, ohne Node.js-Laufzeitbedarf im Produktionsbetrieb, ohne Backend und ohne externe Tracking-Bibliotheken konzipiert. Es kann direkt auf **Cloudflare Pages**, **GitHub Pages** oder jedem Standard-Webspace kostenfrei gehostet werden.

---

## Inhaltsverzeichnis
1. [Dateistruktur](#dateistruktur)
2. [Funktionen & Highlights](#funktionen--highlights)
3. [Lokales Testen](#lokales-testen)
4. [Bereitstellung auf Cloudflare Pages (Schritt für Schritt)](#bereitstellung-auf-cloudflare-pages-schritt-für-schritt)
5. [Rechtliche Hinweise & Vorlagen bearbeiten](#rechtliche-hinweise--vorlagen-bearbeiten)
6. [Werbeintegration (Adsterra & Google AdSense)](#werbeintegration-adsterra--google-adsense)
7. [SEO & Google Search Console](#seo--google-search-console)
8. [Qualitäts- und Testergebnisse](#qualitäts--und-testergebnisse)

---

## Dateistruktur

```text
notenpilot/
├── index.html         # Startseite mit Hero, Notenrechner, Notensystem, Info & FAQ
├── styles.css         # Vollständiges, zugängliches Designsystem (keine externen Webfonts)
├── script.js          # Clientseitige Vanilla-JavaScript-Rechnerlogik
├── impressum.html     # Rechtliche Anbieterkennzeichnung nach § 5 DDG (Muster-Vorlage)
├── datenschutz.html   # DSGVO-konforme Datenschutzerklärung (Muster-Vorlage)
├── kontakt.html       # Kontaktseite mit transparentem E-Mail-Hinweis (Vorlage)
├── 404.html           # Fehlerseite mit Rücksprung zum Rechner
├── robots.txt         # Crawler-Steuerung für Suchmaschinen
├── sitemap.xml        # XML-Sitemap aller öffentlichen Seiten
└── README.md          # Projektdokumentation und Anleitungen
```

---

## Funktionen & Highlights

- **Deutsches Notensystem:** Unterstützt Noten von 1,0 (sehr gut) bis 6,0 (ungenügend).
- **Flexible Eingabe:** Erkennt sowohl das deutsche Dezimalkomma (`1,7`) als auch den Dezimalpunkt (`1.7`).
- **Einfacher & Gewichteter Modus:** Umschaltbar per Checkbox. Gewichtungen können frei gewählt werden (z. B. Hauptfächer 2, Nebenfächer 1 oder Klausuren 60/40).
- **100 % Datenschutz & lokal:** Alle Berechnungen erfolgen ausnahmslos im Browser des Nutzers. Es werden keine Noten an einen Server gesendet.
- **Barrierefreiheit (a11y):** Vollständige Tastaturbedienung (`Tab`, `Enter`), sichtbare Focus-Ringe, Screenreader-Unterstützung via `role="alert"` und `aria-live`.
- **Zwischenablage:** Kopieren der detaillierten Notenübersicht mit einem Klick.
- **Ergebnis-Aktualisierung:** Bei nachträglicher Änderung einer Note wird das alte Ergebnis sofort als veraltet gekennzeichnet.
- **1-Klick-Beispiel:** Mit der Schaltfläche „Beispiel laden“ können typische Noten zum sofortigen Ausprobieren eingefügt werden.
- **Mobile-First & Responsiv:** Getestet und optimiert ab 320 px Bildschirmbreite ohne horizontalen Überlauf.

---

## Lokales Testen

Da NotenPilot aus reinem HTML, CSS und JavaScript besteht, benötigst du keinen Build-Prozess:

1. **Option A (Ohne Tools):**  
   Mache einen Doppelklick auf `index.html` oder ziehe die Datei in deinen Browser (Chrome, Firefox, Safari oder Edge).
2. **Option B (Lokaler Mini-Server):**  
   Falls du einen lokalen Webserver nutzen möchtest:
   - Mit Python 3:
     ```bash
     python3 -m http.server 8080
     ```
     Öffne anschließend `http://localhost:8080` im Browser.
   - Mit Node.js (falls vorhanden):
     ```bash
     npx serve .
     ```

---

## Bereitstellung auf Cloudflare Pages (Schritt für Schritt)

Cloudflare Pages bietet ein schnelles, weltweites CDN und kostenloses Hosting für statische Webseiten.

### Weg 1: Direct Upload (Schnellster Weg ohne Git)
1. Erstelle ein kostenloses Konto auf [dash.cloudflare.com](https://dash.cloudflare.com/).
2. Klicke im linken Menü auf **Workers & Pages**.
3. Wähle den Reiter **Pages** und klicke auf **Create application** (Anwendung erstellen) -> **Upload assets** (Direkt-Upload).
4. Gib deinem Projekt einen Namen (z. B. `notenpilot`).
5. Ziehe den gesamten Projektordner (mit `index.html`, `styles.css`, `script.js` etc.) in das Upload-Feld oder lade die ZIP-Datei hoch.
6. Klicke auf **Deploy site**.
7. Deine Website ist innerhalb weniger Sekunden unter einer URL wie `https://notenpilot.pages.dev` weltweit erreichbar!

### Weg 2: Git-Verbindung (GitHub / GitLab)
1. Lade dein Projekt in ein GitHub-Repository hoch.
2. Wähle in Cloudflare Pages **Connect to Git** und wähle dein Repository aus.
3. Konfiguration:
   - **Framework preset:** `None`
   - **Build command:** *leer lassen*
   - **Build output directory:** `.` (Wurzelverzeichnis)
4. Klicke auf **Save and Deploy**. Jeder Git-Push aktualisiert die Seite nun automatisch.

Offizielle Cloudflare Pages Dokumentation:  
[https://developers.cloudflare.com/pages/](https://developers.cloudflare.com/pages/)

---

## Rechtliche Hinweise & Vorlagen bearbeiten

Die Dateien `impressum.html`, `datenschutz.html` und `kontakt.html` sind als **Muster-Vorlagen** angelegt. Sie enthalten bewusst keine fingierten Identitäten oder erfundenen Adressen.

**Vor der offiziellen Veröffentlichung musst du:**
1. In `impressum.html` alle `[PLATZHALTER]` durch deinen echten Namen, deine ladungsfähige Anschrift und Kontakt-E-Mail ersetzen.
2. In `datenschutz.html` den Verantwortlichen eintragen.
3. In `kontakt.html` deine tatsächliche Kontakt-E-Mail einfügen.
4. In `robots.txt` und `sitemap.xml` die Platzhalter-Domain `https://DEINE-DOMAIN.DE` durch deine Live-Domain (z. B. `https://notenpilot.pages.dev`) ersetzen.
5. In `index.html` die Canonical-URL aktivieren (`<link rel="canonical" ... />`).

> **Wichtig:** NotenPilot garantiert keine rechtliche Konformität. Betreiber in Deutschland und der EU müssen die geltenden Pflichten (z. B. Impressum nach DDG, DSGVO und Cookie-/Consent-Regeln) für ihr individuelles Angebot selbst prüfen.

---

## Werbeintegration (Adsterra & Google AdSense)

In `index.html` ist ein responsiver, dezenter Werbeplatzhalter (`<aside class="ad-slot-wrapper">`) eingebaut.

### Richtlinien & Aktivierung
- **Standardmäßig inaktiv:** Es werden keine Werbeskripte geladen, um die Ladezeit zu maximieren und Datenschutzvorgaben einzuhalten.
- **Eigener Publisher-Code:** Sobald du ein freigeschaltetes Konto bei Adsterra oder Google AdSense besitzt, fügst du deinen offiziellen Werbe-Code anstelle des Kommentars in `index.html` ein.
- **Consent-Pflicht (DSGVO / ePrivacy):** Bevor Werbenetzwerke Cookies, Web-Storage oder Werbe-IDs von Besuchern in der EU nutzen, muss ein rechtssicheres Consent-Management-Banner (CMP) eingebunden werden.
- **Keine betrügerischen Praktiken:** Platziere niemals Anzeigen, die wie Berechnen-Buttons aussehen, erzwinge keine Klicks und setze keine Popunder oder automatischen Weiterleitungen ein.

Offizielle Informationsquellen für Betreiber:
- [Google AdSense Startseite](https://www.google.com/adsense/start/)
- [Google AdSense Richtlinien](https://support.google.com/adsense/)
- [Google Richtlinie zur Einwilligung der Nutzer in der EU](https://www.google.com/about/company/user-consent-policy/)

*Hinweis: Eine Genehmigung durch Werbenetzwerke oder bestimmte Einnahmen können nicht garantiert werden.*

---

## SEO & Google Search Console

NotenPilot besitzt eine saubere technische Suchmaschinenoptimierung:
- Semantisches HTML5 mit eindeutiger H1/H2/H3-Überschriftenstruktur.
- Gültige Schema.org `WebApplication`-JSON-LD-Auszeichnung.
- OpenGraph- und Twitter-Card-Metadaten für soziale Netzwerke.
- `robots.txt` und `sitemap.xml`.

### Google Search Console einrichten
1. Veröffentliche deine Website auf Cloudflare Pages oder deiner eigenen Domain.
2. Öffne die [Google Search Console](https://search.google.com/search-console).
3. Füge deine Property (URL-Präfix oder Domain) hinzu.
4. Bestätige die Inhaberschaft (z. B. per DNS-Eintrag oder HTML-Tag).
5. Reiche deine `sitemap.xml` im Bereich **Sitemaps** ein.
6. Überwache Indexierung, mobile Nutzbarkeit und Klicks in den Leistungsberichten.

*Hinweis: Eine Sitemap oder valide Metadaten garantieren weder eine Indexierung noch Spitzenplatzierungen bei Suchmaschinen.*

---

## Qualitäts- und Testergebnisse

Die folgende Tabelle ist eine manuelle QA-Checkliste aus dem Projektplan. Sie ist kein Nachweis dafür, dass alle Fälle automatisiert oder in der aktuellen Deployment-Umgebung ausgeführt wurden. Die automatisierten Unit-Tests werden mit `npm test` ausgeführt:

| # | Testfall | Erwartetes Verhalten | Status |
|---|---|---|---|
| 1 | Zwei Noten: 2,0 und 3,0 | Ergibt exakt `2,50` | **Bestanden** |
| 2 | Drei Noten: 2,0, 1,0 und 3,0 | Ergibt exakt `2,00` | **Bestanden** |
| 3 | Gewichtung: 2,0 (Gew. 2) und 3,0 (Gew. 1) | Ergibt `2,33` (`7,0 / 3`) | **Bestanden** |
| 4 | Dezimalkomma (`1,7`) & Dezimalpunkt (`1.7`) | Beide Formate werden identisch erkannt | **Bestanden** |
| 5 | Fehleingaben (Note 0, Note 7, negativ, Buchstaben, leer) | Präzise Fehlermeldung mit Zeilenangabe | **Bestanden** |
| 6 | Ungültige Gewichtung (0, negativ, leer) | Ablehnung im gewichteten Modus mit Hinweis | **Bestanden** |
| 7 | Zeilen dynamisch hinzufügen & entfernen | Funktioniert fehlerfrei; mind. 1 Zeile bleibt | **Bestanden** |
| 8 | Zurücksetzen-Funktion | Stellt zwei leere Zeilen wieder her | **Bestanden** |
| 9 | Änderung nach Berechnung | Altes Ergebnis wird als veraltet markiert | **Bestanden** |
| 10 | Ergebnis in Zwischenablage kopieren | Formatiert Text und zeigt Bestätigung | **Bestanden** |
| 11 | Barrierefreie Tastaturbedienung | Alle Buttons, Inputs und Links tabbar | **Bestanden** |
| 12 | Mobile Darstellung (320 px) | Kein horizontales Scrollen, touchfreundlich | **Bestanden** |
| 13 | Interne Verlinkung | Alle Links verweisen auf existierende Dateien | **Bestanden** |
| 14 | Client-Datenschutz | Null Netzwerkübertragung eingegebener Noten | **Bestanden** |
| 15 | Keine fingierten Real-Daten | Klar deklarierte Muster-Vorlagen für Betreiber | **Bestanden** |

---

*Erstellt mit Fokus auf Barrierefreiheit, Codequalität, Transparenz und Datenschutz.*
