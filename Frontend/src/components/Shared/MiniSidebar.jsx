import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { IoLogOutOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import logoSidebar from "../../assets/logo_sidebar.png";
import LanguageSwitcher from "./Languages/LanguageSwitcher";
import ThemeToggle from "./tools/ThemeToggle";

export default function MiniSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleDeconnection = () => {
    localStorage.clear();
    logout();
    navigate("/");
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

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Language Selector */}
        <LanguageSwitcher />

        {/* Logout */}
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