import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Preview() {
  const [annotations, setAnnotations] = useState({});

  useEffect(() => {
    fetchAnnotations();
  }, []);

  const fetchAnnotations = async () => {
    try {
      const res = await axios.get("http://localhost:8000/annotations");
      setAnnotations(res.data);
    } catch (error) {
      console.error("Erreur de récupération :", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📋 Aperçu des annotations</h2>
      {Object.keys(annotations).length === 0 ? (
        <p>😕 Aucune annotation trouvée.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Image</th>
              <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Classe</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(annotations).map(([filename, label], index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  <img
                    src={`http://localhost:8000/temp/${filename}`}
                    alt={filename}
                    style={{ width: "120px", height: "auto", borderRadius: "4px" }}
                  />
                  <div>{filename}</div>
                </td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem", textTransform: "capitalize" }}>{label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Preview;
