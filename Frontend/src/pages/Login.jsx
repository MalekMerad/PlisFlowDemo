import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLogin } from '../hooks/useLogin';
import TextInput from '../components/Shared/FormElements/TextInput';
import ForgotPasswordModal from '../components/ResetPassword/ForgotPasswordModal';
import { useTranslation } from 'react-i18next';
import logo_sidebar from '../assets/logo_sidebar.png';

function Login() {
  const { loginUser, error: loginError } = useLogin();
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Set document direction based on current language
  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n.language]);

  // Initialize language from localStorage on component mount
  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await loginUser(formData.email, formData.password);
      setIsLoading(false);

      console.log("Login result:", result);

      if (result && result.userId) {
        console.log("login ok, redirection faite selon le rôle dans useLogin");
      } else {
        setError(t('login.invalidCredentials'));
      }
    } catch (err) {
      setIsLoading(false);
      setError(t('login.invalidCredentials'));
      console.error("Login error:", err);
    }
  };

  useEffect(() => {
    if (loginError) {
      setError(loginError);
    }
  }, [loginError]);

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900" style={{ fontSize: '0.95rem' }}>
      {/* Form Section */}
      <motion.div
        className="flex-grow flex items-center justify-center"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-full max-w-md bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ fontSize: '0.95rem' }}
        >
          <div className="flex flex-col items-center mb-6">
            <img
              src={logo_sidebar}
              alt="OpenOffers Logo"
              className="h-14 w-auto"
              style={{ objectFit: 'contain' }}
            />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white text-center">
              {t('login.title')}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('login.emailPlaceholder')}
              required
              label={t('login.email')}
            />

            <TextInput
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t('login.passwordPlaceholder')}
              required
              label={t('login.password')}
            />

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="cursor-pointer text-slate-600 dark:text-slate-300 hover:underline"
                style={{ fontSize: '0.93em' }}
              >
                {t('login.forgotPassword')}
              </button>
            </div>

            {/* Custom error feedbacks */}
            {error === "ACCOUNT_DISABLED" && (
              <div className="text-xs text-red-600 font-semibold">
                Compte Désactivé
              </div>
            )}

            {error === "INVALID_CREDENTIALS" && (
              <div className="text-xs text-red-600 font-semibold">
                Email ou mot de passe incorrect
              </div>
            )}

            {/* Default error message (for all other error cases) */}
            {error && error !== "ACCOUNT_DISABLED" && error !== "INVALID_CREDENTIALS" && (
              <motion.div
                className="text-xs text-red-600 font-semibold"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-700 transition cursor-pointer"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.97 }}
              style={{ fontSize: '0.97em' }}
            >
              {isLoading ? t('login.loading') : t('login.submit')}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      {/* Welcome Panel */}
      <motion.div
        className="hidden lg:flex flex-grow items-center justify-center bg-slate-800 dark:bg-slate-900 text-white"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{ fontSize: '0.97rem' }}
      >
        <div className="max-w-2xl text-center px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('login.welcomeTitle')}
          </h1>
          <p className="text-slate-100 dark:text-slate-300 text-base md:text-lg">
            {t('login.welcomeText')}
          </p>
        </div>
      </motion.div>
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSubmit={(email) => {
          console.log('Email envoyé pour réinitialisation :', email);
          setShowForgotPassword(false);
        }}
      />
    </div>
  );
}

export default Login;