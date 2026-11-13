import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Was ist NotenPilot?',
    answer:
      'NotenPilot ist eine moderne, kostenlose Lern- und Notenplattform speziell für Schülerinnen, Schüler und Studierende in Deutschland. Die Plattform bietet präzise Durchschnittsrechner (1,0–6,0 & 0–15 Punkte Oberstufe), Zielnotenplanung, Cloud-Lernnotizen, einen Klausurenplaner, interaktive Karteikarten sowie einen integrierten Pomodoro-Fokustimer.',
  },
  {
    question: 'Ist NotenPilot wirklich 100% kostenlos?',
    answer:
      'Ja, NotenPilot ist und bleibt für Schülerinnen und Schüler komplett kostenlos. Alle Kernfunktionen wie Notenberechnung, Fächerübersicht, Lernnotizen und der Fokus-Timer sind frei zugänglich ohne versteckte Kosten oder Abo-Fallen.',
  },
  {
    question: 'Wie funktioniert die Notenberechnung (einfach vs. gewichtet)?',
    answer:
      'Beim einfachen Notenschnitt zählen alle Noten zu gleichen Teilen (Summe der Noten geteilt durch die Anzahl). Bei der gewichteten Berechnung fließen Hauptfächer, Leistungskurse oder Klausuren stärker ein (z. B. Gewichtung 2 = doppelt so stark wie eine mündliche Note mit Gewichtung 1). In der Oberstufe wird automatisch der Punkteschnitt berechnet und nach der offiziellen KMK-Formel in die Abitur-Dezimalnote umgewandelt.',
  },
  {
    question: 'Kann ich meine Noten und Lernnotizen dauerhaft speichern?',
    answer:
      'Ja! Wenn du dich kostenlos mit deiner E-Mail-Adresse anmeldest, werden deine Berechnungen, Fächer, Klausurtermine und Lernnotizen sicher in deiner persönlichen NotenPilot-Cloud gespeichert. So hast du von jedem Smartphone, Tablet oder Computer aus sofort Zugriff.',
  },
  {
    question: 'Benötige ich zwingend ein Benutzerkonto, um Noten zu berechnen?',
    answer:
      'Nein. Du kannst NotenPilot sofort im Gast-Modus ohne jede Registrierung nutzen. Die Berechnung läuft dann zu 100% lokal im Arbeitsspeicher deines Browsers und speichert keine Daten auf unseren Servern.',
  },
  {
    question: 'Sind meine gespeicherten Notizen und Daten geschützt?',
    answer:
      'Ja, NotenPilot setzt auf strenge DSGVO-Konformität und das moderne Supabase-Backend mit aktivierter Row Level Security (RLS). Deine Daten sind auf Transportebene verschlüsselt und technisch ausschließlich für deine eigene authentifizierte Benutzer-ID (auth.uid()) les- und beschreibbar.',
  },
];

export const GrainzFaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              isOpen
                ? 'bg-[#171B18] border-[#292F2B] shadow-lg shadow-black/30'
                : 'bg-[#111412] border-[#292F2B]/60 hover:border-[#292F2B]'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base font-semibold text-white tracking-tight">
                {item.question}
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  isOpen
                    ? 'bg-[#C5F82A] text-[#090B0A] border-[#C5F82A] rotate-180'
                    : 'bg-[#171B18] text-[#A4AAA5] border-[#292F2B]'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {isOpen && (
              <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#A4AAA5] leading-relaxed border-t border-[#292F2B]/50 animate-fadeIn">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
