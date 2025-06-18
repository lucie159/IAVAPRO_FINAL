import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getClasses,
  addClass,
  deleteClass,
  annotateImages,
  exportAnnotations
} from '../api/api';

function Annotation() {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState('');
  const [files, setFiles] = useState([]);
  const [labels, setLabels] = useState([]);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    section: {
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flex: 1,
      margin: '10px'
    },
    flexRow: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    },
    button: {
      padding: '10px 15px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      marginRight: '10px',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.3s'
    },
    hoverable: {
      backgroundColor: '#4f46e5',
    },
    fileButton: {
      padding: '10px 20px',
      backgroundColor: '#e5e7eb',
      color: '#1f2937',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      marginBottom: '10px'
    },
    input: {
      padding: '8px 10px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      marginRight: '10px'
    },
    status: {
      padding: '12px',
      margin: '15px 0',
      borderRadius: '6px',
      fontWeight: '500'
    },
    error: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      border: '1px solid #fca5a5'
    },
    success: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      border: '1px solid #86efac'
    },
    info: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      border: '1px solid #93c5fd'
    },
    thumbnail: {
      height: '70px',
      marginRight: '10px',
      borderRadius: '4px',
      objectFit: 'cover'
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("🚫 Aucun token trouvé. Redirection vers la page de connexion.");
      navigate("/auth");
    } else {
      fetchClasses();
    }
  }, [navigate]);

  const fetchClasses = async () => {
    try {
      const data = await getClasses();
      const labels = Array.isArray(data) ? data.map(c => c.label || c) : [];
      setClasses(labels);
    } catch (error) {
      console.error("Erreur lors de la récupération des classes:", error);
      setStatus("❌ Erreur lors du chargement des classes. Veuillez vous reconnecter.");
    }
  };

  const handleAddClass = async () => {
    if (newClass.trim() === '') return;
    try {
      const response = await addClass(newClass);
      alert(response.message);
      setNewClass('');
      fetchClasses();
    } catch (error) {
      if (error.response?.data?.detail) {
        alert("❌ Classe déjà existante : " + error.response.data.detail);
      } else {
        alert("❌ Erreur lors de l'ajout de la classe.");
      }
    }
  };

  const handleDeleteClass = async (name) => {
    await deleteClass(name);
    fetchClasses();
  };

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setLabels(new Array(selectedFiles.length).fill(''));
  };

  const handleLabelChange = (index, value) => {
    const updated = [...labels];
    updated[index] = value;
    setLabels(updated);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert("⚠️ Vous devez d'abord sélectionner au moins une image.");
      return;
    }
    if (files.length !== labels.length || labels.includes('')) {
      alert("⚠️ Chaque image doit avoir une classe sélectionnée.");
      return;
    }
    try {
      setStatus("⏳ Annotation en cours...");
      setProgress(10);
      const simulateProgress = async () => {
        for (let i = 20; i <= 90; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 150));
          setProgress(i);
        }
      };
      await simulateProgress();
      const result = await annotateImages(files, labels);
      setProgress(100);
      setStatus(`✅ ${result.message}`);
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error(error);
      setStatus("❌ Échec de l'annotation");
      setProgress(0);
    }
  };

  const handleExport = async () => {
    if (files.length === 0 || labels.length === 0) {
      alert("⚠️ Vous devez d'abord annoter des images avant d'exporter.");
      return;
    }
    try {
      setStatus("📦 Exportation en cours...");
      const result = await exportAnnotations();
      setStatus("✅ Export terminé ! Le fichier a été généré avec succès.");
    } catch (error) {
      console.error(error);
      setStatus("❌ Aucune annotation trouvée pour l'export.");
    }
  };

  const handlePreview = () => {
    if (files.length === 0) {
      alert("⚠️ Aucune image sélectionnée.");
      return;
    }
    const summary = files.map((file, idx) => {
      const label = labels[idx] || "❌ Non attribuée";
      return `🖼️ ${file.name} → 🏷️ ${label}`;
    }).join('\n');
    alert("📋 Aperçu des annotations :\n\n" + summary);
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => navigate('/')}
        style={{
          ...styles.button,
          backgroundColor: '#e2e8f0',
          color: '#1e293b',
          marginBottom: '20px'
        }}
      >
        ← Retour à l'accueil
      </button>

      <div style={styles.flexRow}>
        <div style={styles.section}>
          <h3>🗂️ Gestion des classes</h3>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <input
              type="text"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              placeholder="Nouvelle classe"
              style={styles.input}
            />
            <button onClick={handleAddClass} style={styles.button}>Ajouter</button>
          </div>
          <ul>
            {classes.map((cls, idx) => (
              <li key={idx} style={{ marginTop: '6px' }}>
                {cls}
                <button onClick={() => handleDeleteClass(cls)} style={{ ...styles.button, backgroundColor: '#ef4444', marginLeft: '10px' }}>❌</button>
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.section}>
          <h3>📥 Upload d'images</h3>
          <label style={styles.fileButton}>
            Sélectionner des fichiers...
            <input type="file" multiple onChange={handleFilesChange} accept="image/*" style={{ display: 'none' }} />
          </label>
          {files.length > 0 && (
            <ul>
              {files.map((file, idx) => {
                const imageUrl = URL.createObjectURL(file);
                return (
                  <li key={idx} style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                    <img src={imageUrl} alt={file.name} style={styles.thumbnail} />
                    <span>{file.name}</span>
                    <select
                      value={labels[idx]}
                      onChange={(e) => handleLabelChange(idx, e.target.value)}
                      style={{ marginLeft: '10px', padding: '5px' }}
                    >
                      <option value="">-- Sélectionner --</option>
                      {classes.map((cls, i) => (
                        <option key={i} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {status && (
        <p style={{
          ...styles.status,
          ...(status.includes('❌') ? styles.error :
            status.includes('✅') ? styles.success : styles.info)
        }}>
          {status}
        </p>
      )}
      {progress > 0 && progress < 100 && <progress value={progress} max="100"></progress>}

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSubmit} style={styles.button}>✅ Annoter</button>
         
        <button onClick={handlePreview} style={styles.button}>📋 Aperçu</button>
      </div>
    </div>
  );
}

export default Annotation;
