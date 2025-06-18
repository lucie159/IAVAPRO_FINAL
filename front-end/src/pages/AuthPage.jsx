import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AuthPage = ({ setIsAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      navigate('/home');
    }
  }, [token, navigate, setIsAuthenticated]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">{isLogin ? 'Connexion' : 'Inscription'}</h2>
          
          {isLogin ? (
            <>
              <Login setIsAuthenticated={setIsAuthenticated} />
              <p className="auth-toggle-text">
                Pas encore de compte ?{' '}
                <button 
                  onClick={() => setIsLogin(false)} 
                  className="auth-toggle-button"
                >
                  S'inscrire
                </button>
              </p>
            </>
          ) : (
            <>
              <Register setIsAuthenticated={setIsAuthenticated} />
              <p className="auth-toggle-text">
                Déjà inscrit ?{' '}
                <button 
                  onClick={() => setIsLogin(true)} 
                  className="auth-toggle-button"
                >
                  Se connecter
                </button>
              </p>
            </>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default AuthPage;