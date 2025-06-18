import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Historique simulé — à remplacer par des données réelles plus tard
  const fakeHistory = [
    { id: 1, action: 'Annotation d’image', date: '2025-05-30', details: '5 images étiquetées' },
    { id: 2, action: 'Export JSON', date: '2025-05-29', details: 'export_annotations_0529.json' },
    { id: 3, action: 'Détection de scènes', date: '2025-05-28', details: 'video_scene_demo.mp4' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Profil utilisateur</h2>

      {user ? (
        <div style={styles.card}>
          <p><strong>Nom d'utilisateur :</strong> {user.username}</p>
          <p><strong>Email :</strong> {user.email}</p>

          <h3 style={{ marginTop: '2rem' }}>Historique</h3>
          <ul style={styles.historyList}>
            {fakeHistory.map(item => (
              <li key={item.id} style={styles.historyItem}>
                <strong>{item.action}</strong> — {item.date}
                <br />
                <span style={{ color: '#4a5568' }}>{item.details}</span>
              </li>
            ))}
          </ul>

          <button onClick={() => navigate('/home')} style={styles.backButton}>← Retour à l’accueil</button>
        </div>
      ) : (
        <p>Utilisateur non connecté.</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '4rem auto',
    padding: '2rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: '10px',
  },
  header: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: '#2d3748'
  },
  card: {
    fontSize: '1rem',
    lineHeight: '1.6'
  },
  historyList: {
    listStyleType: 'none',
    padding: 0,
    marginTop: '1rem'
  },
  historyItem: {
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#f7fafc',
    borderRadius: '6px',
    borderLeft: '4px solid #4f46e5'
  },
  backButton: {
    marginTop: '2rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default Profile;
