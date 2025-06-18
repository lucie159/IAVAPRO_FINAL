import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectScenes, deleteVideo, getScenes, getFrames } from '../api/apiScene';

function SceneDetection() {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [frames, setFrames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const extractErrorMessage = (error) => {
    const raw = error?.response?.data?.detail || error?.message || "Erreur inconnue";
    if (raw.includes("non authentifié")) return "⛔ Veuillez vous reconnecter.";
    if (raw.includes("non autorisé")) return "⛔ Vous n'avez pas les droits nécessaires.";
    if (raw.includes("introuvable")) return "❌ Fichier ou données introuvables.";
    if (raw.includes("Aucune scène")) return "ℹ️ Aucune scène détectée pour cette vidéo.";
    if (raw.includes("Aucun frame")) return "ℹ️ Aucune image détectée pour cette vidéo.";
    if (raw.includes("Suppression")) return "⚠️ Problème lors de la suppression de la vidéo.";
    return `❌ Erreur : ${raw}`;
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setScenes([]);
      setFrames([]);
      setStatus('');
      const videoURL = URL.createObjectURL(file);
      if (videoRef.current) videoRef.current.src = videoURL;
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const handleDetectScenes = async () => {
    if (!videoFile) return setStatus("❌ Veuillez d'abord sélectionner une vidéo");

    setIsProcessing(true);
    setStatus("⏳ Analyse de la vidéo en cours...");

    try {
      const response = await detectScenes(videoFile);
      setScenes(response.scenes);
      setStatus(`✅ Détection terminée - ${response.scenes.length} scènes trouvées`);
    } catch (err) {
      console.error(err);
      setStatus(extractErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!videoFile) return setStatus("❌ Aucune vidéo à supprimer");

    try {
      await deleteVideo(videoFile.name);
      setVideoFile(null);
      setScenes([]);
      setFrames([]);
      setStatus("✅ Vidéo et données supprimées avec succès");
    } catch (err) {
      console.error(err);
      setStatus(extractErrorMessage(err));
    }
  };

  const fetchSceneAndFrames = async () => {
    if (!videoFile) return;

    try {
      const [scenesRes, framesRes] = await Promise.all([
        getScenes(videoFile.name),
        getFrames(videoFile.name)
      ]);
      setScenes(scenesRes);
      setFrames(framesRes);
      setStatus("✅ Scènes + frames récupérées avec succès");
    } catch (err) {
      console.error(err);
      setStatus(extractErrorMessage(err));
    }
  };

  const handleTimeChange = (id, field, value) => {
    const updated = scenes.map(scene =>
      scene.scene_id === id ? { ...scene, [field]: value } : scene
    );
    setScenes(updated);
  };

  const calculateDuration = (start, end) => {
    const toSec = t => t.split(':').reduce((acc, val, i) => acc + (+val) * [3600, 60, 1][i], 0);
    const total = toSec(end) - toSec(start);
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getStatusStyle = () => {
    if (status.startsWith('✅')) return { color: '#15803d', backgroundColor: '#dcfce7' };
    if (status.startsWith('❌')) return { color: '#b91c1c', backgroundColor: '#fee2e2' };
    if (status.startsWith('⏳')) return { color: '#1d4ed8', backgroundColor: '#dbeafe' };
    if (status.startsWith('ℹ️')) return { color: '#92400e', backgroundColor: '#fef3c7' };
    if (status.startsWith('⛔')) return { color: '#991b1b', backgroundColor: '#ffe4e6' };
    return {};
  };

  const styles = {
    pageBackground: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
    appWindow: { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', width: '90%', maxWidth: '1000px', padding: '40px', position: 'relative', margin: '50px', left: '250px' },
    backButton: { position: 'absolute', top: '20px', left: '20px', padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', color: '#2d3748', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    section: { marginBottom: '2rem', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' },
    sectionTitle: { color: '#4a5568', marginBottom: '1rem', fontSize: '1.2rem' },
    button: { padding: '0.75rem 1.5rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' },
    deleteButton: { backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' },
    fileInputButton: { backgroundColor: '#e2e8f0', color: '#2d3748', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' },
    video: { width: '100%', borderRadius: '8px', marginTop: '1rem' },
    sceneList: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    sceneHeader: { backgroundColor: '#edf2f7', padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' },
    sceneRow: { borderBottom: '1px solid #e2e8f0' },
    sceneCell: { padding: '0.75rem' },
    timeInput: { padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: '4px', width: '80px', textAlign: 'center' },
    status: { margin: '1rem 0', padding: '0.75rem', borderRadius: '8px', fontWeight: '600' },
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.appWindow}>
        <button onClick={() => navigate('/')} style={styles.backButton}>← Accueil</button>

        <h1 style={{ textAlign: 'center', color: '#2d3748' }}>🎬 Découpage de Scènes Vidéo</h1>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📹 Vidéo Source</h2>
          <button onClick={triggerFileInput} style={styles.fileInputButton}>
            {videoFile ? videoFile.name : 'Sélectionner une vidéo...'}
          </button>
          <input type="file" accept="video/*" onChange={handleVideoUpload} ref={fileInputRef} hidden />
          {videoFile && <video ref={videoRef} controls style={styles.video} />}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>✂️ Découpage des Scènes</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleDetectScenes} style={styles.button} disabled={!videoFile || isProcessing}>
              {isProcessing ? 'Analyse en cours...' : 'Détecter les scènes'}
            </button>
            <button onClick={handleDeleteVideo} style={styles.deleteButton} disabled={!videoFile}>
              Supprimer la vidéo
            </button>
            <button onClick={fetchSceneAndFrames} style={styles.fileInputButton} disabled={!videoFile}>
              🔁 Récupérer scènes + frames
            </button>
          </div>

          {scenes.length > 0 && (
            <table style={styles.sceneList}>
              <thead>
                <tr>
                  <th style={styles.sceneHeader}>Scène</th>
                  <th style={styles.sceneHeader}>Début</th>
                  <th style={styles.sceneHeader}>Fin</th>
                  <th style={styles.sceneHeader}>Durée</th>
                  <th style={styles.sceneHeader}>Frames</th>
                </tr>
              </thead>
              <tbody>
                {scenes.map(scene => {
                  const sceneFrames = frames.filter(f => f.scene_id === scene.scene_id);
                  return (
                    <tr key={scene.scene_id} style={styles.sceneRow}>
                      <td style={styles.sceneCell}>Scène {scene.scene_id}</td>
                      <td style={styles.sceneCell}>
                        <input type="text" value={scene.start} onChange={e => handleTimeChange(scene.scene_id, 'start', e.target.value)} style={styles.timeInput} />
                      </td>
                      <td style={styles.sceneCell}>
                        <input type="text" value={scene.end} onChange={e => handleTimeChange(scene.scene_id, 'end', e.target.value)} style={styles.timeInput} />
                      </td>
                      <td style={styles.sceneCell}>{calculateDuration(scene.start, scene.end)}</td>
                      <td style={styles.sceneCell}>
                        {sceneFrames.length > 0
                          ? sceneFrames.map(frame => (
                              <img key={frame.frame_id} src={`http://localhost:8000/${frame.image_path}`} alt="frame" width="80" style={{ marginRight: '5px' }} />
                            ))
                          : <span style={{ color: '#999' }}>Non disponible</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {status && <div style={{ ...styles.status, ...getStatusStyle() }}>{status}</div>}
      </div>
    </div>
  );
}

export default SceneDetection;
