# IAVAP PRO – Plateforme de Vision par Ordinateur en Microservices
Version semi complete du projet

##  Description

**IAAVAP PRO** (Image Analysis and Vision by Artificial Perception) est une plateforme modulaire de vision par ordinateur basée sur une architecture **microservices**. Elle propose des outils de traitement d’images et de vidéos destinés à l’annotation, la reconnaissance faciale, la détection de scènes, le suivi d’objets, la recherche de motifs et l’exportation de données.

Cette application est construite avec **FastAPI** pour le backend, **React.js** pour le frontend, **MongoDB** et **PostgreSQL** pour les bases de données, et **Docker** pour l’orchestration des services.

---

##  Fonctionnalités principales

| Module              | Description |
|---------------------|-------------|
| Annotation        | Annoter des images avec des classes personnalisées. |
| Tracking          | Suivi d’objets dans des séquences vidéo. |
| Détection de scènes | Extraction automatique de scènes et frames. |
| Reconnaissance faciale | Identification de visages dans des vidéos à l’aide d’un modèle entraîné. |
| Recherche de motifs | Détection de motifs spécifiques dans des images ou vidéos. |
| Historique         | Historique des actions effectuées par chaque utilisateur. |
| Exportation        | Exporter les résultats (annotations, frames, visages, etc.) au format `.zip`. |
| Profil utilisateur | Gestion du compte utilisateur. |

---

## Structure du projet

```
project-root/
├── api-gateway/
├── annotation_service/
├── tracking_service/
├── pattern_service/
├── video-scene-splitter/
├── face-detector/
├── export_service/
├── frontend/
├── .env
├── docker-compose.yml
└── README.md
```

---

##  Démarrage rapide

### 1. Cloner le projet
```bash
git clone https://github.com/votre-utilisateur/iavap-pro.git
cd iavap-pro
```

### 2. Configurer l’environnement

Créer un fichier `.env` à la racine :
```env
# Gateway
VITE_API_GATEWAY_URL=http://localhost:8000
GATEWAY_API_URL=http://localhost:8000

# Microservices
ANNOTATOR_URL=http://localhost:8001
PATTERN_API_URL=http://localhost:8002
TRACKING_API_URL=http://localhost:8003
SCENE_API_URL=http://localhost:8004
FACE_API_URL=http://localhost:8005
EXPORT_API_URL=http://localhost:8006

# Base de données
MONGO_URI=mongodb://localhost:27017
POSTGRES_URI=postgresql://user:password@localhost:5432/iavap_db

# Sécurité
JWT_SECRET=supersecretkey

# Répertoires
FRAMES_DIR=../video-scene-splitter/static/frames
```

### 3. Lancer avec Docker
```bash
docker-compose up --build
```

---

##  Accès à l'application

- **Frontend React** : http://localhost:5173  
- **API Gateway** : http://localhost:8000  
- **MongoDB** : `localhost:27017`  
- **PostgreSQL** : `localhost:5432` (gestion des utilisateurs)

---

##  Authentification

L’application utilise **JWT (JSON Web Tokens)** pour sécuriser les sessions. Les données utilisateur sont stockées dans **PostgreSQL**.

---

## Exports

L’utilisateur peut :
- Exporter les **résultats d’un module** (via un bouton spécifique).
- Exporter **toutes les données liées à son compte** (annotations, visages, scènes, etc.).

Chaque exportation génère un fichier `.zip` contenant des fichiers `.json`, `.csv`, et/ou des images selon le cas.

---

## 📚 Technologies utilisées

- **Frontend** : React, Vite, Tailwind CSS
- **Backend** : FastAPI, Python 3.10+
- **Base de données** : MongoDB, PostgreSQL
- **Authentification** : JWT
- **Traitement vidéo/image** : OpenCV, MTCNN, InceptionResnetV1, NumPy
- **Containerisation** : Docker & Docker Compose

---

##  Tests

Chaque microservice peut être testé indépendamment :
```bash
uvicorn main:app --reload
```
Tester via Swagger UI : `http://localhost:800X/docs`

---

##  Améliorations futures

- Segmentation sémantique, annotation manuelle
- Tableau de bord analytique
- Support multilingue
- Déploiement cloud (Render, AWS, etc.)

---

##  Licence

Ce projet est sous licence MIT – voir le fichier [LICENSE](./LICENSE) pour plus d’informations.
