import axios from "axios";

const FACE_BASE_URL = import.meta.env.VITE_FACE_API_URL || "http://localhost:8000/faces";

const faceApi = axios.create({
  baseURL: FACE_BASE_URL,
});

faceApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("⚠️ Aucun token trouvé dans localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

faceApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail || error.message;
    console.error(`❌ [Face API Error ${status}]`, detail);
    
    if (!error.response) {
      error.message = "Connexion au service échouée";
    }
    return Promise.reject(error);
  }
);

export const detectFaces = async (videoFile, referenceImage, threshold = 0.5) => {
  const formData = new FormData();
  formData.append("video_file", videoFile);
  formData.append("reference_image", referenceImage);
  formData.append("threshold", threshold);

  try {
    const response = await faceApi.post("/detect", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStructuredMatches = async (reference, video) => {
  try {
    const response = await faceApi.get("/matches/structured", {
      params: { reference, video },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMatches = async (reference, video) => {
  try {
    const response = await faceApi.delete("/matches/delete", {
      data: { reference, video },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default faceApi;