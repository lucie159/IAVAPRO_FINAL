import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const modules = [
    { 
      path: "/annotation", 
      icon: "📂", 
      label: "Annotation",
      description: "Étiquetage manuel des images",
      color: "#4f46e5"
    },
    { 
      path: "/tracking", 
      icon: "🎯", 
      label: "Tracking",
      description: "Suivi d'objets en vidéo",
      color: "#10b981"
    },
    { 
      path: "/scenes", 
      icon: "🎬", 
      label: "Scènes",
      description: "Découpage automatique",
      color: "#f59e0b"
    },
    { 
      path: "/patterns", 
      icon: "🔍", 
      label: "Recherche",
      description: "Détection par template",
      color: "#ef4444"
    },
    { 
      path: "/faces", 
      icon: "😊", 
      label: "Visages",
      description: "Reconnaissance faciale",
      color: "#8b5cf6"
    },
    { 
      path: "/exports", 
      icon: "📤", 
      label: "Exports",
      description: "Génération de rapports",
      color: "#06b6d4"
    }
  ];

  return (
    <div style={styles.pageBackground}>
      <div style={styles.appWindow}>
        <header style={styles.header}>
          <h1 style={styles.appTitle}>IAVAP PRO</h1>
          <p style={styles.appSubtitle}>Plateforme de Vision par Ordinateur</p>
        </header>

        <div style={styles.gridContainer}>
          {modules.map((mod, index) => (
            <Link 
              to={mod.path} 
              key={index} 
              style={{ 
                ...styles.card,
                '--hover-color': mod.color
              }}
              className="module-card"
            >
              <div style={{
                ...styles.iconContainer,
                backgroundColor: `rgba(${hexToRgb(mod.color)}, 0.1)`
              }}>
                <span style={styles.icon}>{mod.icon}</span>
              </div>
              <h3 style={styles.cardTitle}>{mod.label}</h3>
              <p style={styles.cardDescription}>{mod.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

const styles = {
  pageBackground: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f2f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box'
  },
  appWindow: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)',
    width: '90%',
    maxWidth: '1000px',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.05)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  appTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0 0 8px 0',
    letterSpacing: '1px'
  },
  appSubtitle: {
    fontSize: '1.1rem',
    color: '#4a5568',
    margin: 0,
    fontWeight: '400'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(2, 180px)',
    gap: '25px',
    justifyItems: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: '700px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    textDecoration: 'none',
    color: '#2d3748',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.4s',
    border: '1px solid #e2e8f0'
  },
  iconContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px'
  },
  icon: {
    fontSize: '28px'
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#1a202c'
  },
  cardDescription: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#718096',
    textAlign: 'center',
    lineHeight: '1.4'
  }
};

const globalStyles = `
  .module-card:hover {
    transform: translateY(-9px) scale(1.05);
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.1);
    border-color: var(--hover-color);
  }

  .module-card:hover h3 {
    color: var(--hover-color);
  }

  .module-card:hover div {
    background-color: rgba(var(--hover-color), 0.2) !important;
  }

  .module-card:hover span {
    transform: scale(1.1);
  }
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = globalStyles;
document.head.appendChild(styleElement);

export default Home;