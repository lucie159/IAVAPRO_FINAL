// Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const modules = [
  { label: '📂 Annotation', path: '/annotation' },
  { label: '🎯 Tracking', path: '/tracking' },
  { label: '🎬 Scènes', path: '/scenes' },
  { label: '🔍 Recherche', path: '/patterns' },
  { label: '😊 Visages', path: '/faces' },
  { label: '📦 Exporter', path: '/export' },
];

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState('');
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const username = payload.username || payload.email || 'Utilisateur';
        setUsername(username);
      } catch (err) {
        console.warn("❗ Token invalide.");
      }
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return '👤';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/auth');
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(atob(token.split('.')[1]))?.user_id;
      if (!userId) {
        alert("Utilisateur non authentifié.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/exports/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'export.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_utilisateur_${userId}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Export échoué :", error);
      alert("Erreur lors de l'export des données.");
    }
  };

  if (location.pathname === '/') return null;

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContent}>
        <span style={styles.navTitle} onClick={() => navigate('/home')}>IAVAP PRO</span>

        <div style={styles.navLinks}>
          {modules.map((mod, idx) => (
            mod.label === '📦 Exporter' ? (
              <button key={idx} onClick={handleExport} style={styles.navButton}>
                {mod.label}
              </button>
            ) : (
              <button
                key={idx}
                onClick={() => navigate(mod.path)}
                style={location.pathname === mod.path ? styles.activeNavButton : styles.navButton}
              >
                {mod.label}
              </button>
            )
          ))}
        </div>

        <div style={styles.profileContainer} ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.profileButton}>
            {getInitials(username)}
          </button>
          {dropdownOpen && (
            <div style={styles.dropdownMenu}>
              <button onClick={() => navigate('/profile')} style={styles.dropdownItem}>👤Mon Profil</button>
              <button onClick={() => navigate('/history')} style={styles.dropdownItem}>🕓Historique</button>
              <button onClick={handleLogout} style={styles.dropdownItemDanger}>🔓Déconnexion</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px'
  },
  navContent: {
    width: '100%',
    maxWidth: '1300px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navTitle: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: '#2d3748',
    cursor: 'pointer'
  },
  navLinks: {
    display: 'flex',
    gap: '12px'
  },
  navButton: {
    background: 'transparent',
    color: '#4a5568',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease'
  },
  activeNavButton: {
    background: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  profileContainer: {
    position: 'relative'
  },
  profileButton: {
    background: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    fontSize: '0.95rem',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '110%',
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000
  },
  dropdownItem: {
    padding: '8px 12px',
    fontSize: '0.9rem',
    color: '#2d3748',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer'
  },
  dropdownItemDanger: {
    padding: '8px 12px',
    fontSize: '0.9rem',
    color: '#e53e3e',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer'
  }
};

export default Navbar;
