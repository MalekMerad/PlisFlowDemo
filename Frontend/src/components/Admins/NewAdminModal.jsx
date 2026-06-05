import { FormModal } from "../Shared/FormModal";
import { useTranslation } from "react-i18next";

export default function NewAdminModal({
  isOpen,
  onClose,
  onSave,
  form,
  setForm,
}) {
  const { t } = useTranslation();
  return (
    <div>
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={onSave}
        title={t("admins.newAccount", "Créer un nouveau compte administrateur")}
        saveText={t("add", "Créer")}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
              {t("admins.nameAndSurname", "Nom et Prénom")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.NomPrenom}
              onChange={e =>
                setForm((prev) => ({ ...prev, NomPrenom: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all"
              placeholder={t("admins.nameAndSurname", "Nom Prénom")}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
              {t("admins.email", "Email")} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.Email}
              onChange={e =>
                setForm((prev) => ({ ...prev, Email: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
              {t("admins.function", "Fonction")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.Function}
              onChange={e =>
                setForm((prev) => ({ ...prev, Function: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all"
              placeholder={t("admins.function", "Directeur, Responsable, etc.")}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
              {t("admins.initialPassword", "Mot de passe initial")} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.Password}
              onChange={e =>
                setForm((prev) => ({ ...prev, Password: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 ml-1 leading-relaxed">
              {t(
                "admins.initialPasswordHint",
                "Un mot de passe sécurisé est généré automatiquement, mais vous pouvez le modifier avant de l'envoyer à l'utilisateur."
              )}
            </p>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
