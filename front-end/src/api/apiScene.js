import axios from "axios";

const SCENE_BASE_URL = "http://localhost:8000/scenes";

const sceneApi = axios.create({
  baseURL: SCENE_BASE_URL,
});

// ✅ Intercepteur : ajoute le token
sceneApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["user_id"] = "demo-user"; // ← Ajoute ton user_id ici
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Intercepteur : log propre des erreurs serveur
sceneApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail || error.message || "Erreur inconnue";
    console.error(`❌ [${status}] ${detail}`);
    return Promise.reject(error);
  }
);

// 📤 Upload vidéo
export const detectScenes = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await sceneApi.post("/detect", formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 📄 Obtenir les scènes
export const getScenes = async (videoName) => {
  try {
    const response = await sceneApi.get(`/scenes/${videoName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 🖼️ Obtenir les frames
export const getFrames = async (videoName) => {
  try {
    const response = await sceneApi.get(`/frames/${videoName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 🗑️ Supprimer une vidéo
export const deleteVideo = async (filename) => {
  try {
    const response = await sceneApi.delete("/delete", {
      params: { filename }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
