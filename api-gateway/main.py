from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

# Routers
from routers.annotation_router import router as annotation_router
from routers.scene_splitter_router import router as scene_router
from routers.face_detector_router import router as face_detector_router
from routers.profile_router import router as profile_router
from routers.history_router import router as history_router
from routers.export_router import router as export_router
from routers.pattern_matcher_router import router as pattern_matcher_router
from routers.tracking_router import router as tracking_router
# Middleware d’authentification
from auth import inject_user_middleware

# Chargement des variables d’environnement
load_dotenv(dotenv_path="../.env")

app = FastAPI(title="API Gateway")

# ✅ Ajout du middleware personnalisé pour l'injection du user_id
app.middleware("http")(inject_user_middleware)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dossier statique du service video-scene-splitter
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(BASE_DIR, "../video-scene-splitter/static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Inclusion des routers des microservices
app.include_router(annotation_router)
app.include_router(scene_router)
app.include_router(face_detector_router)
app.include_router(profile_router)
app.include_router(history_router)
app.include_router(export_router)
app.include_router(pattern_matcher_router)
app.include_router(tracking_router)
# Message de démarrage (optionnel)
# @app.on_event("startup")
# async def startup_event():
#     print("✅ API Gateway is running")
