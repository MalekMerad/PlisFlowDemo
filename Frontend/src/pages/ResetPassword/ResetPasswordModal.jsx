import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TextInput from "../../components/Shared/FormElements/TextInput";
import { useResetPassword } from "../../hooks/useLogin";
import { useToast } from '../../hooks/useToast';
import SubmitLoader from "../../components/Shared/SubmitLoader";


export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [localError, setLocalError] = useState("");
  const { showToast } = useToast();
  

  const [loading, setLoading] = useState(false);

  const { resetPassword, error, message } = useResetPassword();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      setResetToken(token);
      console.log("Reset Token:", token);
    } else {
      navigate("/");
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!password || !confirmPassword) {
      setLocalError("Tous les champs sont obligatoires");
      return;
    }

    if (password.length < 6) {
      setLocalError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas");
      return;
    }

    try{
      setLoading(true);
      await resetPassword (resetToken, password);
      if(!error) {
        showToast(t("common.toasts.updated", "Le mot de passe a été modifié avec succès"), "success");
        navigate("/");
      }
    } catch (err) {
       console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <p className="text-red-600 text-center text-lg">
          Lien invalide ou expiré
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-8 relative border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        {/* Loading overlay during password reset */}
        <SubmitLoader
          isVisible={loading}
          message="Réinitialisation du mot de passe en cours..."
        />

        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-100">
          Réinitialiser le mot de passe
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextInput
            type="password"
            label="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <TextInput
            type="password"
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />

          {localError && <p className="text-red-500 text-xs font-medium px-1 animate-pulse">{localError}</p>}
          {error && <p className="text-red-500 text-xs font-medium px-1">{error}</p>}
          {message && <p className="text-green-500 text-xs font-medium px-1">{message}</p>}

          <div className="flex gap-4 pt-2">
            <button
              type="reset"
              onClick={() => {
                setPassword("");
                setConfirmPassword("");
                setLocalError("");
              }}
              className="w-1/2 border border-gray-300 dark:border-slate-700 rounded-xl py-2.5 text-slate-600 dark:text-slate-400 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              disabled={loading}
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl py-2.5 font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {loading ? "En cours..." : "Réinitialiser"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
