import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TextInput from '../Shared/FormElements/TextInput'
import { ForgotPassword } from '../../hooks/useLogin'
import { useToast } from '../../hooks/useToast';
import { useTranslation } from 'react-i18next';

function ForgotPasswordModal({ isOpen, onClose, onSubmit }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('')
  const [localError, setlocalError] = useState('')
  const { showToast } = useToast();

  const {sendResetLink, error, loading} = ForgotPassword()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      setlocalError(t('forgotPassword.emailRequired', 'Veuillez entrer votre adresse e-mail'))
      return
    }
    setlocalError('')
    await sendResetLink(email);
     showToast(t('forgotPassword.linkSent', 'Le lien de réinitialisation a été envoyé à votre adresse e-mail'), "success")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-transparent dark:border-slate-800"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 text-center">
              {t('forgotPassword.title', 'Mot de passe oublié')}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 text-center">
              {t('forgotPassword.instruction', 'Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextInput
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('forgotPassword.emailPlaceholder', 'Email@email.com')}
                label={t('forgotPassword.emailLabel', 'Adresse e-mail')}
                required
              />

              {localError && (
                <div className="text-sm text-red-600 font-semibold">
                  {localError}
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 font-semibold">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('common.cancel', 'Annuler')}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 rounded-lg bg-slate-700 dark:bg-slate-600 text-white font-semibold hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors shadow-sm cursor-pointer"
                >
                  {loading ? t('forgotPassword.sending', 'Envoi...') : t('forgotPassword.sendBtn', 'Envoyer')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ForgotPasswordModal
