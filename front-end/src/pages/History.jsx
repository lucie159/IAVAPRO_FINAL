// 📁 src/pages/History.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/history/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        setHistory(res.data);
      } catch (err) {
        console.error("❌ Erreur lors du chargement de l'historique :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div style={{ padding: '30px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>🕓 Historique</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : history.length === 0 ? (
        <p>Aucune activité trouvée.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={cellStyle}>Date</th>
              <th style={cellStyle}>Action</th>
              <th style={cellStyle}>Détails</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={idx}>
                <td style={cellStyle}>{item.timestamp}</td>
                <td style={cellStyle}>{item.action}</td>
                <td style={cellStyle}>{item.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const cellStyle = {
  border: '1px solid #e5e7eb',
  padding: '10px',
  fontSize: '14px',
  textAlign: 'left'
};

export default History;
