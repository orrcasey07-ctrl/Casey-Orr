# NotenPilot – Vollständiger Website-Bauplan für Google AI

## 1. Projektziel

Erstelle eine vollständig deutschsprachige, responsive und barrierearme Website namens **NotenPilot**. Die Website hilft Schülerinnen, Schülern und Studierenden, ihren Notendurchschnitt zu berechnen.

Die Website soll:
- mit HTML, CSS und Vanilla JavaScript funktionieren;
- ohne Backend und ohne kostenpflichtige Bibliotheken auskommen;
- kostenlos auf Cloudflare Pages veröffentlicht werden können;
- schnell laden und auf Smartphone, Tablet und Desktop funktionieren;
- eine solide technische SEO-Grundlage haben;
- später für Google AdSense vorbereitet werden können, ohne eine Zulassung oder Einnahmen zu garantieren.

**Wichtig:** Die gesamte sichtbare Benutzeroberfläche, alle Texte, Fehlermeldungen, Beschriftungen, Hinweise, FAQs und rechtlichen Platzhalter müssen in natürlichem Deutsch sein. Kein Urdu, Englisch oder Lorem ipsum in der Benutzeroberfläche. Englische Begriffe sind nur in Code-Kommentaren, Dateinamen oder technischen Dokumentationen erlaubt.

## 2. Anweisung an Google AI

Verwende diesen Bauplan als verbindliche Spezifikation. Erstelle ein vollständiges, direkt lauffähiges Projekt und nicht nur eine Demo oder einen Entwurf.

### Technische Vorgaben
- Verwende semantisches HTML5, modernes CSS und Vanilla JavaScript.
- Keine Frameworks, keine Build-Schritte, keine externen JavaScript-Bibliotheken und keine unnötigen externen Ressourcen.
- Die Website muss nach dem Hochladen auf Cloudflare Pages direkt funktionieren.
- Verwende saubere, verständliche und wartbare Dateien.
- Berechne Noten vollständig im Browser. Übermittle eingegebene Noten nicht an einen Server.
- Nutze keine erfundenen Bewertungen, Nutzerzahlen, Testimonials oder Erfolgsversprechen.
- Füge keine Werbeskripte ein, solange kein echtes AdSense-Konto und keine genehmigten Werbeeinheiten vorhanden sind.
- Erfinde keine rechtlichen Angaben. Erstelle klar gekennzeichnete Vorlagen und erkläre, welche Angaben der Betreiber vor Veröffentlichung ergänzen und prüfen muss.
- Verwende keine gefälschten Consent-Banner. Wenn später nicht notwendige Cookies oder Werbetechnologien eingesetzt werden, muss ein geeigneter, rechtlich geprüfter Consent-Mechanismus integriert werden.
- Vermeide Tracking standardmäßig. Externe Analyse- oder Werbedienste dürfen nicht ohne bewusste Einrichtung eingebaut werden.
- Schreibe gut strukturierten Code und kommentiere wichtige Berechnungen.

## 3. Zielgruppe und Positionierung

**Zielgruppe:** Deutschsprachige Schülerinnen, Schüler und Studierende, die ihre Noten schnell und verständlich berechnen möchten.

**Markenname:** NotenPilot

**Hauptversprechen:** „Notendurchschnitt einfach und kostenlos berechnen.“

**Tonalität:** Freundlich, klar, sachlich, hilfreich und natürlich deutsch. Sprich Nutzerinnen und Nutzer direkt mit „du“ an.

**Keine irreführenden Aussagen:** Behaupte nicht, dass das Ergebnis immer einer offiziellen Abschlussnote entspricht. Weise darauf hin, dass Schulen, Hochschulen, Studiengänge und Prüfungsordnungen unterschiedliche Regeln verwenden können.

## 4. Gewünschte Projektstruktur

Erstelle mindestens diese Dateien:

```text
notenpilot/
├── index.html
├── styles.css
├── script.js
├── robots.txt
├── sitemap.xml
├── impressum.html
├── datenschutz.html
├── kontakt.html
└── README.md
```

Optional:
- `404.html` mit einer deutschen Fehlermeldung und Link zur Startseite.
- `assets/` nur dann, wenn wirklich benötigte lokale Grafiken vorhanden sind. Die Website soll auch ohne Bilder gut aussehen.

Alle Links zwischen den Dateien müssen korrekt sein. Verwende keine Links, die auf nicht vorhandene Seiten zeigen. Falls die Seiten zunächst Vorlagen sind, kennzeichne sie im README deutlich als vor der Veröffentlichung auszufüllende Vorlagen.

## 5. Designsystem

### Visuelle Richtung
- Moderner, vertrauenswürdiger Bildungsrechner.
- Ruhiges, übersichtliches Layout mit viel Weißraum.
- Dunkelblau als Hauptfarbe, hellblaue Flächen, dezente grüne Ergebnisfläche.
- Abgerundete Karten und klare Formularelemente.
- Keine aufdringlichen Animationen, Pop-ups oder blinkenden Elemente.
- Keine erfundenen Nutzerbewertungen.

### Beispiel-Farbpalette
- Hauptblau: `#123B70`
- Helles Blau: `#EAF2FF`
- Text: `#182230`
- Sekundärtext: `#5C6675`
- Seitenhintergrund: `#F5F8FC`
- Kartenhintergrund: `#FFFFFF`
- Erfolg: `#176B48`
- Fehler: `#9F2525`
- Rahmen: `#DCE3EC`

### Responsive Layout
- Mobile-first.
- Auf schmalen Bildschirmen sollen Eingabefelder und Schaltflächen bequem bedienbar sein.
- Keine horizontalen Überläufe.
- Formulareingaben sollen mindestens gut lesbar sein.
- Fokuszustände müssen sichtbar sein.
- Unterstütze Tastaturbedienung und Screenreader mit sinnvollen Labels und ARIA-Attributen.

## 6. Seitenaufbau der Startseite (`index.html`)

Die gesamte Hauptfunktion soll auf einer einzigen Startseite liegen. Rechtliche Seiten dürfen separate HTML-Dateien sein.

### 6.1 Kopfzeile
- Textlogo: „NotenPilot“
- Navigationslink: „Zum Notenrechner“
- Optional: Link „So funktioniert’s“
- Auf Mobilgeräten übersichtlich und ohne überladenes Menü.

### 6.2 Hero-Bereich
H1:
**„Notendurchschnitt berechnen“**

Einleitung:
„Berechne deinen Notendurchschnitt kostenlos online. Gib deine Noten ein und erhalte dein Ergebnis in wenigen Sekunden – einfach, schnell und ohne Registrierung.“

Kurzer Hinweis:
„Für das übliche deutsche Schulnotensystem von 1,0 bis 6,0. Andere Bewertungssysteme können abweichen.“

### 6.3 Rechner
Überschrift: **„Deine Noten eingeben“**

Jede Notenzeile enthält:
- Fach (optional), zum Beispiel „Mathematik“
- Note
- Gewichtung
- Schaltfläche „Entfernen“

Anforderungen:
1. Beim ersten Laden sind mindestens zwei Notenzeilen vorhanden.
2. Schaltfläche „+ Weitere Note hinzufügen“ fügt eine Zeile hinzu.
3. „Entfernen“ löscht nur die zugehörige Zeile.
4. Es muss mindestens eine Note vorhanden sein, um rechnen zu können.
5. Eine Checkbox schaltet zwischen einfachem und gewichtetem Durchschnitt um:
   - Label: „Gewichtete Berechnung verwenden“
   - Erklärung: „Aktiviere diese Option, wenn deine Noten unterschiedlich stark zählen.“
6. Ist die gewichtete Berechnung ausgeschaltet, werden Gewichtungsfelder deaktiviert oder visuell als inaktiv markiert.
7. Die Schaltfläche „Durchschnitt berechnen“ startet die Berechnung.
8. „Zurücksetzen“ stellt den Ausgangszustand mit zwei leeren Notenzeilen wieder her.
9. „Ergebnis kopieren“ kopiert das Ergebnis erst nach erfolgreicher Berechnung. Wenn die Clipboard-API nicht verfügbar ist, zeige eine verständliche Fehlermeldung.
10. Ergebnisse und Fehler werden barrierearm angekündigt, beispielsweise über `aria-live` und `role="alert"`.
11. Bei ungültigen Eingaben wird keine Berechnung ausgegeben; zeige stattdessen eine verständliche deutsche Fehlermeldung.
12. Änderungen an Eingaben müssen ein zuvor angezeigtes Ergebnis als veraltet markieren oder ausblenden.

### 6.4 Gültige Noten und Eingaben
Für den Standardmodus:
- Zulässige Noten: 1,0 bis 6,0 einschließlich.
- Komma und Punkt sind als Dezimaltrennzeichen zulässig: `1,7` und `1.7`.
- Leere Notenfelder dürfen nicht stillschweigend ignoriert werden. Zeige, welche Zeile ausgefüllt werden muss.
- Lehne Buchstaben, negative Zahlen, Werte unter 1,0 oder über 6,0 sowie nicht endliche Zahlen ab.
- Keine automatische Rundung einzelner Eingaben vor der Berechnung.
- Zeige das Endergebnis standardmäßig mit zwei Nachkommastellen nach deutscher Zahlenschreibweise an.

Gewichtungen:
- Müssen numerisch und größer als 0 sein.
- Leere, negative oder nicht endliche Gewichtungen sind ungültig, wenn der gewichtete Modus aktiv ist.
- Begrenze Gewichtungen auf einen sinnvollen Höchstwert und erkläre den Fehler auf Deutsch.

### 6.5 Berechnungslogik
Einfacher Durchschnitt:

`Durchschnitt = Summe aller Noten / Anzahl der Noten`

Gewichteter Durchschnitt:

`Gewichteter Durchschnitt = Summe(Note × Gewichtung) / Summe aller Gewichtungen`

Beispiel für den einfachen Durchschnitt:
Noten 2,0, 1,0 und 3,0 ergeben:
`(2,0 + 1,0 + 3,0) / 3 = 2,0`

Beispiel für den gewichteten Durchschnitt:
Note 2,0 mit Gewichtung 2 und Note 3,0 mit Gewichtung 1 ergeben:
`(2,0 × 2 + 3,0 × 1) / 3 = 2,33`

Verwende für die Ausgabe `Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })` oder eine gleichwertige deutsche Formatierung.

Ergebnisbereich:
- Überschrift: „Dein Notendurchschnitt“
- Große Ergebniszahl
- Anzahl der berücksichtigten Noten
- Hinweis „Einfacher Durchschnitt“ oder „Gewichteter Durchschnitt“
- Disclaimer: „Das Ergebnis dient der Orientierung. Die offizielle Notenberechnung kann je nach Schule, Hochschule oder Prüfungsordnung abweichen.“

### 6.6 Informationsbereich mit originellen deutschen Texten
Füge sinnvolle, nicht bloß wiederholte Erklärungen hinzu:

#### H2: „Wie berechnet man den Notendurchschnitt?“
Erkläre in eigenen Worten den Unterschied zwischen einfachem und gewichtetem Durchschnitt.

#### H3: „Einfachen Notendurchschnitt berechnen“
Formel, nachvollziehbares Beispiel und Erklärung.

#### H3: „Gewichteten Notendurchschnitt berechnen“
Formel, Beispiel und Erklärung, wann Gewichtungen sinnvoll sind.

#### H3: „Das deutsche Schulnotensystem“
Erkläre vorsichtig das übliche System:
- 1 = sehr gut
- 2 = gut
- 3 = befriedigend
- 4 = ausreichend
- 5 = mangelhaft
- 6 = ungenügend

Ergänze, dass es abweichende Systeme und Sonderregeln gibt.

#### H3: „Ist der Notenrechner kostenlos?“
Erkläre, dass der Rechner kostenlos und ohne Registrierung nutzbar ist, sofern dies tatsächlich so umgesetzt wird.

#### H3: „Werden meine Noten gespeichert?“
Sage nur dann, dass Noten nicht an einen Server gesendet werden, wenn der Code keine Übertragung einbaut. Erkläre gegebenenfalls, dass der Hosting-Anbieter unabhängig davon technische Serverprotokolle verarbeiten kann.

### 6.7 FAQ-Bereich
Erstelle echte HTML-Fragen und Antworten, mindestens:
- „Kann ich Kommanoten eingeben?“
- „Was bedeutet eine gewichtete Note?“
- „Ist das Ergebnis meine offizielle Abschlussnote?“
- „Werden meine eingegebenen Noten gespeichert?“
- „Funktioniert der Notenrechner auf dem Smartphone?“

Die Antworten müssen sachlich, korrekt und auf Deutsch sein. Verwende FAQ-Inhalte nicht als Versprechen für ein Google-Rich-Result; die Anzeige strukturierter FAQ-Ergebnisse ist nicht garantiert.

### 6.8 Footer
Links:
- „Impressum“
- „Datenschutzerklärung“
- „Kontakt“

Copyright-Zeile mit aktuellem Jahr über JavaScript.

Keine fingierten Adressen, Telefonnummern oder Firmendaten.

## 7. SEO-Anforderungen

Setze diese technischen Grundlagen um:

### HTML-Metadaten
- `lang="de"` am HTML-Element.
- Sinnvoller, einzigartiger Seitentitel, beispielsweise:
  `Notendurchschnitt berechnen – Kostenloser Notenrechner | NotenPilot`
- Präzise Meta-Description, ungefähr 140–160 Zeichen als Orientierung, nicht als starre Google-Regel.
- `meta name="viewport"` korrekt.
- Canonical-Link erst mit der echten endgültigen Domain setzen. Keine Platzhalterdomain live ausliefern.
- Open-Graph-Titel und -Beschreibung.
- Semantische Struktur mit genau einer klaren Hauptüberschrift und sinnvoller H2/H3-Hierarchie.
- Aussagekräftige Linktexte.
- Kein Keyword-Stuffing.

### Keyword-Themen zur Recherche
Diese Begriffe sind Ideen und keine bestätigten Suchvolumen:
- Notendurchschnitt berechnen
- Notenrechner
- Note berechnen
- gewichteten Notendurchschnitt berechnen
- Notendurchschnitt Studium
- Schulnoten Durchschnitt berechnen

Schreibe natürlich. Verwende Keywords nur dort, wo sie inhaltlich passen. Recherchiere später mit geeigneten SEO-Werkzeugen die tatsächlichen Suchanfragen und Wettbewerber.

### Strukturierte Daten
- Optional `WebApplication` als JSON-LD mit zutreffenden Angaben verwenden.
- Keine Sternebewertungen, Reviews, Preise oder andere Eigenschaften erfinden.
- Valide JSON-LD-Auszeichnung garantiert weder eine besondere Darstellung noch bessere Rankings.

### robots.txt und sitemap.xml
- Erstelle `robots.txt`, das öffentlich zugängliche Seiten nicht versehentlich blockiert.
- Erstelle eine `sitemap.xml` mit den echten URLs der tatsächlich veröffentlichten Seiten.
- Verwende keine Beispiel-Domain im endgültigen Deployment.
- Aktualisiere Sitemap und Canonical-URLs nach Festlegung einer eigenen Domain.
- Eine Sitemap garantiert keine Indexierung.

### Google Search Console
README soll erklären:
1. Website veröffentlichen.
2. Property in Google Search Console hinzufügen.
3. Eigentümerschaft bestätigen.
4. Sitemap einreichen.
5. Indexierungsstatus und Suchanfragen beobachten.
6. Fehler und mobile Nutzbarkeit prüfen.

Vermeide Versprechen wie „Platz 1 bei Google“ oder „garantierter Traffic“.

## 8. Geschwindigkeit und technische Qualität
- Keine großen Frameworks oder unnötigen Abhängigkeiten.
- Keine automatisch ladenden Videos.
- Keine unnötigen externen Schriftarten.
- JavaScript so organisieren, dass die Website auch bei einfachen Browsern robust funktioniert.
- Alle Buttons mit dem richtigen `type` definieren.
- Labels korrekt mit Eingabefeldern verbinden.
- Fehlerzustände und Tastaturfokus gut sichtbar machen.
- Achte auf ausreichenden Farbkontrast.
- Respektiere `prefers-reduced-motion`, falls Animationen verwendet werden.
- Teste mindestens aktuelle Versionen von Chrome, Firefox, Edge und Safari sowie kleine Smartphone-Bildschirme.

## 9. Datenschutz und rechtliche Seiten

Erstelle drei separate deutsche HTML-Seiten als **auszufüllende Vorlagen**, keine angeblich fertige Rechtsberatung.

### `impressum.html`
- Erkläre im README, dass der Betreiber prüfen muss, welche Angaben nach den für ihn geltenden Gesetzen erforderlich sind.
- Verwende deutlich markierte Platzhalter für Name/Firma, ladungsfähige Anschrift und Kontaktangaben, soweit erforderlich.
- Veröffentliche die Seite nicht mit Platzhaltern.
- Erfinde keine Betreiberidentität.

### `datenschutz.html`
Beschreibe nur tatsächlich verwendete Dienste und Datenverarbeitungen:
- Hosting durch Cloudflare Pages und mögliche technische Serverprotokolle; Details anhand der aktuellen Anbieterunterlagen prüfen.
- Verarbeitung von Daten bei einer Kontaktaufnahme, sofern ein Kontaktformular oder eine E-Mail-Adresse bereitgestellt wird.
- Analytics erst ergänzen, wenn ein Dienst wirklich eingebunden ist.
- Werbedienste und AdSense erst beschreiben, wenn sie eingesetzt werden.
- Cookies, lokale Speicherung, externe Requests und Einwilligungen anhand der realen Implementierung prüfen.
- Betreiber, Kontakt, Rechtsgrundlagen, Speicherdauer, Empfänger und Betroffenenrechte sachgerecht ergänzen.
- Keine falsche Aussage „Wir erfassen keinerlei Daten“, wenn Hosting-Logs oder andere Dienste Daten verarbeiten können.

### `kontakt.html`
- Verwende keine erfundene E-Mail-Adresse.
- Zeige einen Platzhalter, den der Betreiber vor Veröffentlichung ersetzen muss.
- Falls ein Formular eingebaut wird, muss es serverseitig oder über einen bewusst ausgewählten Dienst verarbeitet werden. Baue kein scheinbar funktionierendes Formular ein, das Nachrichten nicht versendet.

### Rechtliche Prüfung
Weise darauf hin, dass der Betreiber die anwendbaren Vorschriften, einschließlich möglicher Impressums-, Datenschutz- und Cookie-/Consent-Pflichten, für sein konkretes Angebot prüfen sollte. Die Website darf keine rechtliche Konformität garantieren.

## 10. AdSense-Vorbereitung

Die Website soll für eine spätere Prüfung vorbereitet werden, aber zunächst keine echten Anzeigen laden.

Anforderungen:
- Keine Platzhalter, die wie echte Anzeigen aussehen und Nutzer täuschen.
- Keine Klickaufforderungen wie „Unterstütze uns durch Anzeigenklicks“.
- Keine künstlichen Klicks, gekauften Bots oder Traffic-Manipulation.
- Werbung darf später nicht mit Rechnerbuttons verwechselt werden und keine versehentlichen Klicks fördern.
- Keine Werbe-Skripte laden, bevor der Betreiber ein echtes Konto eingerichtet und die aktuellen Anforderungen geprüft hat.
- Vor einer Bewerbung originale, hilfreiche Inhalte, funktionierende Navigation, echte rechtliche Seiten und eine konsistente Nutzererfahrung sicherstellen.
- Prüfe die aktuellen offiziellen AdSense-Richtlinien und die für den jeweiligen Nutzerstandort geltenden Anforderungen.
- Eine Zulassung, bestimmte Einnahmen und ein bestimmtes RPM sind nicht garantiert.

Im README sollen Links auf die offiziellen Seiten aufgenommen werden:
- https://www.google.com/adsense/start/
- https://support.google.com/adsense/
- https://www.google.com/about/company/user-consent-policy/

## 11. Cloudflare Pages – Bereitstellung

Das Projekt muss ohne Build-Schritt bereitstellbar sein.

README auf Deutsch soll erklären:

1. Den Ordner `notenpilot` lokal anlegen.
2. Alle Projektdateien dort speichern.
3. `index.html` im Browser öffnen und den Rechner testen.
4. Ein kostenloses Cloudflare-Konto erstellen: https://dash.cloudflare.com/
5. Im Dashboard den Bereich „Workers & Pages“ öffnen.
6. Ein Pages-Projekt erstellen und den aktuellen Direct-Upload-Workflow nutzen oder alternativ ein Git-Repository verbinden.
7. Den veröffentlichten `pages.dev`-Link öffnen und die Website prüfen.
8. Rechtliche Platzhalter entfernen und echte Angaben ergänzen.
9. Bei eigener Domain Canonical-URL, Sitemap und gegebenenfalls `robots.txt` aktualisieren.
10. Google Search Console konfigurieren.

Die genaue Dashboard-Oberfläche kann sich ändern; verweise auf die offizielle Dokumentation:
https://developers.cloudflare.com/pages/

## 12. Qualitäts- und Funktionstests

Führe diese Tests durch und dokumentiere die Ergebnisse im README:

1. Zwei Noten 2,0 und 3,0 ergeben 2,50.
2. Noten 2,0, 1,0 und 3,0 ergeben 2,00.
3. Gewichtete Noten 2,0 mit Gewichtung 2 und 3,0 mit Gewichtung 1 ergeben 2,33.
4. Eingaben mit Dezimalkomma und Dezimalpunkt werden akzeptiert.
5. Note 0, Note 7, negative Werte, Buchstaben und leere Eingaben führen zu verständlichen Fehlermeldungen.
6. Eine Gewichtung von 0, ein leerer Wert oder ein negativer Wert wird im gewichteten Modus abgelehnt.
7. Zeilen hinzufügen und entfernen funktioniert.
8. Zurücksetzen stellt den ursprünglichen Zustand wieder her.
9. Nach einer Änderung wird ein altes Ergebnis nicht als aktuell ausgegeben.
10. Ergebnis kopieren funktioniert in unterstützten Browsern; bei Fehler erscheint ein hilfreicher Hinweis.
11. Die Website lässt sich mit der Tastatur bedienen.
12. Die Seite funktioniert bei 320 px Breite ohne horizontales Scrollen.
13. Alle internen Links funktionieren.
14. Es werden keine Noten an einen externen Server gesendet.
15. Keine nicht vorhandenen Seiten oder fingierten Kontaktdaten als fertig darstellen.

## 13. Abnahmekriterien

Das Projekt ist erst fertig, wenn:
- alle Dateien vollständig ausgegeben wurden;
- der Rechner tatsächlich funktioniert;
- alle sichtbaren Texte auf Deutsch sind;
- alle Formularfelder verständliche Labels haben;
- die mobile Darstellung geprüft wurde;
- SEO-Metadaten vorhanden sind;
- die rechtlichen Seiten als Vorlagen gekennzeichnet sind;
- keine falschen Versprechen zu Rankings, Rechtskonformität oder AdSense enthalten sind;
- Deployment-Anweisungen auf Deutsch vorhanden sind;
- der Code ohne Build-Schritt auf Cloudflare Pages läuft.

## 14. Gewünschtes Ergebnis von Google AI

Gib die Dateien einzeln mit klaren Dateinamen aus. Für jede Datei:
1. Zeige den vollständigen Inhalt, nicht nur Ausschnitte.
2. Prüfe, dass Dateiverweise und interne Links zusammenpassen.
3. Gib keine unvollständigen Funktionen mit Kommentaren wie „später implementieren“ aus, außer bei ausdrücklich gekennzeichneten Betreiber-Platzhaltern für rechtliche Angaben.
4. Erkläre am Ende auf Deutsch, wie ich das Projekt lokal teste und kostenlos auf Cloudflare Pages veröffentliche.
5. Erstelle keine erfundenen Suchvolumina, Einnahmeprognosen, Bewertungen oder Garantien.
