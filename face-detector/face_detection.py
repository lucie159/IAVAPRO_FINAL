import os
import cv2
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
from sklearn.metrics.pairwise import cosine_similarity
from db import detections_col

def detect_and_recognize_faces_from_frames(
    frames_folder,
    reference_image_path,
    threshold=0.5,
    reference_original_name=None,
    video_name=None,
    user_id=None
):
    print(f"🔍 Début de la détection pour user_id={user_id}")
    print(f"📁 Dossier des frames : {frames_folder}")
    print(f"🖼️ Image de référence : {reference_image_path}")

    if not os.path.isdir(frames_folder):
        return {"error": f"Dossier introuvable : {frames_folder}"}

    if not os.path.isfile(reference_image_path):
        return {"error": f"Image de référence introuvable : {reference_image_path}"}

    mtcnn = MTCNN(keep_all=True, image_size=160)
    resnet = InceptionResnetV1(pretrained='vggface2').eval()

    try:
        ref_img = Image.open(reference_image_path).convert('RGB')
        ref_face = mtcnn(ref_img)

        if ref_face is None:
            return {"error": "Aucun visage détecté dans l'image de référence."}

        ref_embedding = resnet(ref_face.unsqueeze(0)) if ref_face.ndim == 3 else resnet(ref_face[0].unsqueeze(0))
        print("✅ Embedding de l'image de référence généré.")
    except Exception as e:
        return {"error": f"Erreur lors du traitement de l'image de référence : {str(e)}"}

    results = []
    image_files = sorted(f for f in os.listdir(frames_folder) if f.lower().endswith(('.jpg', '.png')))

    if video_name is None:
        video_name = os.path.basename(frames_folder)

    stored_filename = os.path.basename(reference_image_path)

    for file in image_files:
        frame_path = os.path.join(frames_folder, file)
        try:
            frame = cv2.imread(frame_path)
            if frame is None:
                print(f"⚠️ Frame illisible : {file}")
                continue

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            boxes, _ = mtcnn.detect(frame_rgb)
            faces = mtcnn(frame_rgb)
        except Exception as e:
            print(f"⚠️ Erreur de traitement sur la frame {file} : {e}")
            continue

        if faces is not None and boxes is not None:
            for i in range(faces.shape[0]):
                try:
                    emb = resnet(faces[i].unsqueeze(0))
                    sim = cosine_similarity(ref_embedding.detach().numpy(), emb.detach().numpy())[0][0]

                    if sim >= threshold:
                        scene_id = extract_scene_id(file)
                        match_info = {
                            "frame": file,
                            "similarity": float(sim),
                            "box": [int(x) for x in boxes[i]],
                            "video": video_name,
                            "scene_id": scene_id,
                            "reference": reference_original_name,
                            "stored_filename": stored_filename,
                            "user_id": user_id
                        }

                        detections_col.update_one(
                            {
                                "frame": file,
                                "reference": reference_original_name,
                                "video": video_name,
                                "user_id": user_id
                            },
                            {"$set": match_info},
                            upsert=True
                        )

                        results.append(match_info)
                        print(f"✅ Match enregistré pour frame {file} avec {sim:.3f}")
                except Exception as e:
                    print(f"❌ Erreur de similarité pour frame {file} : {e}")
                    continue
        else:
            print(f"🚫 Aucun visage détecté dans la frame {file}")

    print(f"✅ Total des correspondances : {len(results)}")

    try:
        return {
            "matches": results,
            "video": video_name,
            "reference": reference_original_name
        }
    except Exception as e:
        print("❌ Erreur lors du retour JSON :", str(e))
        return {"error": f"Erreur de sérialisation : {str(e)}"}

def extract_scene_id(filename):
    try:
        name = os.path.splitext(filename)[0]
        if "scene" in name:
            parts = name.split("_")
            for part in parts:
                if part.startswith("scene"):
                    return int(part.replace("scene", ""))
    except Exception:
        pass
    return None
