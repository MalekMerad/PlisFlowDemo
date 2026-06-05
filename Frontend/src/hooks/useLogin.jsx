import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { sendResetLinkService } from '../services/sendResetLinkService';
import { MOCK_AUTH_USERS } from '../mock/mockDataStore';

export const useLogin = () => {
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loginUser = async (email, password) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const account = MOCK_AUTH_USERS[normalizedEmail];

      if (!account || password !== '123') {
        throw new Error('Invalid credentials');
      }

      const data = {
        userId: account.userId,
        role: account.role,
        token: account.token,
      };

      login(
        { userId: data.userId, role: data.role },
        data.token
      );

      localStorage.setItem('userID', data.userId);
      localStorage.setItem('role', data.role);
      localStorage.setItem('token', data.token);

      const role = parseInt(data.role, 10);

      if (role === 1) navigate('/dashboard');
      if (role === 2) navigate('/adminPage');

      return data;
    } catch (err) {
      setError(err.message);
    }
  };

  return { loginUser, error };
};

export const ForgotPassword = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendResetLink = async (email) => {
    try {
      setError(null);
      setLoading(true);
      await sendResetLinkService(email);
    } catch (err) {
      setError(err.message);
      console.error('ForgotPassword error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { sendResetLink, error, loading };
};

export const useResetPassword = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetPassword = async () => {
    try {
      setError(null);
      setLoading(true);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('ResetPassword error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, error, loading };
};
