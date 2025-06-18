// apiMatching.js
import axios from "axios";

const PATTERN_BASE_URL = import.meta.env.VITE_PATTERN_API_URL || "http://localhost:8000/patterns";

const matchingApi = axios.create({
  baseURL: PATTERN_BASE_URL,
});

matchingApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

matchingApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail || error.message;
    console.error(`❌ [Matching API Error ${status}]`, detail);

    if (!error.response) {
      error.message = "Connexion au service échouée";
    }
    return Promise.reject(error);
  }
);

export const matchPattern = async (videoFile, templateFile, threshold = 0.7) => {
  const formData = new FormData();
  formData.append("video_file", videoFile);
  formData.append("template_file", templateFile); // un seul fichier
  formData.append("threshold", threshold);

  try {
    const response = await matchingApi.post("/match", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMatches = async (video, template) => {
  try {
    const response = await matchingApi.get("/results", {
       params: { video, template },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMatches = async (video) => {
  try {
    const response = await matchingApi.delete("/results", {
      params: { video },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default matchingApi;