from model import User, UserImage
import os
import cv2
import torch
import numpy as np
from facenet_pytorch import InceptionResnetV1, MTCNN
from scipy.spatial.distance import cosine

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(image_size=160, margin=0, min_face_size=40, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

def get_embedding(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return None
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    face = mtcnn(img_rgb)
    if face is not None:
        face = face.unsqueeze(0).to(device)
        with torch.no_grad():
            embedding = resnet(face).cpu().numpy()[0]
        return embedding
    return None

def recognize_user(input_image_path, db, threshold=0.4):
    users = db.query(User).all()
    best_match = None
    lowest_distance = float("inf")

    input_embedding = get_embedding(input_image_path)
    if input_embedding is None:
        print("No face detected in input image.")
        return None, None, 0.0

    for user in users:
        ref_images = db.query(UserImage).filter(UserImage.user_id == user.id).all()

        for ref in ref_images:
            ref_image_path = ref.image_path
            if not os.path.exists(ref_image_path):
                continue

            ref_embedding = get_embedding(ref_image_path)
            if ref_embedding is None:
                continue

            distance = cosine(input_embedding, ref_embedding)
            if distance < lowest_distance:
                best_match = user
                lowest_distance = distance

    if best_match and lowest_distance < threshold:
        recognized_user = best_match.name
        confidence = float((1 - lowest_distance)*100)  # simple inverse
        return recognized_user, confidence
    else:
        return None, 0.0
