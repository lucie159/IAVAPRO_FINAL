import axios from 'axios';

// Configuration de base pour le service d'authentification
const authService = axios.create({
  baseURL: 'http://localhost:5000/api', // service d'authentification
});

// API d'authentification
export const authAPI = {
  // 🔐 Connexion
  login: async (email, password) => {
    const response = await authService.post('/auth/login', { email, password });
    return response.data;
  },

  // 📝 Inscription
  register: async (username, email, password) => {
    const response = await authService.post('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  // ✅ Vérification du token
  verifyToken: async (token) => {
    const response = await authService.get('/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // 🚪 Déconnexion (gérée côté frontend)
  logout: () => {
    localStorage.removeItem('token');
  },
};