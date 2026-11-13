import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  LogIn,
  LogOut,
  User,
  LayoutDashboard,
  Calculator,
  BookOpen,
  Calendar,
  Layers,
  Clock,
  Menu,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export type ActiveTab = 'calculator' | 'dashboard' | 'notes' | 'subjects' | 'planner' | 'flashcards' | 'timer';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openAuthModal: () => void;
  onNavigateLandingSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  onNavigateLandingSection,
}) => {
  const { user, profile, signOut, isConfigured } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect scroll to transition from transparent to subtle blurred dark navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tab: ActiveTab, sectionId?: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (sectionId && onNavigateLandingSection) {
      setTimeout(() => {
        onNavigateLandingSection(sectionId);
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#090B0A]/85 backdrop-blur-xl border-b border-[#292F2B]/80 shadow-2xl shadow-black/50 py-3'
          : 'bg-transparent border-b border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo / Brand with GRAINZ Minimalist Styling */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNavClick('calculator')}
              className="flex items-center gap-2.5 text-left text-white font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#171B18] border border-[#292F2B] text-white flex items-center justify-center shadow-sm group-hover:border-[#C5F82A] transition-colors">
                <GraduationCap className="w-4 h-4 text-[#C5F82A]" />
              </div>
              <span className="text-white tracking-tight font-black text-lg sm:text-xl">
                Noten<span className="text-[#C5F82A]">Pilot</span>
              </span>
            </button>
          </div>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#A4AAA5]">
            <button
              type="button"
              onClick={() => handleNavClick('calculator')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'calculator'
                  ? 'text-white bg-[#171B18] border border-[#292F2B]'
                  : 'hover:text-white hover:bg-[#111412]'
              }`}
            >
              Notenrechner
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('planner')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'planner'
                  ? 'text-white bg-[#171B18] border border-[#292F2B]'
                  : 'hover:text-white hover:bg-[#111412]'
              }`}
            >
              Lernplan
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('flashcards')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'flashcards'
                  ? 'text-white bg-[#171B18] border border-[#292F2B]'
                  : 'hover:text-white hover:bg-[#111412]'
              }`}
            >
              Karteikarten
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('timer')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'timer'
                  ? 'text-white bg-[#171B18] border border-[#292F2B]'
                  : 'hover:text-white hover:bg-[#111412]'
              }`}
            >
              Fokus-Timer
            </button>

            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick('dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'text-white bg-[#171B18] border border-[#292F2B]'
                      : 'hover:text-white hover:bg-[#111412]'
                  }`}
                >
                  Übersicht
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('notes')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    activeTab === 'notes'
                      ? 'text-white bg-[#171B18] border border-[#292F2B]'
                      : 'hover:text-white hover:bg-[#111412]'
                  }`}
                >
                  Notizen
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('subjects')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    activeTab === 'subjects'
                      ? 'text-white bg-[#171B18] border border-[#292F2B]'
                      : 'hover:text-white hover:bg-[#111412]'
                  }`}
                >
                  Fächer & Noten
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('notes')}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === 'notes'
                    ? 'text-white bg-[#171B18] border border-[#292F2B]'
                    : 'hover:text-white hover:bg-[#111412]'
                }`}
              >
                Notizen
              </button>
            )}
          </nav>

          {/* Right Action: Auth or User Status */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#171B18] border border-[#292F2B] rounded-xl text-xs text-white">
                  <User className="w-3.5 h-3.5 text-[#C5F82A]" />
                  <span className="font-medium max-w-[130px] truncate">
                    {profile?.display_name || user.email?.split('@')[0]}
                  </span>
                  {!isConfigured && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                      Demo
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  title="Abmelden"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#A4AAA5] hover:text-white hover:bg-[#171B18] rounded-xl border border-[#292F2B] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Abmelden</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#A4AAA5] hover:text-white transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Anmelden</span>
                </button>

                <button
                  type="button"
                  onClick={openAuthModal}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#090B0A] bg-[#C5F82A] hover:bg-white rounded-xl shadow-lg shadow-[#C5F82A]/20 transition-all duration-300 cursor-pointer"
                >
                  <span className="hidden xs:inline">Kostenlos starten</span>
                  <span className="xs:hidden">Starten</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#A4AAA5] hover:text-white rounded-xl bg-[#171B18] border border-[#292F2B] cursor-pointer"
              aria-label="Navigation öffnen"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Animated Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-[#090B0A]/95 backdrop-blur-2xl border-b border-[#292F2B] p-6 shadow-2xl animate-fadeIn z-50 max-h-[85vh] overflow-y-auto">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleNavClick('calculator')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
                activeTab === 'calculator'
                  ? 'bg-[#171B18] text-[#C5F82A] border border-[#292F2B]'
                  : 'text-[#A4AAA5] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Calculator className="w-4 h-4" /> Notenrechner
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('planner')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
                activeTab === 'planner'
                  ? 'bg-[#171B18] text-[#C5F82A] border border-[#292F2B]'
                  : 'text-[#A4AAA5] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" /> Klausuren & Lernplan
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('flashcards')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
                activeTab === 'flashcards'
                  ? 'bg-[#171B18] text-[#C5F82A] border border-[#292F2B]'
                  : 'text-[#A4AAA5] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" /> Karteikarten & Lernbox
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('timer')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
                activeTab === 'timer'
                  ? 'bg-[#171B18] text-[#C5F82A] border border-[#292F2B]'
                  : 'text-[#A4AAA5] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" /> Pomodoro Fokus-Timer
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('notes')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
                activeTab === 'notes'
                  ? 'bg-[#171B18] text-[#C5F82A] border border-[#292F2B]'
                  : 'text-[#A4AAA5] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" /> Lernnotizen (Cloud)
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {user && (
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    activeTab === 'dashboard'
                      ? 'bg-[#171B18] text-[#C5F82A] border border-[#292F2B]'
                      : 'text-[#A4AAA5] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4" /> Schüler-Dashboard
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('subjects')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    activeTab === 'subjects'
                      ? 'bg-[#171B18] text-[#C5F82A] border border-[#292F2B]'
                      : 'text-[#A4AAA5] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4" /> Fächer & Notenübersicht
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              </>
            )}

            {!user && (
              <div className="pt-4 border-t border-[#292F2B] flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full py-3 rounded-xl bg-[#C5F82A] text-[#090B0A] font-bold text-sm text-center"
                >
                  Jetzt kostenlos starten
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#171B18] text-white font-semibold text-xs text-center border border-[#292F2B]"
                >
                  Bereits ein Konto? Anmelden
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
