import React, { useEffect, useState } from 'react';
import axios from 'axios';
import defaultAvatar from '../assets/avatar.png'; // Avatar par defaut

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(response.data);
      } catch (err) {
        console.error("Erreur de chargement du profil :", err);
        setError("Impossible de charger les informations du profil.");
      }
    };

    fetchProfile();
  }, []);

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '50px auto',
      padding: '20px',
      borderRadius: '10px',
      backgroundColor: '#f8fafc',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif'
    },
    title: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '22px',
      fontWeight: '600',
      color: '#1f2937'
    },
    avatar: {
      display: 'block',
      margin: '0 auto 20px',
      borderRadius: '50%',
      width: '120px',
      height: '120px',
      objectFit: 'cover',
      border: '4px solid #e2e8f0'
    },
    field: {
      marginBottom: '12px',
      fontSize: '16px',
      color: '#374151'
    },
    label: {
      fontWeight: '600',
      marginRight: '8px',
      color: '#1f2937'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👤 Mon Profil</h2>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {profile && (
        <>
          <img
            src={defaultAvatar}
            alt="Avatar"
            style={styles.avatar}
          />
          <div style={styles.field}><span style={styles.label}>🆔 ID:</span> {profile.id}</div>
          <div style={styles.field}><span style={styles.label}>👤 Nom:</span> {profile.username}</div>
          <div style={styles.field}><span style={styles.label}>📧 Email:</span> {profile.email}</div>
          <div style={styles.field}><span style={styles.label}>🕓 Inscription:</span> {new Date(profile.created_at).toLocaleString()}</div>
        </>
      )}
    </div>
  );
};

export default Profile;
