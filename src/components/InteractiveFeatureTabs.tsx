import React, { useState } from 'react';
import {
  Calculator,
  BookOpen,
  LineChart,
  Calendar,
  Layers,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface InteractiveFeatureTabsProps {
  onSelectAction: (tabKey: string) => void;
}

export const InteractiveFeatureTabs: React.FC<InteractiveFeatureTabsProps> = ({ onSelectAction }) => {
  const [activeTab, setActiveTab] = useState<'calc' | 'notes' | 'planner'>('calc');

  return (
    <div className="w-full">
      {/* Segmented Tab Controls */}
      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex p-1 rounded-2xl bg-[#111412] border border-[#292F2B] max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('calc')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'calc'
                ? 'bg-[#171B18] text-white border border-[#292F2B] shadow-lg shadow-black/40'
                : 'text-[#A4AAA5] hover:text-white'
            }`}
          >
            <Calculator className={`w-4 h-4 ${activeTab === 'calc' ? 'text-[#C5F82A]' : ''}`} />
            <span>Noten berechnen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'notes'
                ? 'bg-[#171B18] text-white border border-[#292F2B] shadow-lg shadow-black/40'
                : 'text-[#A4AAA5] hover:text-white'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'notes' ? 'text-[#C5F82A]' : ''}`} />
            <span>Lernnotizen verwalten</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'planner'
                ? 'bg-[#171B18] text-white border border-[#292F2B] shadow-lg shadow-black/40'
                : 'text-[#A4AAA5] hover:text-white'
            }`}
          >
            <LineChart className={`w-4 h-4 ${activeTab === 'planner' ? 'text-[#C5F82A]' : ''}`} />
            <span>Fortschritt & Ziele</span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="relative rounded-3xl bg-[#111412] border border-[#292F2B] p-6 sm:p-10 overflow-hidden">
        {/* Subtle radial ambient spotlight */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(197,248,42,0.06),transparent_70%)] pointer-events-none" />

        {activeTab === 'calc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A]">
                01 · SCHULNOTENSYSTEM & OBERSTUFE
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                Punktgenauer Durchschnitt für Schule, Abitur und Studium
              </h3>
              <p className="text-sm text-[#A4AAA5] leading-relaxed">
                Egal ob Schulnoten von 1,0 bis 6,0 oder die gymnasiale 15-Punkte-Skala der Oberstufe: NotenPilot rechnet einfach oder gewichtet und prüft automatisch auf Unterkurs-Defizite nach KMK-Standard.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-[#A4AAA5]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                  <span>Unterstützt Komma (z. B. 2,3) und Punkt (z. B. 2.3)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                  <span>Zielnoten-Rechner: Finde heraus, welche Note du in der nächsten Klausur brauchst</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                  <span>Kostenlos ohne Registrierung oder mit Cloud-Speicher</span>
                </li>
              </ul>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onSelectAction('calculator')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#090B0A] hover:bg-[#C5F82A] text-xs sm:text-sm font-bold transition-all duration-300"
                >
                  <span>Jetzt Noten berechnen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Preview Mock */}
            <div className="lg:col-span-6 bg-[#171B18] rounded-2xl border border-[#292F2B] p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#292F2B] text-xs">
                <span className="font-mono text-[#A4AAA5]">Berechnungsbeispiel</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#C5F82A]/10 text-[#C5F82A] border border-[#C5F82A]/20">
                  Abitur LK / GK
                </span>
              </div>
              <div className="space-y-2 mt-4 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#090B0A]/60 border border-[#292F2B]/60">
                  <span className="text-white">Mathematik (Leistungskurs)</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#A4AAA5]">Gewicht: 2</span>
                    <span className="text-[#C5F82A] font-bold">13 P (1-)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#090B0A]/60 border border-[#292F2B]/60">
                  <span className="text-white">Deutsch (Grundkurs)</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#A4AAA5]">Gewicht: 1</span>
                    <span className="text-white font-bold">11 P (2)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#090B0A]/60 border border-[#292F2B]/60">
                  <span className="text-white">Englisch (Leistungskurs)</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#A4AAA5]">Gewicht: 2</span>
                    <span className="text-[#C5F82A] font-bold">12 P (2+)</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#292F2B] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#A4AAA5] uppercase tracking-wider font-mono">
                    Gewichteter Abitur-Schnitt
                  </div>
                  <div className="text-2xl font-black text-white font-mono flex items-center gap-2">
                    <span>1,60</span>
                    <span className="text-xs text-[#C5F82A] font-sans font-semibold px-2 py-0.5 rounded bg-[#C5F82A]/10">
                      Gut (2)
                    </span>
                  </div>
                </div>
                <span className="text-xs text-[#A4AAA5] font-mono">Ø 12,20 Punkte</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A]">
                02 · CLOUD-NOTIZEN MIT DEBOUNCED AUTOSAVE
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                Unterrichtsnotizen & Formelsammlungen zentral organisieren
              </h3>
              <p className="text-sm text-[#A4AAA5] leading-relaxed">
                Verliere nie wieder den Überblick über Hausaufgaben, Klausurinhalte oder Definitionen. Deine Notizen werden verschlüsselt in Supabase mit strikter Row Level Security gespeichert.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-[#A4AAA5]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                  <span>Automatische Echtzeitspeicherung beim Tippen</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                  <span>Fächerfilter & blitzschnelle Volltextsuche</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                  <span>Wichtige Einträge mit einem Klick ganz oben anpinnen</span>
                </li>
              </ul>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onSelectAction('notes')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#090B0A] hover:bg-[#C5F82A] text-xs sm:text-sm font-bold transition-all duration-300"
                >
                  <span>Zu den Lernnotizen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Preview Mock */}
            <div className="lg:col-span-6 bg-[#171B18] rounded-2xl border border-[#292F2B] p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#292F2B] text-xs">
                <span className="font-mono text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C5F82A]" />
                  Biologie: Zellatmung & ATP-Synthese
                </span>
                <span className="text-[10px] text-[#A4AAA5] font-mono">Angepinnt</span>
              </div>
              <div className="mt-3 p-3.5 rounded-xl bg-[#090B0A]/70 border border-[#292F2B]/60 font-mono text-xs text-[#A4AAA5] leading-relaxed">
                <p className="text-white font-semibold mb-1">Klausurrelevante Schwerpunkte:</p>
                <p className="mb-2">1. Glykolyse im Cytoplasma (2 ATP Nettogewinn)</p>
                <p className="mb-2">2. Citratzyklus in der Mitochondrienmatrix</p>
                <p className="text-[#C5F82A]">3. Endoxidation an der inneren Membran (ca. 30–32 ATP)</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#A4AAA5]">
                <span>Zuletzt gespeichert: vor 3 Minuten</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> Cloud synchronisiert
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A]">
                03 · EXAM PLANNER, FLASHCARDS & TIMER
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                Lernplan, interaktive Karteikarten & Pomodoro Fokus-Timer
              </h3>
              <p className="text-sm text-[#A4AAA5] leading-relaxed">
                Plane Klausuren mit automatischem Tages-Countdown, erstelle digitale Karteikarten mit 3D-Flip-Modus und lerne in wissenschaftlich bewährten 25-Minuten-Intervallen mit akustischem Signal.
              </p>
              <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-[#A4AAA5]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                  <span>Countdown bis zur nächsten Schulaufgabe / Klausur</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                  <span>Karteikarten-Lernbox mit &quot;Gewusst&quot; und &quot;Noch üben&quot;</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                  <span>Integrierter Pomodoro-Timer mit Web Audio Chime</span>
                </li>
              </ul>
              <div className="pt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => onSelectAction('planner')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#090B0A] hover:bg-[#C5F82A] text-xs sm:text-sm font-bold transition-all duration-300"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Klausurenplan</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAction('flashcards')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171B18] text-white hover:text-[#C5F82A] border border-[#292F2B] text-xs sm:text-sm font-semibold transition-all duration-300"
                >
                  <Layers className="w-4 h-4" />
                  <span>Karteikarten</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAction('timer')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171B18] text-white hover:text-[#C5F82A] border border-[#292F2B] text-xs sm:text-sm font-semibold transition-all duration-300"
                >
                  <Clock className="w-4 h-4" />
                  <span>Fokus-Timer</span>
                </button>
              </div>
            </div>

            {/* Interactive Preview Mock */}
            <div className="lg:col-span-6 bg-[#171B18] rounded-2xl border border-[#292F2B] p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#292F2B] text-xs font-mono">
                <span className="text-white">Anstehende Klausur</span>
                <span className="text-[#C5F82A]">Noch 4 Tage</span>
              </div>
              <div className="mt-3 p-4 rounded-xl bg-[#090B0A]/70 border border-[#292F2B]/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-sm">Mathematik Klausur #2</span>
                  <span className="text-xs text-[#A4AAA5] font-mono">Do, 12. Nov</span>
                </div>
                <div className="w-full bg-[#171B18] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#C5F82A] h-full w-3/4 transition-all duration-500" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#A4AAA5] pt-1">
                  <span>3 von 4 Lernaufgaben erledigt</span>
                  <span className="text-white font-mono">75%</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#090B0A]/60 border border-[#292F2B]/60 text-center">
                  <span className="text-[10px] text-[#A4AAA5] block">FOKUSZEIT HEUTE</span>
                  <span className="text-white font-bold text-sm">50 Min</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#090B0A]/60 border border-[#292F2B]/60 text-center">
                  <span className="text-[10px] text-[#A4AAA5] block">GELERNTE KARTEN</span>
                  <span className="text-[#C5F82A] font-bold text-sm">24 Vokabeln</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
