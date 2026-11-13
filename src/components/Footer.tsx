import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  FileText,
  Mail,
  Heart,
  ArrowUpRight,
  Calculator,
} from 'lucide-react';

interface FooterProps {
  onNavigateTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="bg-[#090B0A] text-[#A4AAA5] border-t border-[#292F2B] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-[radial-gradient(ellipse_at_bottom,rgba(197,248,42,0.03),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-extrabold text-xl tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-[#171B18] border border-[#292F2B] flex items-center justify-center text-[#C5F82A]">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>
                Noten<span className="text-[#C5F82A]">Pilot</span>
              </span>
            </div>
            <p className="text-sm text-[#A4AAA5] max-w-sm leading-relaxed">
              Deine Noten. Dein Überblick. Deine Zukunft. Der kostenlose Notenrechner, Notenspiegel und Lernbegleiter für Schülerinnen, Schüler und Studierende in Deutschland.
            </p>
            <div className="text-xs text-[#A4AAA5]/70 font-mono flex items-center gap-1.5 pt-1">
              <span>Entwickelt für den deutschen Schul- &amp; Studienalltag</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Werkzeuge
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('calculator')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Notenrechner (1,0 - 6,0)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('calculator')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Oberstufen-Rechner (0-15 P)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('calculator')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Zielnoten-Planer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('notes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Lernnotizen (Cloud)
                </button>
              </li>
            </ul>
          </div>

          {/* Study Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Lernsystem
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('planner')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Klausuren- &amp; Aufgabenplaner
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('flashcards')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Karteikarten &amp; Lernbox
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('timer')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pomodoro Fokus-Timer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('subjects')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Fächerübersicht &amp; Notenspiegel
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Rechtliches
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a
                  href="/impressum.html"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Impressum</span>
                </a>
              </li>
              <li>
                <a
                  href="/datenschutz.html"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Datenschutzerklärung</span>
                </a>
              </li>
              <li>
                <a
                  href="/kontakt.html"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kontakt</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 border-t border-[#292F2B] text-xs text-[#A4AAA5]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; {new Date().getFullYear()} NotenPilot. Alle Berechnungen ohne Gewähr. Prüfungsordnungen der Bundesländer und Hochschulen sind maßgeblich.
          </p>
          <div className="flex items-center gap-3">
            <a href="/datenschutz.html" className="hover:text-white transition-colors">
              DSGVO-konform
            </a>
            <span>&bull;</span>
            <a href="/impressum.html" className="hover:text-white transition-colors">
              Rechtliche Hinweise
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
