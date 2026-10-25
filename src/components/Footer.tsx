import React from 'react';
import { Calculator, ShieldCheck, FileText, Mail, Heart } from 'lucide-react';

interface FooterProps {
  onNavigateTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Calculator className="w-5 h-5" />
              </div>
              <span>NotenPilot</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Dein kostenloser deutscher Notenrechner, Notenspiegel und Lernplaner. Berechne deinen gewichteten Notendurchschnitt für Schule, Abitur und Universität – blitzschnell und datensparsam.
            </p>
            <div className="text-xs text-slate-500">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 inline mx-0.5" /> für Schüler und Studierende in Deutschland.
            </div>
          </div>

          {/* Quick Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Funktionen</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigateTab?.('calculator')}
                  className="hover:text-white transition-colors"
                >
                  Notenrechner (Kostenlos)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('notes')}
                  className="hover:text-white transition-colors"
                >
                  Lernnotizen & Cloud-Speicher
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('planner')}
                  className="hover:text-white transition-colors"
                >
                  Klausuren- & Aufgabenplaner
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('flashcards')}
                  className="hover:text-white transition-colors"
                >
                  Karteikarten & Lernbox
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab?.('timer')}
                  className="hover:text-white transition-colors"
                >
                  Pomodoro Fokus-Timer
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Rechtliches</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/impressum.html"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  Impressum
                </a>
              </li>
              <li>
                <a
                  href="/datenschutz.html"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  Datenschutzerklärung
                </a>
              </li>
              <li>
                <a
                  href="/kontakt.html"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  Kontakt & Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; {new Date().getFullYear()} NotenPilot. Alle Angaben und Berechnungen ohne Gewähr. Prüfungsordnungen der Bundesländer und Universitäten sind maßgeblich.
          </p>
          <div className="flex items-center gap-4">
            <a href="/datenschutz.html" className="hover:text-slate-400 transition-colors">DSGVO-konform</a>
            <span>&bull;</span>
            <a href="/impressum.html" className="hover:text-slate-400 transition-colors">Rechtliche Hinweise</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
