import axios from 'axios';

const ANNOTATION_BASE_URL = "http://localhost:8000/annotation";

// Créer une instance Axios avec intercepteur
const api = axios.create({
  baseURL: ANNOTATION_BASE_URL,
});

// Ajoute automatiquement le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log("📦 Token lu dans intercepteur axios:", token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Header Authorization ajouté:", config.headers.Authorization);
    } else {
      console.warn("⚠️ Aucun token trouvé dans localStorage");
    }
    
    console.log("🚀 Requête envoyée:", {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error("❌ Erreur dans l'intercepteur request:", error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses (debug des erreurs)
api.interceptors.response.use(
  (response) => {
    console.log("✅ Réponse reçue:", {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error("❌ Erreur de réponse:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });
    
    // Gestion spécifique des erreurs d'authentification
    if (error.response?.status === 401) {
      console.warn("🚫 Erreur 401: Redirection vers login recommandée");
      // Optionnel: redirection automatique
      // window.location.href = '/auth';
    }
    
    return Promise.reject(error);
  }
);

// 📂 Obtenir la liste des classes
export const getClasses = async () => {
  try {
    console.log("🔍 Récupération des classes...");
    const response = await api.get('/classes');
    return response.data;
  } catch (error) {
    console.error("❌ Erreur getClasses:", error);
    throw error;
  }
};

// ➕ Ajouter une classe
export const addClass = async (className) => {
  try {
    console.log("➕ Ajout de la classe:", className);
    const response = await api.post('/classes', { label: className });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur addClass:", error);
    throw error;
  }
};

// ❌ Supprimer une classe
export const deleteClass = async (className) => {
  try {
    console.log("🗑️ Suppression de la classe:", className);
    const response = await api.delete(`/classes/${className}`);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur deleteClass:", error);
    throw error;
  }
};

// 🖼️ Annoter des images une par une
export const annotateImages = async (files, labels) => {
  const results = [];
  
  console.log("🖼️ Début annotation de", files.length, "images");
  
  for (let i = 0; i < files.length; i++) {
    try {
      const payload = {
        image_name: files[i].name,
        label: labels[i]
      };
      
      console.log(`📝 Annotation ${i+1}/${files.length}:`, payload);
      const response = await api.post('/annotate-db', payload);
      results.push(response.data);
    } catch (error) {
      console.error(`❌ Erreur annotation image ${i+1}:`, error);
      results.push({ error: error.message, image: files[i].name });
    }
  }

  return {
    message: "Toutes les annotations ont été traitées.",
    results
  };
};

// 📦 Exporter les annotations
export const exportAnnotations = async () => {
  try {
    console.log("📦 Export des annotations...");
    const response = await api.get('/export');
    return response.data;
  } catch (error) {
    console.error("❌ Erreur exportAnnotations:", error);
    throw error;
  }
};

// 🔍 Fonction utilitaire pour vérifier le token
export const checkToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn("⚠️ Aucun token dans localStorage");
    return false;
  }
  
  try {
    // Décoder le token pour vérifier s'il est expiré (côté client seulement)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    if (payload.exp && payload.exp < now) {
      console.warn("⏰ Token expiré");
      localStorage.removeItem('token');
      return false;
    }
    
    console.log("✅ Token valide, expire le:", new Date(payload.exp * 1000));
    return true;
  } catch (error) {
    console.error("❌ Token invalide:", error);
    localStorage.removeItem('token');
    return false;
  }
};