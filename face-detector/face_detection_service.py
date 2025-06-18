import os
import httpx
from utils import save_file_async
from face_detection import detect_and_recognize_faces_from_frames

# Répertoires de travail
REFERENCE_DIR = "references"
UPLOAD_DIR = "uploads" # repertoire temporaire 
FRAMES_DIR = os.getenv("FRAMES_DIR", "../video-scene-splitter/static/frames")  # Configurable via .env

# Adresse du microservice scene-splitter (REST direct, sans passer par le gateway )
SCENE_BASE_URL = os.getenv("SCENE_API_URL", "http://localhost:8004")

async def handle_face_detection(video_file, reference_image, threshold, user_id):
    print("🟢 Début du traitement de détection faciale")
    print(f"👤 user_id reçu : {user_id}")
    print(f"📁 Répertoire frames attendu : {FRAMES_DIR}")

    os.makedirs(REFERENCE_DIR, exist_ok=True)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Sauvegarde des fichiers vidéo et image de référence
    video_path = await save_file_async(video_file, UPLOAD_DIR)
    reference_path = await save_file_async(reference_image, REFERENCE_DIR)

    print(f"✅ Fichiers sauvegardés: {video_path}, {reference_path}")

    video_name = video_file.filename
    reference_original_name = reference_image.filename

    # 🔁 Appel direct au microservice scene-splitter
    async with httpx.AsyncClient() as client:
        with open(video_path, "rb") as f:
            files = {"file": (video_file.filename, f, "video/mp4")}
            headers = {"user_id": user_id}

            scene_route = f"{SCENE_BASE_URL}/detect"
            print(f"🌐 Appel vers scene-splitter : {scene_route}")

            response = await client.post(scene_route, files=files, headers=headers)
            print(f"🔄 Statut de la réponse scene-splitter : {response.status_code}")
            if response.status_code != 200:
                return {
                    "error": "Erreur depuis le microservice scene-splitter",
                    "detail": response.text
                }

    # Vérification du dossier de frames généré
    frames_folder = os.path.join(FRAMES_DIR, video_name)
    if not os.path.isdir(frames_folder):
        return {"error": f"Dossier de frames introuvable : {frames_folder}"}

    # Détection des visages sur les frames
    return detect_and_recognize_faces_from_frames(
        frames_folder=frames_folder,
        reference_image_path=reference_path,
        threshold=threshold,
        reference_original_name=reference_original_name,
        video_name=video_name,
        user_id=user_id
    )
