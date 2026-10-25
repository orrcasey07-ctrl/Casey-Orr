import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogIn, LogOut, User, LayoutDashboard, Calculator, BookOpen, Calendar, Layers, Clock } from 'lucide-react';

export type ActiveTab = 'calculator' | 'dashboard' | 'notes' | 'subjects' | 'planner' | 'flashcards' | 'timer';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openAuthModal }) => {
  const { user, profile, signOut, isConfigured } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('calculator')}
              className="flex items-center gap-2.5 text-left text-primary font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-slate-900">
                Noten<span className="text-primary">Pilot</span>
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'calculator'
                  ? 'bg-primary-light text-primary font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Notenrechner
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'planner'
                  ? 'bg-primary-light text-primary font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Lernplan
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'flashcards'
                  ? 'bg-primary-light text-primary font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              Karteikarten
            </button>

            <button
              onClick={() => setActiveTab('timer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'timer'
                  ? 'bg-primary-light text-primary font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              Fokus-Timer
            </button>

            {user ? (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === 'dashboard'
                      ? 'bg-primary-light text-primary font-semibold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Übersicht
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === 'notes'
                      ? 'bg-primary-light text-primary font-semibold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Notizen
                </button>

                <button
                  onClick={() => setActiveTab('subjects')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === 'subjects'
                      ? 'bg-primary-light text-primary font-semibold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Fächer & Noten
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'notes'
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Notizen
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions (Auth status / CTA) */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-lg text-xs text-slate-700">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium max-w-[140px] truncate">
                    {profile?.display_name || user.email?.split('@')[0]}
                  </span>
                  {!isConfigured && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                      Demo
                    </span>
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  title="Abmelden"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Abmelden</span>
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" />
                <span>Schüler-Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-100 text-xs font-medium no-scrollbar">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'calculator' ? 'bg-primary-light text-primary font-bold' : 'text-slate-600'
            }`}
          >
            Rechner
          </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
                activeTab === 'dashboard' ? 'bg-primary-light text-primary font-bold' : 'text-slate-600'
              }`}
            >
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
                activeTab === 'notes' ? 'bg-primary-light text-primary font-bold' : 'text-slate-600'
              }`}
            >
              Notizen
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
                activeTab === 'subjects' ? 'bg-primary-light text-primary font-bold' : 'text-slate-600'
              }`}
            >
              Fächer & Noten
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
                activeTab === 'planner' ? 'bg-primary-light text-primary font-bold' : 'text-slate-600'
              }`}
            >
              Lernplan
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
                activeTab === 'flashcards' ? 'bg-primary-light text-primary font-bold' : 'text-slate-600'
              }`}
            >
              Karteikarten
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
                activeTab === 'timer' ? 'bg-primary-light text-primary font-bold' : 'text-slate-600'
              }`}
            >
              Timer
            </button>
          </div>
      </div>
    </header>
  );
};
