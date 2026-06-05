import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IoLogOutOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { FileText, User, UserCheck, ClipboardList, WalletCards } from 'lucide-react';

import logoSidebar from '../../assets/logo_sidebar.png';
import LanguageSwitcher from "../Shared/Languages/LanguageSwitcher";
import ThemeToggle from "./tools/ThemeToggle";

const sections = [
  { id: 'operations', labelKey: "sidebar.operations", icon: FileText },
  { id: 'supplier', labelKey: "sidebar.suppliers", icon: User },
  { id: 'commission', labelKey: "sidebar.commission", icon: UserCheck },
  { id: 'evaluation', labelKey: "sidebar.evaluation", icon: ClipboardList },
  { id: 'expenses_tracking', labelKey: "sidebar.expenses_tracking", icon: WalletCards },
];

export function Sidebar({ activeSection, onSectionChange }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleDeconnection = () => {
    // Save user preferences before clearing
    const savedLang = localStorage.getItem('lang');
    const savedTheme = localStorage.getItem('theme');

    // Clear all localStorage
    localStorage.clear();

    // Restore preferences
    if (savedLang) localStorage.setItem('lang', savedLang);
    if (savedTheme) localStorage.setItem('theme', savedTheme);

    // Call logout function from auth context
    logout();

    // Navigate to login page
    navigate('/');
  };

  const handleNavigation = (sectionId) => {
    if (onSectionChange && typeof onSectionChange === 'function') {
      onSectionChange(sectionId);
    } else {
      navigate('/admin', { state: { activeSection: sectionId } });
    }
  };

  return (
    <header className="w-full h-12 bg-slate-800 dark:bg-slate-900 text-white flex items-center justify-between px-4 shadow sticky top-0 z-50 transition-colors">
      <div className="flex items-center">
        <img
          src={logoSidebar}
          alt="Logo"
          className="h-8 w-auto mr-2 hidden sm:block rounded"
        />
        <h1 className="text-[11px] font-bold uppercase border-r border-slate-600 pr-4 hidden sm:block">
          PlisFlow
        </h1>
      </div>
      {/* Centered navigation bar */}
      <nav className="flex-1 flex justify-center">
        <div className="flex items-center gap-1">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const IconComponent = section.icon;

            return (
              <button
                key={section.id}
                onClick={() => handleNavigation(section.id)}
                className={`h-8 flex items-center gap-2 px-2 rounded text-[10px] font-medium transition-colors cursor-pointer ${isActive
                  ? 'bg-slate-700 dark:bg-slate-600 text-white'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-700/50 dark:hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <IconComponent size={14} />
                <span className="hidden lg:inline">{t(section.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </nav>
      {/* Language selector dropdown, theme toggle and logout button */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
        <button
          onClick={handleDeconnection}
          className="h-8 px-3 rounded bg-slate-700 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-600 hover:text-white text-[10px] font-bold transition-all flex items-center gap-2 focus:outline-none focus:ring-2 cursor-pointer"
        >
          <IoLogOutOutline size={16} />
          <span className="hidden sm:inline">{t("logout")}</span>
        </button>
      </div>
    </header>
  );
}