import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { LoginResponse } from '../types';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', {
        username,
        password,
      });

      if (data.success) {
        login(data.data.token, data.data.user);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>Connexion</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="username">Nom d'utilisateur</label>
            <input
              id="username"
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-text" style={{ marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Utilisez <strong>admin</strong> / <strong>admin123</strong> pour la démo
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
