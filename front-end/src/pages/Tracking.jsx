import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Tracking() {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [objectsToTrack, setObjectsToTrack] = useState([]);
  const [newObject, setNewObject] = useState('');
  const [status, setStatus] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleVideoUpload = (e) => {
    console.log('Tentative de chargement de vidéo...');
    const file = e.target.files[0];
    if (file) {
      console.log('Fichier vidéo sélectionné:', file.name);
      setVideoFile(file);
      const videoURL = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = videoURL;
        console.log('Prévisualisation vidéo initialisée');
      }
    } else {
      console.warn('Aucun fichier vidéo sélectionné');
    }
  };

  const handleAddObject = () => {
    if (newObject.trim() === '') {
      console.warn('Tentative d\'ajout d\'un objet vide');
      return;
    }
    console.log('Ajout d\'un nouvel objet à tracker:', newObject.trim());
    setObjectsToTrack([...objectsToTrack, newObject.trim()]);
    setNewObject('');
  };

  const handleRemoveObject = (index) => {
    console.log('Suppression de l\'objet:', objectsToTrack[index]);
    const updated = [...objectsToTrack];
    updated.splice(index, 1);
    setObjectsToTrack(updated);
  };

  const handleStartTracking = () => {
    console.log('Début du tracking...');
    if (!videoFile) {
      const errorMsg = "Veuillez d'abord sélectionner une vidéo";
      console.error(errorMsg);
      setStatus(errorMsg);
      return;
    }

    if (objectsToTrack.length === 0) {
      const errorMsg = "Veuillez ajouter au moins un objet à tracker";
      console.error(errorMsg);
      setStatus(errorMsg);
      return;
    }

    console.log('Tracking démarré pour:', objectsToTrack);
    setStatus("⏳ Tracking en cours...");
    // Simulation de tracking
    setTimeout(() => {
      console.log('Tracking terminé avec succès');
      setStatus("✅ Tracking terminé");
    }, 2000);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Styles
  const styles = {
    pageBackground: {
      minHeight: '100vh',
      //backgroundColor: '#f0f2f5',
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
      position: 'relative',
      margin: '50px',
      left :'320px'
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
        backgroundColor: '#cbd5e0',
        transform: 'translateY(-2px)'
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
      fontSize: '1.2rem'
    },
    inputGroup: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem'
    },
    input: {
      flex: 1,
      padding: '0.75rem',
      border: '1px solid #cbd5e0',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      ':focus': {
        outline: 'none',
        borderColor: '#4f46e5',
        boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.2)'
      }
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
    objectList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    objectItem: {
      backgroundColor: '#edf2f7',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center'
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
      color: '#e53e3e',
      fontWeight: '600',
      padding: '0.5rem',
      borderRadius: '4px',
      backgroundColor: '#fee2e2'
    },
    successStatus: {
      color: '#15803d',
      backgroundColor: '#dcfce7'
    },
    processingStatus: {
      color: '#1d4ed8',
      backgroundColor: '#dbeafe'
    }
  };

  const getStatusStyle = () => {
    if (status.startsWith('✅')) return { ...styles.status, ...styles.successStatus };
    if (status.startsWith('⏳')) return { ...styles.status, ...styles.processingStatus };
    return styles.status;
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
          🎯 Module de Tracking
        </h1>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📹 Sélection de vidéo</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              onClick={triggerFileInput}
              style={styles.fileInputButton}
            >
              {videoFile ? videoFile.name : 'Choisir une vidéo...'}
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
                <canvas
                  ref={canvasRef}
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none'
                  }}
                />
              </div>
            )}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🔍 Objets à tracker</h2>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={newObject}
              onChange={(e) => setNewObject(e.target.value)}
              placeholder="Nom de l'objet"
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleAddObject()}
            />
            <button 
              onClick={handleAddObject}
              style={styles.button}
            >
              Ajouter
            </button>
          </div>
          <ul style={styles.objectList}>
            {objectsToTrack.map((obj, index) => (
              <li key={index} style={styles.objectItem}>
                {obj}
                <button 
                  onClick={() => handleRemoveObject(index)}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#e53e3e',
                    marginLeft: '0.5rem',
                    fontSize: '1rem',
                    ':hover': {
                      transform: 'scale(1.2)'
                    }
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>

        {status && (
          <p style={getStatusStyle()}>
            {status}
          </p>
        )}

        <button 
          onClick={handleStartTracking}
          style={{ 
            ...styles.button,
            display: 'block',
            width: '100%',
            marginTop: '1rem',
            fontSize: '1.1rem',
            padding: '1rem'
          }}
          disabled={!videoFile || objectsToTrack.length === 0}
        >
          🚀 Démarrer le Tracking
        </button>
      </div>
    </div>
  );
}

export default Tracking;