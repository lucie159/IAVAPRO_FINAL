// PatternMatching.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchPattern, getMatches, deleteMatches } from '../api/apiPattern';

function PatternMatching() {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const templateInputRef = useRef(null);

  const FRAME_BASE_URL = import.meta.env.VITE_FRAME_BASE_URL || "http://localhost:8004/static/frames";

  // Styles cohérents avec le nouveau design
  const styles = {
    pageBackground: {
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    },
    appWindow: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)',
      width: '90%',
      maxWidth: '1000px',
      padding: '40px',
      position: 'relative'
    },
    backButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '0.5rem 1rem',
      backgroundColor: '#e2e8f0',
      color: '#2d3748',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#cbd5e0'
      }
    },
    section: {
      marginBottom: '2rem',
      padding: '1.5rem',
      borderRadius: '12px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0'
    },
    sectionTitle: {
      color: '#4a5568',
      marginTop: 0,
      marginBottom: '1rem',
      fontSize: '1.2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#4338ca',
        transform: 'translateY(-2px)'
      },
      ':disabled': {
        backgroundColor: '#cbd5e0',
        cursor: 'not-allowed',
        transform: 'none'
      }
    },
    fileInputButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#e2e8f0',
      color: '#2d3748',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#cbd5e0',
        transform: 'translateY(-2px)'
      }
    },
    fileInput: {
      display: 'none'
    },
    videoContainer: {
      position: 'relative',
      width: '100%',
      marginTop: '1rem'
    },
    video: {
      width: '100%',
      borderRadius: '8px',
      display: 'block'
    },
    status: {
      margin: '1rem 0',
      padding: '0.75rem',
      borderRadius: '8px',
      fontWeight: '600'
    },
    successStatus: {
      color: '#15803d',
      backgroundColor: '#dcfce7'
    },
    errorStatus: {
      color: '#b91c1c',
      backgroundColor: '#fee2e2'
    },
    processingStatus: {
      color: '#1d4ed8',
      backgroundColor: '#dbeafe'
    },
    actionButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    templatesContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginTop: '1rem'
    },
    templateCard: {
      position: 'relative',
      width: '120px',
      padding: '0.75rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    templatePreview: {
      width: '100%',
      height: '80px',
      objectFit: 'contain',
      marginBottom: '0.5rem'
    },
    templateName: {
      fontSize: '0.8rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'center'
    },
    removeTemplate: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      width: '24px',
      height: '24px',
      backgroundColor: '#f87171',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.8rem'
    },
    confidenceControl: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      margin: '1rem 0'
    },
    confidenceSlider: {
      flexGrow: 1
    },
    confidenceValue: {
      minWidth: '40px',
      textAlign: 'center'
    },
    resultCard: {
      border: '1px solid #e2e8f0',
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '8px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    resultImage: {
      width: '300px',
      marginTop: '0.5rem',
      borderRadius: '8px'
    }
  };

  const getStatusStyle = () => {
    if (status.startsWith('✅')) return { ...styles.status, ...styles.successStatus };
    if (status.startsWith('❌')) return { ...styles.status, ...styles.errorStatus };
    if (status.startsWith('⏳')) return { ...styles.status, ...styles.processingStatus };
    return styles.status;
  };

  // Les fonctions existantes restent inchangées
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const videoURL = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = videoURL;
      }
      setStatus(`🎬 Vidéo sélectionnée : ${file.name}`);
    }
  };

  const handleTemplateUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newTemplates = files.map((file, index) => ({
        id: templates.length + index + 1,
        name: file.name,
        file: file,
        preview: URL.createObjectURL(file)
      }));
      setTemplates([...templates, ...newTemplates]);
      setStatus(`🖼️ ${files.length} template(s) ajoutés.`);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();
  const triggerTemplateInput = () => templateInputRef.current.click();
  const removeTemplate = (id) => setTemplates(templates.filter(t => t.id !== id));

  const searchPatterns = async () => {
    if (!videoFile || templates.length === 0) {
      setStatus("❌ Veuillez sélectionner une vidéo et au moins un template.");
      return;
    }
    try {
      setIsProcessing(true);
      setStatus("⏳ Envoi des fichiers et lancement de l'analyse...");
      for (let template of templates) {
        await matchPattern(videoFile, template.file, confidenceThreshold / 100);
      }
      setStatus("✅ Analyse terminée. Cliquez sur Récupérer les résultats.");
    } catch (error) {
      setStatus("❌ Erreur pendant l'analyse.");
    } finally {
      setIsProcessing(false);
    }
  };

  const retrieveResults = async () => {
    if (!videoFile || templates.length === 0) {
      setStatus("❌ Veuillez d'abord sélectionner une vidéo et au moins un template");
      return;
    }
    
    try {
      setStatus("🔍 Récupération des résultats en cours...");
      const allResults = [];
      let hasErrors = false;
      let errorMessages = [];
      
      for (let template of templates) {
        try {
          console.log(`Récupération pour: ${videoFile.name} + ${template.name}`);
          const response = await getMatches(videoFile.name, template.name);
          
          console.log('Réponse API:', response);
          
          // Gérer différents formats de réponse
          if (response.results && Array.isArray(response.results)) {
            response.results.forEach(match => match.template_name = template.name);
            allResults.push(...response.results);
          } else if (Array.isArray(response)) {
            response.forEach(match => match.template_name = template.name);
            allResults.push(...response);
          } else if (response.message) {
            console.log(`Info pour ${template.name}: ${response.message}`);
          }
          
        } catch (templateError) {
          hasErrors = true;
          const errorMsg = templateError.response?.data?.detail || templateError.message || "Erreur inconnue";
          errorMessages.push(`${template.name}: ${errorMsg}`);
          console.error(`Erreur pour le template ${template.name}:`, templateError);
        }
      }
      
      setResults(allResults);
      
      if (allResults.length === 0) {
        if (hasErrors) {
          setStatus(`⚠️ Erreurs rencontrées: ${errorMessages.join('; ')}`);
        } else {
          setStatus("📭 Aucune correspondance trouvée. Essayez de diminuer le seuil de confiance ou vérifiez vos templates.");
        }
      } else {
        let statusMsg = `📄 ${allResults.length} résultat(s) récupérés avec succès.`;
        if (hasErrors) {
          statusMsg += ` (Quelques erreurs: ${errorMessages.join('; ')})`;
        }
        setStatus(statusMsg);
      }
      
    } catch (error) {
      console.error('Erreur générale lors de la récupération:', error);
      const errorMessage = error.response?.data?.detail || error.message || "Erreur inconnue";
      setStatus(`❌ Erreur de récupération: ${errorMessage}`);
    }
  };

  const clearResults = async () => {
    if (!videoFile) {
      setStatus("❌ Veuillez d'abord sélectionner une vidéo");
      return;
    }
    try {
      await deleteMatches(videoFile.name);
      setResults([]);
      setStatus("🗑️ Résultats supprimés avec succès.");
    } catch (error) {
      setStatus("❌ Échec de la suppression des résultats.");
    }
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.appWindow}>
        <button 
          onClick={() => navigate('/')} 
          style={styles.backButton}
        >
          ← Accueil
        </button>

        <h1 style={{ 
          textAlign: 'center', 
          color: '#2d3748',
          marginBottom: '2rem'
        }}>
          🔍 Résultats de Matching
        </h1>

        {/* Section Vidéo */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📹 Vidéo Source</h2>
          <div>
            <button 
              onClick={triggerFileInput}
              style={styles.fileInputButton}
            >
              Sélectionner une vidéo
            </button>
            <input 
              type="file" 
              accept="video/*"
              onChange={handleVideoUpload}
              style={styles.fileInput}
              ref={fileInputRef}
            />
            
            {videoFile && (
              <div style={styles.videoContainer}>
                <video
                  ref={videoRef}
                  controls
                  style={styles.video}
                />
                <p>🎞️ {videoFile.name}</p>
              </div>
            )}
          </div>
        </section>

        {/* Section Templates */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🖼️ Templates de Recherche</h2>
          <div>
            <button 
              onClick={triggerTemplateInput}
              style={styles.fileInputButton}
            >
              Ajouter des templates
            </button>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleTemplateUpload}
              style={styles.fileInput}
              ref={templateInputRef}
              multiple
            />
            
            {templates.length > 0 ? (
              <div style={styles.templatesContainer}>
                {templates.map(template => (
                  <div key={template.id} style={styles.templateCard}>
                    <button 
                      onClick={() => removeTemplate(template.id)}
                      style={styles.removeTemplate}
                    >
                      ×
                    </button>
                    <img 
                      src={template.preview} 
                      alt={template.name} 
                      style={styles.templatePreview}
                    />
                    <div style={styles.templateName}>{template.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                Aucun template ajouté. Veuillez ajouter des images à rechercher.
              </p>
            )}
          </div>
        </section>

        {/* Section Paramètres */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>⚙️ Paramètres de Recherche</h2>
          
          <div style={styles.confidenceControl}>
            <span>Seuil de confiance :</span>
            <input
              type="range"
              min="0"
              max="100"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(e.target.value)}
              style={styles.confidenceSlider}
            />
            <span style={styles.confidenceValue}>{confidenceThreshold}%</span>
          </div>
        </section>

        {/* Boutons d'action */}
        <div style={styles.actionButtons}>
          <button 
            onClick={searchPatterns}
            style={styles.button}
            disabled={!videoFile || templates.length === 0 || isProcessing}
          >
            {isProcessing ? 'Recherche en cours...' : '🚀 Lancer la recherche'}
          </button>
          
          <button 
            onClick={retrieveResults}
            style={styles.button}
            disabled={!videoFile || templates.length === 0}
          >
            📥 Récupérer les résultats
          </button>
          
          <button 
            onClick={clearResults}
            style={{ 
              ...styles.button,
              backgroundColor: '#dc2626'
            }}
            disabled={!videoFile}
          >
            🗑️ Supprimer les résultats
          </button>
        </div>

        {/* Message de statut */}
        {status && (
          <div style={getStatusStyle()}>
            {status}
          </div>
        )}

        {/* Résultats */}
        {results.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>📊 Résultats détectés</h2>
            
            {results.map((res, idx) => (
              <div key={idx} style={styles.resultCard}>
                <p><strong>🎯 Template :</strong> {res.template_name}</p>
                <p><strong>🖼️ Frame :</strong> {res.frame_id}</p>
                <p><strong>🕓 Timestamp :</strong> {res.timestamp}</p>
                <p><strong>📈 Score :</strong> {res.match_score}</p>
                <p><strong>📌 Position :</strong> x: {res.match_position?.x}, y: {res.match_position?.y}</p>
                <img
                  src={`${FRAME_BASE_URL}/${encodeURIComponent(videoFile.name)}/${res.frame_id}`}
                  alt={res.frame_id}
                  style={styles.resultImage}
                />
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default PatternMatching;