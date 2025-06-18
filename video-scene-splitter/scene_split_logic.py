import os
import cv2
import datetime
from fastapi import UploadFile, HTTPException
from db import scenes_col, frames_col


def clean_doc(doc):
    doc = dict(doc)
    doc.pop('_id', None)
    return doc


async def save_file_async(file: UploadFile, folder: str):
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, os.path.basename(file.filename))
    with open(path, "wb") as f:
        content = await file.read()
        f.write(content)
    return path


def format_time(seconds):
    return str(datetime.timedelta(seconds=int(seconds)))


def extract_scene_frames(video_path, start_time, end_time, scene_id, video_name, fps, user_id):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return

    start_sec = int(start_time)
    end_sec = max(int(end_time), start_sec + 1)

    output_folder = os.path.join("static/frames", video_name)
    os.makedirs(output_folder, exist_ok=True)

    for sec in range(start_sec, end_sec):
        cap.set(cv2.CAP_PROP_POS_MSEC, sec * 1000)
        ret, frame = cap.read()
        if not ret:
            continue

        frame_id = f"scene{scene_id}_{sec}"
        image_path = os.path.join(output_folder, f"{frame_id}.jpg")
        cv2.imwrite(image_path, frame)

        frame_data = {
            "scene_id": scene_id,
            "video_name": video_name,
            "frame_id": frame_id,
            "timestamp": sec,
            "image_path": image_path,
            "user_id": user_id
        }

        frames_col.update_one(
            {"scene_id": scene_id, "timestamp": sec, "user_id": user_id},
            {"$set": frame_data},
            upsert=True
        )

    cap.release()


def detect_scenes(video_path, user_id, threshold=0.5):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return []

    scenes = []
    prev_hist, start_time = None, 0.0
    scene_id, fps = 1, cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    last_time = 0.0
    video_name = os.path.basename(video_path)

    for i in range(frame_count):
        ret, frame = cap.read()
        if not ret:
            break

        time = i / fps
        last_time = time

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = cv2.normalize(hist, hist).flatten()

        if prev_hist is not None:
            diff = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_BHATTACHARYYA)
            if diff > threshold:
                scenes.append(store_scene(start_time, time, scene_id, video_name, video_path, fps, user_id))
                scene_id += 1
                start_time = time
        prev_hist = hist

    scenes.append(store_scene(start_time, last_time, scene_id, video_name, video_path, fps, user_id))
    cap.release()
    return scenes


def store_scene(start_time, end_time, scene_id, video_name, video_path, fps, user_id):
    scene = {
        "scene_id": scene_id,
        "start": format_time(start_time),
        "end": format_time(end_time),
        "video_name": video_name,
        "user_id": user_id
    }
    scenes_col.update_one(
        {"video_name": video_name, "scene_id": scene_id, "user_id": user_id},
        {"$set": scene},
        upsert=True
    )
    extract_scene_frames(video_path, start_time, end_time, scene_id, video_name, fps, user_id)
    return scene


async def process_video(file: UploadFile, user_id: str):
    path = await save_file_async(file, "videos")
    video_name = os.path.basename(path)
    scenes = detect_scenes(path, user_id)

    grouped_frames = {}
    for frame in frames_col.find({"video_name": video_name, "user_id": user_id}, {"_id": 0}):
        sid = frame["scene_id"]
        grouped_frames.setdefault(sid, []).append(frame)

    for scene in scenes:
        sid = scene["scene_id"]
        scene["frames"] = grouped_frames.get(sid, [])

    return {"video": video_name, "scenes": scenes}


def get_scenes_by_video_name(video_name: str, user_id: str):
    owned = scenes_col.find_one({"video_name": video_name, "user_id": user_id})
    if not owned:
        if scenes_col.find_one({"video_name": video_name}):
            raise HTTPException(status_code=403, detail="Accès interdit : vous n'êtes pas propriétaire de cette vidéo")
        raise HTTPException(status_code=404, detail="Aucune scène trouvée pour cette vidéo")
    scenes = scenes_col.find({"video_name": video_name, "user_id": user_id})
    return [clean_doc(s) for s in scenes]


def get_frames_by_video_name(video_name: str, user_id: str):
    owned = frames_col.find_one({"video_name": video_name, "user_id": user_id})
    if not owned:
        if frames_col.find_one({"video_name": video_name}):
            raise HTTPException(status_code=403, detail="Accès interdit : vous n'êtes pas propriétaire de cette vidéo")
        raise HTTPException(status_code=404, detail="Aucun frame trouvé pour cette vidéo")
    frames = frames_col.find({"video_name": video_name, "user_id": user_id})
    return [clean_doc(f) for f in frames]


def delete_video_data(video_name: str, user_id: str):
    if not scenes_col.find_one({"video_name": video_name, "user_id": user_id}):
        if scenes_col.find_one({"video_name": video_name}):
            raise HTTPException(status_code=403, detail="Suppression interdite : vous n'êtes pas propriétaire de cette vidéo")
        raise HTTPException(status_code=404, detail="Suppression impossible : vidéo introuvable")

    scenes_col.delete_many({"video_name": video_name, "user_id": user_id})
    frames_col.delete_many({"video_name": video_name, "user_id": user_id})
    video_path = os.path.join("videos", video_name)
    if os.path.exists(video_path):
        os.remove(video_path)
    frame_dir = os.path.join("static/frames", video_name)
    if os.path.isdir(frame_dir):
        for filename in os.listdir(frame_dir):
            os.remove(os.path.join(frame_dir, filename))
        os.rmdir(frame_dir)
    return {"message": "Vidéo et données associées supprimées avec succès."}
