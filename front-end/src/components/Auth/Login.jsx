import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log("🟢 Réponse backend:", response.data);

      if (!response.data.token) {
        toast.error("❌ Aucun token reçu !");
        return;
      }

      localStorage.setItem('token', response.data.token);
      console.log("✅ Token stocké dans localStorage");

      // 🔍 Debug du token JWT
      console.log("🔍 Debug du token JWT :");
      const token = response.data.token;
      console.log("Token brut:", token);

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("Payload décodé:", payload);
        console.log("ID utilisateur:", payload.id || payload.user_id || payload.userId);
        console.log("Email:", payload.email);
        console.log("Expiration:", new Date(payload.exp * 1000));
      } catch (decodeError) {
        console.error("❌ Erreur lors du décodage du token:", decodeError);
      }

      setIsAuthenticated(true);
      toast.success('Connexion réussie !');
      navigate('/home');
    } catch (error) {
      console.error("❌ Erreur lors du login:", error);
      toast.error(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
};

export default Login;
