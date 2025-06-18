// 📁 src/pages/Export.jsx
import React, { useState } from 'react';
import { exportAllData, exportCurrentModule } from '../api/apiExport';
import { useLocation } from 'react-router-dom';

const Export = () => {
  const location = useLocation();
  const [exporting, setExporting] = useState(false);

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])).user_id;
    } catch (err) {
      return null;
    }
  };

  const handleExportAll = async () => {
    const userId = getUserId();
    if (!userId) return alert("Utilisateur non authentifié");
    setExporting(true);
    try {
      const url = await exportAllData(userId);
      window.open(url, '_blank');
    } catch (err) {
      alert("Erreur lors de l'exportation de vos donnees.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportCurrent = async () => {
    const userId = getUserId();
    if (!userId) return alert("Utilisateur non authentifié");
    const currentPath = location.pathname.replace('/', '');
    setExporting(true);
    try {
      const url = await exportCurrentModule(userId, currentPath);
      window.open(url, '_blank');
    } catch (err) {
      alert("Erreur lors de l'exportation du module.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Exportation des données</h2>

      <div className="flex flex-col gap-4">
        <button
          onClick={handleExportCurrent}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          disabled={exporting}
        >
          Exporter ce module
        </button>

        <button
          onClick={handleExportAll}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={exporting}
        >
          Exporter toutes mes données
        </button>
      </div>

      {exporting && <p className="mt-4 text-gray-600">Exportation en cours...</p>}
    </div>
  );
};

export default Export;
