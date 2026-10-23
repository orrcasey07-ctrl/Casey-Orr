/**
 * NotenPilot - JavaScript Rechnerlogik
 * 
 * Vollständig clientseitig im Browser:
 * - Keine Datenübertragung an Server
 * - Deutsches Notensystem 1,0 bis 6,0
 * - Einfacher und gewichteter Notendurchschnitt
 * - Barrierearme Fehlermeldungen und Ankündigungen
 */

(function () {
  'use strict';

  // Konstanten
  const MIN_GRADE = 1.0;
  const MAX_GRADE = 6.0;
  const MIN_WEIGHT = 0.01;
  const MAX_WEIGHT = 100.0;

  // DOM Elemente
  const form = document.getElementById('grade-form');
  const gradesContainer = document.getElementById('grades-container');
  const addRowBtn = document.getElementById('add-row-btn');
  const resetBtn = document.getElementById('reset-btn');
  const weightedToggle = document.getElementById('weighted-toggle');
  const errorContainer = document.getElementById('error-container');
  const errorList = document.getElementById('error-list');
  const resultCard = document.getElementById('result-card');
  const resultNumber = document.getElementById('result-number');
  const resultBadge = document.getElementById('result-badge');
  const resultMetaChips = document.getElementById('result-meta-chips');
  const resultBreakdownContainer = document.getElementById('result-breakdown-container');
  const staleNotice = document.getElementById('stale-notice');
  const copyBtn = document.getElementById('copy-result-btn');
  const copyFeedback = document.getElementById('copy-feedback');
  const loadExampleBtn = document.getElementById('load-example-btn');
  const currentYearSpan = document.getElementById('current-year');

  // State
  let rowCounter = 0;
  let lastCalculatedResult = null;
  let isResultStale = false;

  // Aktuelles Jahr im Footer setzen
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear().toString();
  }

  /**
   * Parst Zahlen mit Komma oder Punkt
   */
  function parseGermanNumber(str) {
    if (typeof str !== 'string') return null;
    const cleaned = str.trim().replace(',', '.');
    if (cleaned === '') return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  /**
   * Formatiert Zahlen auf 2 Nachkommastellen nach deutscher Norm
   */
  function formatGermanNumber(num, fractionDigits = 2) {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(num);
  }

  /**
   * Ermittelt die verbale Notenbezeichnung
   */
  function getVerbalRating(avg) {
    if (avg <= 1.5) return 'Sehr gut';
    if (avg <= 2.5) return 'Gut';
    if (avg <= 3.5) return 'Befriedigend';
    if (avg <= 4.0) return 'Ausreichend';
    if (avg <= 5.0) return 'Mangelhaft';
    return 'Ungenügend';
  }

  /**
   * Erstellt eine neue Notenzeile im DOM
   */
  function createGradeRow(initialSubject = '', initialGrade = '', initialWeight = '1', triggerStale = true) {
    rowCounter += 1;
    const id = rowCounter;

    const row = document.createElement('div');
    row.className = 'grade-row';
    row.dataset.rowId = id.toString();

    const isWeighted = weightedToggle.checked;

    row.innerHTML = `
      <div class="field-group">
        <label for="subject-${id}" class="mobile-label">Fach (optional)</label>
        <input
          type="text"
          id="subject-${id}"
          name="subject"
          class="form-input subject-input"
          placeholder="z. B. Mathematik"
          value="${escapeHtml(initialSubject)}"
          aria-label="Fachname Zeile ${id} (optional)"
        >
      </div>
      <div class="field-group">
        <label for="grade-${id}" class="mobile-label">Note * (1,0 - 6,0)</label>
        <input
          type="text"
          inputmode="decimal"
          id="grade-${id}"
          name="grade"
          class="form-input grade-input"
          placeholder="z. B. 2,0"
          value="${escapeHtml(initialGrade)}"
          required
          aria-required="true"
          aria-label="Note für Zeile ${id} (erlaubt sind Werte von 1,0 bis 6,0)"
        >
      </div>
      <div class="field-group">
        <label for="weight-${id}" class="mobile-label">Gewichtung</label>
        <input
          type="number"
          step="any"
          min="0.1"
          max="100"
          id="weight-${id}"
          name="weight"
          class="form-input weight-input"
          placeholder="1"
          value="${escapeHtml(initialWeight)}"
          ${isWeighted ? '' : 'disabled'}
          aria-label="Gewichtung für Zeile ${id}"
        >
      </div>
      <div class="delete-col">
        <button
          type="button"
          class="btn-icon-danger remove-row-btn"
          title="Zeile entfernen"
          aria-label="Zeile ${id} löschen"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `;

    // Event Listener für Änderungen -> Ergebnis veraltet markieren
    const inputs = row.querySelectorAll('input');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        input.classList.remove('input-error');
        markResultAsStale();
      });
    });

    // Entfernen-Button Event
    const removeBtn = row.querySelector('.remove-row-btn');
    removeBtn.addEventListener('click', () => {
      removeGradeRow(row);
    });

    gradesContainer.appendChild(row);
    updateRemoveButtonsState();
    if (triggerStale) {
      markResultAsStale();
    }
    return row;
  }

  /**
   * Entfernt eine Notenzeile und behält den Fokus bei
   */
  function removeGradeRow(rowElement) {
    const rows = Array.from(gradesContainer.querySelectorAll('.grade-row'));
    if (rows.length <= 1) {
      showError(['Es muss mindestens eine Notenzeile im Rechner vorhanden sein.']);
      return;
    }

    const currentIndex = rows.indexOf(rowElement);
    rowElement.remove();
    updateRemoveButtonsState();
    markResultAsStale();

    // Fokus auf vorherige Zeile setzen, um Focusverlust zu verhindern
    const remainingRows = gradesContainer.querySelectorAll('.grade-row');
    if (remainingRows.length > 0) {
      const targetIndex = Math.max(0, currentIndex - 1);
      const targetInput = remainingRows[targetIndex].querySelector('.grade-input');
      if (targetInput) {
        targetInput.focus();
      }
    }
  }

  /**
   * Aktualisiert Zeilen-Nummerierung, Buttons und ARIA-Attribute konsistent
   */
  function updateRemoveButtonsState() {
    const rows = gradesContainer.querySelectorAll('.grade-row');
    const isOnlyOne = rows.length <= 1;

    rows.forEach((row, idx) => {
      const rowNum = idx + 1;
      const removeBtn = row.querySelector('.remove-row-btn');
      const subjectInput = row.querySelector('.subject-input');
      const gradeInput = row.querySelector('.grade-input');
      const weightInput = row.querySelector('.weight-input');

      if (subjectInput) {
        subjectInput.setAttribute('aria-label', `Fachname Zeile ${rowNum} (optional)`);
      }
      if (gradeInput) {
        gradeInput.setAttribute('aria-label', `Note für Zeile ${rowNum} (erlaubt sind Werte von 1,0 bis 6,0)`);
      }
      if (weightInput) {
        weightInput.setAttribute('aria-label', `Gewichtung für Zeile ${rowNum}`);
      }

      if (removeBtn) {
        removeBtn.disabled = isOnlyOne;
        removeBtn.setAttribute('aria-label', `Zeile ${rowNum} löschen`);
        if (isOnlyOne) {
          removeBtn.setAttribute('title', 'Mindestens eine Notenzeile erforderlich');
        } else {
          removeBtn.setAttribute('title', `Zeile ${rowNum} entfernen`);
        }
      }
    });
  }

  /**
   * Markiert das aktuell sichtbare Ergebnis als nicht mehr aktuell
   */
  function markResultAsStale() {
    if (lastCalculatedResult && !isResultStale) {
      isResultStale = true;
      if (resultCard && !resultCard.hidden) {
        resultCard.classList.add('is-stale');
      }
      if (staleNotice) {
        staleNotice.hidden = false;
      }
    }
  }

  /**
   * Schaltet Gewichtungsfelder aktiv/inaktiv
   */
  function handleWeightedToggle() {
    const isWeighted = weightedToggle.checked;
    const weightInputs = gradesContainer.querySelectorAll('.weight-input');

    weightInputs.forEach((input) => {
      input.disabled = !isWeighted;
      if (isWeighted && (!input.value || input.value.trim() === '')) {
        input.value = '1';
      }
    });

    markResultAsStale();
  }

  /**
   * Zeigt Fehlermeldungen barrierearm an
   */
  function showError(errors) {
    if (!errorContainer || !errorList) return;

    errorList.innerHTML = '';
    errors.forEach((msg) => {
      const li = document.createElement('li');
      li.textContent = msg;
      errorList.appendChild(li);
    });

    errorContainer.hidden = false;
    errorContainer.focus();
  }

  /**
   * Versteckt Fehlermeldungen
   */
  function clearErrors() {
    if (!errorContainer || !errorList) return;
    errorList.innerHTML = '';
    errorContainer.hidden = true;

    // Rote Rahmen von Eingabefeldern entfernen
    const errorInputs = gradesContainer.querySelectorAll('.input-error');
    errorInputs.forEach((el) => el.classList.remove('input-error'));
  }

  /**
   * Validiert Eingaben und berechnet den Durchschnitt
   */
  function calculateAverage(event) {
    if (event) {
      event.preventDefault();
    }

    clearErrors();

    const isWeighted = weightedToggle.checked;
    const rows = gradesContainer.querySelectorAll('.grade-row');
    const errors = [];
    const parsedData = [];

    if (rows.length === 0) {
      showError(['Bitte füge mindestens eine Notenzeile hinzu.']);
      return;
    }

    rows.forEach((row, idx) => {
      const rowNum = idx + 1;
      const subjectInput = row.querySelector('.subject-input');
      const gradeInput = row.querySelector('.grade-input');
      const weightInput = row.querySelector('.weight-input');

      const subject = (subjectInput.value || '').trim() || `Fach ${rowNum}`;
      const rawGrade = (gradeInput.value || '').trim();

      if (rawGrade === '') {
        errors.push(`Zeile ${rowNum} (${subject}): Bitte gib eine Note ein.`);
        gradeInput.classList.add('input-error');
        return;
      }

      const parsedGrade = parseGermanNumber(rawGrade);
      if (parsedGrade === null) {
        errors.push(`Zeile ${rowNum} (${subject}): "${rawGrade}" ist keine gültige Note. Erlaubt sind Werte von 1,0 bis 6,0.`);
        gradeInput.classList.add('input-error');
        return;
      }

      if (parsedGrade < MIN_GRADE || parsedGrade > MAX_GRADE) {
        errors.push(`Zeile ${rowNum} (${subject}): Die Note ${formatGermanNumber(parsedGrade)} liegt außerhalb des zulässigen Bereichs von 1,0 bis 6,0.`);
        gradeInput.classList.add('input-error');
        return;
      }

      let parsedWeight = 1.0;
      if (isWeighted) {
        const rawWeight = (weightInput.value || '').trim();
        if (rawWeight === '') {
          errors.push(`Zeile ${rowNum} (${subject}): Bitte gib eine Gewichtung ein.`);
          weightInput.classList.add('input-error');
          return;
        }

        const numWeight = parseGermanNumber(rawWeight);
        if (numWeight === null || numWeight <= 0) {
          errors.push(`Zeile ${rowNum} (${subject}): Die Gewichtung muss größer als 0 sein (z. B. 1 oder 2).`);
          weightInput.classList.add('input-error');
          return;
        }

        if (numWeight > MAX_WEIGHT) {
          errors.push(`Zeile ${rowNum} (${subject}): Die Gewichtung darf maximal ${MAX_WEIGHT} betragen.`);
          weightInput.classList.add('input-error');
          return;
        }

        parsedWeight = numWeight;
      }

      parsedData.push({
        index: rowNum,
        subject,
        grade: parsedGrade,
        weight: parsedWeight,
      });
    });

    if (errors.length > 0) {
      showError(errors);
      hideResult();
      return;
    }

    if (parsedData.length === 0) {
      showError(['Es wurden keine gültigen Noten eingegeben.']);
      hideResult();
      return;
    }

    let totalWeight = 0;
    let weightedSum = 0;

    for (const item of parsedData) {
      weightedSum += item.grade * item.weight;
      totalWeight += item.weight;
    }

    if (totalWeight <= 0) {
      showError(['Die Summe aller Gewichtungen muss größer als 0 sein.']);
      hideResult();
      return;
    }

    const average = weightedSum / totalWeight;
    const formattedAvg = formatGermanNumber(average, 2);
    const rating = getVerbalRating(average);

    lastCalculatedResult = {
      average,
      formattedAverage: formattedAvg,
      rating,
      count: parsedData.length,
      isWeighted,
      totalWeight,
      breakdown: parsedData,
    };

    isResultStale = false;
    displayResult(lastCalculatedResult);
  }

  /**
   * Stellt das Ergebnis im DOM dar
   */
  function displayResult(res) {
    if (!resultCard) return;

    resultCard.classList.remove('is-stale');
    if (staleNotice) {
      staleNotice.hidden = true;
    }

    resultNumber.textContent = res.formattedAverage;
    resultBadge.textContent = res.rating;

    // Meta-Chips
    resultMetaChips.innerHTML = `
      <span class="chip">${res.isWeighted ? 'Gewichteter Durchschnitt' : 'Einfacher Durchschnitt'}</span>
      <span class="chip">${res.count} ${res.count === 1 ? 'Note' : 'Noten'}</span>
      ${res.isWeighted ? `<span class="chip">Gesamtgewicht: ${formatGermanNumber(res.totalWeight, 2)}</span>` : ''}
    `;

    // Breakdown-Tabelle
    let breakdownHtml = `
      <table class="breakdown-table" aria-label="Notenübersicht der Berechnung">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Fach</th>
            <th scope="col">Note</th>
            ${res.isWeighted ? '<th scope="col">Gewichtung</th>' : ''}
          </tr>
        </thead>
        <tbody>
    `;

    res.breakdown.forEach((item, idx) => {
      breakdownHtml += `
        <tr>
          <td>${idx + 1}</td>
          <td>${escapeHtml(item.subject)}</td>
          <td><strong>${formatGermanNumber(item.grade, 2)}</strong></td>
          ${res.isWeighted ? `<td>${formatGermanNumber(item.weight, 2)}</td>` : ''}
        </tr>
      `;
    });

    breakdownHtml += `
        </tbody>
      </table>
    `;

    resultBreakdownContainer.innerHTML = breakdownHtml;

    resultCard.hidden = false;

    // Sanfter Scroll zum Ergebnis
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Versteckt das Ergebnis
   */
  function hideResult() {
    if (resultCard) {
      resultCard.hidden = true;
    }
    if (staleNotice) {
      staleNotice.hidden = true;
    }
    lastCalculatedResult = null;
    isResultStale = false;
  }

  /**
   * Setzt den Rechner auf 2 leere Zeilen zurück
   */
  function resetCalculator() {
    clearErrors();
    hideResult();
    gradesContainer.innerHTML = '';
    rowCounter = 0;
    weightedToggle.checked = false;

    // Ausgangszustand: zwei leere Notenzeilen
    createGradeRow('', '', '1', false);
    createGradeRow('', '', '1', false);

    // Fokus auf die erste Zeile
    const firstInput = gradesContainer.querySelector('.grade-input');
    if (firstInput) {
      firstInput.focus();
    }
  }

  /**
   * Kopiert das berechnete Ergebnis in die Zwischenablage
   */
  async function copyResultToClipboard() {
    if (!lastCalculatedResult) {
      showError(['Es liegt noch kein berechnetes Ergebnis zum Kopieren vor.']);
      return;
    }

    const res = lastCalculatedResult;
    const typeStr = res.isWeighted ? 'Gewichteter Notendurchschnitt' : 'Einfacher Notendurchschnitt';
    const lines = [
      `NotenPilot – ${typeStr}: ${res.formattedAverage} (${res.rating})`,
      `Berücksichtigte Noten: ${res.count}`,
    ];

    if (res.isWeighted) {
      lines.push(`Gesamtgewichtung: ${formatGermanNumber(res.totalWeight, 2)}`);
    }

    lines.push('\nFächerübersicht:');
    res.breakdown.forEach((b) => {
      if (res.isWeighted) {
        lines.push(` • ${b.subject}: Note ${formatGermanNumber(b.grade, 2)} (Gewichtung: ${formatGermanNumber(b.weight, 2)})`);
      } else {
        lines.push(` • ${b.subject}: Note ${formatGermanNumber(b.grade, 2)}`);
      }
    });

    lines.push('\nBerechnet mit NotenPilot (kostenlos & ohne Registrierung).');
    const textToCopy = lines.join('\n');

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        showCopySuccess();
      } else {
        fallbackCopyTextToClipboard(textToCopy);
      }
    } catch (err) {
      fallbackCopyTextToClipboard(textToCopy);
    }
  }

  /**
   * Fallback-Kopieren für ältere Browser oder restriktive Kontexte
   */
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        showCopySuccess();
      } else {
        showError(['Kopieren nicht unterstützt. Bitte kopiere das Ergebnis manuell.']);
      }
    } catch (err) {
      document.body.removeChild(textArea);
      showError(['Kopieren nicht möglich. Bitte markiere den Text manuell.']);
    }
  }

  /**
   * Zeigt kurzes visuelles Feedback nach dem Kopieren
   */
  function showCopySuccess() {
    if (!copyFeedback) return;
    copyFeedback.hidden = false;
    setTimeout(() => {
      copyFeedback.hidden = true;
    }, 3000);
  }

  /**
   * Hilfsfunktion zum Escapen von HTML-Strings
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Lädt ein typisches Notenbeispiel zum schnellen Testen
   */
  function loadExample() {
    clearErrors();
    hideResult();
    gradesContainer.innerHTML = '';
    rowCounter = 0;
    weightedToggle.checked = true;
    handleWeightedToggle();

    createGradeRow('Mathematik', '2,0', '2', false);
    createGradeRow('Deutsch', '1,7', '1', false);
    createGradeRow('Englisch', '2,3', '1', false);

    calculateAverage();
  }

  // Initialisierung
  function init() {
    // Start mit zwei Notenzeilen
    createGradeRow('', '', '1', false);
    createGradeRow('', '', '1', false);

    // Event Listener binden
    if (addRowBtn) {
      addRowBtn.addEventListener('click', () => {
        const newRow = createGradeRow();
        if (newRow) {
          const gradeInput = newRow.querySelector('.grade-input');
          if (gradeInput) {
            gradeInput.focus();
          }
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', resetCalculator);
    }

    if (loadExampleBtn) {
      loadExampleBtn.addEventListener('click', loadExample);
    }

    if (weightedToggle) {
      weightedToggle.addEventListener('change', handleWeightedToggle);
    }

    if (form) {
      form.addEventListener('submit', calculateAverage);
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', copyResultToClipboard);
    }
  }

  // DOM bereitstellen
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
