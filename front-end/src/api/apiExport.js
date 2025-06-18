// Le frontend communique avec le gateway sur le port 8000
const BASE_EXPORT_URL = import.meta.env.VITE_EXPORT_BASE_URL || "http://localhost:8000/exports";

export const exportAllData = async (userId, token) => {
  const url = `${BASE_EXPORT_URL}/all`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur d\'export complète:', errorText);
    throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
  }
  return await response.blob();
};

export const exportCurrentModule = async (userId, path, token) => {
  const url = `${BASE_EXPORT_URL}/module?path=${encodeURIComponent(path)}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erreur d\'export module:', errorText);
    throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
  }
  return await response.blob();
};