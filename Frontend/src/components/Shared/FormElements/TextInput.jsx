import React, { useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const TextInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  error,
  className = '',
  ...rest
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (passwordVisible ? "text" : "password") : type;

  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 font-['Segoe_UI']"
        >
          {label}
          {required && <span className="text-red-500 ml-1"></span>}
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/30 ${error ? 'border-red-500' : ''} font-segoe ltr:pr-10 rtl:pl-10 transition-all`}
          {...rest}
        />
        {isPasswordType && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setPasswordVisible((v) => !v)}
            className="absolute ltr:right-2 rtl:left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 focus:outline-none"
            aria-label={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {passwordVisible ? <HiEye className="w-5 h-5" /> : <HiEyeOff className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-['Segoe_UI']">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextInput;