import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectFaces, getStructuredMatches, deleteMatches } from '../api/apiFace';

function FaceRecognition() {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [threshold, setThreshold] = useState(0.5);
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const fileVideoRef = useRef(null);
  const fileRefRef = useRef(null);

  const FRAME_BASE_URL = import.meta.env.VITE_FRAME_BASE_URL || "http://localhost:8004/static/frames";

  // Styles cohérents avec PatternMatching
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
      marginTop: '1.5rem',
      flexWrap: 'wrap'
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
    referenceImage: {
      maxWidth: '100%',
      maxHeight: '300px',
      borderRadius: '8px',
      marginTop: '1rem'
    },
    sceneCard: {
      border: '1px solid #e2e8f0',
      padding: '1rem',
      marginBottom: '1.5rem',
      borderRadius: '8px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    frameContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginTop: '1rem'
    },
    frameCard: {
      width: '180px',
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '10px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    frameImage: {
      width: '100%',
      borderRadius: '4px',
      marginBottom: '5px'
    }
  };

  const getStatusStyle = () => {
    if (status.startsWith('✅') || status.includes('succès')) return { ...styles.status, ...styles.successStatus };
    if (status.startsWith('❌') || status.includes('Erreur')) return { ...styles.status, ...styles.errorStatus };
    if (status.startsWith('⏳') || status.includes('en cours')) return { ...styles.status, ...styles.processingStatus };
    return { ...styles.status, ...styles.processingStatus };
  };

  // Nettoyer les URLs créées pour éviter les fuites de mémoire
  useEffect(() => {
    return () => {
      if (videoRef.current?.src) {
        URL.revokeObjectURL(videoRef.current.src);
      }
    };
  }, []);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const videoURL = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = videoURL;
        // Forcer le rechargement de la vidéo
        videoRef.current.load();
      }
    }
  };

  const handleReferenceUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReferenceImage(file);
    }
  };

  const triggerVideoInput = () => fileVideoRef.current.click();
  const triggerRefInput = () => fileRefRef.current.click();

  const handleDetectFaces = async () => {
    if (!videoFile || !referenceImage) {
      setStatus("❌ Veuillez sélectionner la vidéo ET l'image de référence");
      return;
    }

    try {
      setIsProcessing(true);
      setStatus("⏳ Analyse en cours...");

      await detectFaces(videoFile, referenceImage, threshold);
      setStatus("✅ Analyse terminée. Cliquez sur Récupérer les résultats");
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || "Erreur inconnue";
      console.error("❌ Erreur complète:", error);
      setStatus(`❌ Erreur: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetrieveResults = async () => {
    if (!referenceImage || !videoFile) {
      setStatus("❌ Aucune image ou vidéo sélectionnée");
      return;
    }

    try {
      setStatus("🔍 Récupération des résultats...");
      const res = await getStructuredMatches(referenceImage.name, videoFile.name);

      if (res.scenes_with_matches?.length > 0) {
        const matchCount = res.scenes_with_matches.reduce(
          (acc, scene) => acc + scene.frames.filter(f => f.similarity >= threshold).length, 0
        );

        setResults(res.scenes_with_matches);
        setStatus(`✅ ${res.scenes_with_matches.length} scènes détectées (${matchCount} correspondances)`);
      } else {
        setResults([]);
        setStatus(`ℹ️ Aucune correspondance avec le seuil actuel (${threshold}). Essayez un seuil plus bas.`);
      }
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || "Erreur inconnue";
      setStatus(`❌ Erreur récupération : ${msg}`);
    }
  };

  const handleDeleteMatches = async () => {
    if (!referenceImage || !videoFile) {
      setStatus("❌ Sélectionnez les fichiers d'abord");
      return;
    }

    try {
      setStatus("🗑️ Suppression en cours...");
      await deleteMatches(referenceImage.name, videoFile.name);
      setResults(null);
      setStatus("✅ Résultats supprimés avec succès");
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || "Erreur inconnue";
      setStatus(`❌ Suppression échouée : ${msg}`);
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
          👤 Reconnaissance Faciale
        </h1>

        {/* Section Vidéo */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📹 Vidéo Source</h2>
          <button 
            onClick={triggerVideoInput}
            style={styles.fileInputButton}
          >
            {videoFile ? videoFile.name : 'Sélectionner une vidéo'}
          </button>
          <input 
            type="file" 
            accept="video/*" 
            ref={fileVideoRef} 
            onChange={handleVideoUpload} 
            style={styles.fileInput} 
          />
          
          {videoFile && (
            <div style={styles.videoContainer}>
              <video
                ref={videoRef}
                controls
                autoPlay
                muted
                playsInline
                key={videoFile.name}
                style={styles.video}
              />
            </div>
          )}
        </section>

        {/* Section Image de Référence */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>👤 Image de Référence</h2>
          <button 
            onClick={triggerRefInput}
            style={styles.fileInputButton}
          >
            {referenceImage ? referenceImage.name : 'Choisir une image'}
          </button>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileRefRef} 
            onChange={handleReferenceUpload} 
            style={styles.fileInput} 
          />
          
          {referenceImage && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={URL.createObjectURL(referenceImage)}
                alt="référence"
                style={styles.referenceImage}
              />
            </div>
          )}
        </section>

        {/* Section Paramètres */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>⚙️ Paramètres</h2>
          
          <div style={styles.confidenceControl}>
            <span>Seuil de confiance : {threshold.toFixed(2)}</span>
            <input 
              type="range" 
              min="0.3" 
              max="0.9" 
              step="0.01" 
              value={threshold} 
              onChange={(e) => setThreshold(parseFloat(e.target.value))} 
              style={styles.confidenceSlider} 
            />
          </div>
        </section>

        {/* Boutons d'action */}
        <div style={styles.actionButtons}>
          <button 
            onClick={handleDetectFaces} 
            style={{ 
              ...styles.button,
              backgroundColor: isProcessing ? '#a5b4fc' : '#4f46e5'
            }}
            disabled={isProcessing || !videoFile || !referenceImage}
          >
            {isProcessing ? "Analyse en cours..." : "🔍 Détecter les visages"}
          </button>
          
          <button 
            onClick={handleRetrieveResults} 
            style={{ 
              ...styles.button,
              backgroundColor: '#059669'
            }}
            disabled={!videoFile || !referenceImage}
          >
            📥 Récupérer les résultats
          </button>
          
          <button 
            onClick={handleDeleteMatches} 
            style={{ 
              ...styles.button,
              backgroundColor: '#ef4444'
            }}
            disabled={!videoFile || !referenceImage}
          >
            🗑️ Supprimer
          </button>
        </div>

        {/* Message de statut */}
        {status && (
          <div style={getStatusStyle()}>
            {status}
          </div>
        )}

        {/* Résultats */}
        {results && results.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>📊 Résultats</h2>
            
            {results.map((scene, index) => (
              <div key={index} style={styles.sceneCard}>
                <h3 style={{ color: '#4f46e5', marginTop: 0 }}>🎬 Scène {scene.scene_id}</h3>
                <p style={{ color: '#64748b', marginBottom: '10px' }}>
                  Période : {scene.start} – {scene.end}
                </p>
                
                <div style={styles.frameContainer}>
                  {scene.frames.map((frame, i) => (
                    <div key={i} style={styles.frameCard}>
                      <img 
                        src={`${FRAME_BASE_URL}/${encodeURIComponent(videoFile.name)}/${frame.frame}`} 
                        alt={`frame-${frame.frame}`} 
                        style={styles.frameImage} 
                      />
                      <p style={{ margin: '5px 0' }}>
                        <strong>🖼️ Frame:</strong> {frame.frame}
                      </p>
                      <p style={{ margin: '5px 0' }}>
                        <strong>🎯 Similarité:</strong> {(frame.similarity * 100).toFixed(1)}%
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        📦 Box: [{frame.box?.join(', ') || 'N/A'}]
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default FaceRecognition;