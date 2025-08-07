from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.orm import Session
from model import Attendance, OfficeLocation, User, AttendanceStatusEnum
from model_train.face_recog import recognize_user
from database import get_db
from auth import verify_token
from datetime import datetime
import shutil, os
from math import radians, cos, sin, sqrt, atan2
import requests
from datetime import date
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

route = APIRouter()
security = HTTPBearer()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Haversine formula to calculate distance between two lat/lng points
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth radius in meters
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# 🔁 Reverse Geocode using Nominatim
def get_address_from_coords(lat: float, lon: float) -> str:
    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {"lat": lat, "lon": lon, "format": "json"}
        headers = {"User-Agent": "attendance-app"}
        res = requests.get(url, params=params, headers=headers)
        res.raise_for_status()
        return res.json().get("display_name", "Unknown Location")
    except Exception as e:
        print(f"[Geocode error]: {e}")
        return "Unknown Location"

@route.post("/attendance")
async def mark_attendance(
    image: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token),
):
   
    filename = f"{datetime.utcnow().timestamp()}_{image.filename}"
    image_path = os.path.join(UPLOAD_DIR, filename)
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    
    recognized_user, confidence = recognize_user(image_path, db)
    if not recognized_user:
        raise HTTPException(status_code=400, detail="❌ Face not recognized")

    user = db.query(User).filter(User.name == recognized_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="❌ Recognized user not found")

    office = db.query(OfficeLocation).first()
    if not office:
        raise HTTPException(status_code=500, detail="❌ Office location not configured")

    
    distance = calculate_distance(latitude, longitude, office.latitude, office.longitude)
    location_verified = distance <= office.radius_meter
    face_verified = True

    
    resolved_address = get_address_from_coords(latitude, longitude)

    
    if face_verified and location_verified:
        status = AttendanceStatusEnum.present
    else:
        status = AttendanceStatusEnum.pending

    
    attendance = Attendance(
        image_path=image_path,
        latitude=latitude,
        longitude=longitude,
        resolved_address=resolved_address,
        radius_meter=office.radius_meter,
        location_verified=location_verified,
        face_verified=face_verified,
        status=status,
        user_id=user.id,
        confidence=confidence,
        date = date.today(),
        time=datetime.now().time()
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return {
        "message": "✅ Attendance marked",
        "user": recognized_user,
        "status": status,
        "distance_from_office_m": round(distance, 2),
        "confidence": round(confidence, 2),
        "location_verified": location_verified,
        "face_verified": face_verified,
        "address": resolved_address,
        "attendance_id": attendance.id,
        "Date": attendance.date,
        "Time": attendance.time
    
    }






