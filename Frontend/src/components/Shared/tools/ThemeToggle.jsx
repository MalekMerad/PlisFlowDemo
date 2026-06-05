import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="h-8 w-14 flex items-center justify-center rounded bg-slate-700 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-600 text-white transition-all cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-slate-500"
      title={darkMode ? "Passer au mode clair" : "Passer au mode sombre"}
    >
      {darkMode ? (
        <Sun size={14} className="text-yellow-400" />
      ) : (
        <Moon size={14} className="text-slate-300" />
      )}
    </button>
  );
};

export default ThemeToggle;