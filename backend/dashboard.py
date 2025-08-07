from fastapi import APIRouter, Depends, HTTPException, status


# JWT handling


# Password hashing
import os
from fastapi import UploadFile

from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from geopy.geocoders import Nominatim
from model import OfficeLocation
from database import get_db


# Pydantic models
from pydantic import BaseModel
from datetime import date

# Typing (optional but common)
from typing import Optional

# Database session
from sqlalchemy.orm import Session

from model import UserImage,User,Attendance,Goal

from database import get_db 

from auth import verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
route = APIRouter()
security = HTTPBearer()

class OfficeLocationSchema(BaseModel):
    latitude: float
    longitude: float
    radius_meter: float
    resolved_address: Optional[str] = None
    
class SearchUser(BaseModel):
    name:str

class UploadImage(BaseModel):
    image_path : str
    
  
@route.post('/upload-images')  
async def Upload_Images(
    files:list[UploadFile],
    db:Session= Depends(get_db),
    payload:dict=Depends(verify_token)
):
    if len(files)<3:
        raise HTTPException(status_code = 400,detail="Please Upload at least 3 images")
    
    user_id = payload["id"]
    save_dir = f"images/user_{user_id}/"
    os.makedirs(save_dir,exist_ok=True)
    
    for file in files :
        file_location = os.path.join(save_dir,file.filename)
        with open(file_location,"wb") as f:
            f.write(await file.read())
            
        db_image = UserImage(user_id=user_id, image_path=file_location)
        db.add(db_image)
    
    db.commit()
    return {"message": "Images uploaded successfully"}





@route.post("/set-office-location")
def set_office_location(
    request: OfficeLocationSchema,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token)
):
    if not payload or "id" not in payload:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    admin = db.query(User).filter(User.id == payload["id"], User.role == "admin").first()
    if admin is None:
        raise HTTPException(status_code=403, detail="Only admin can set office location")

    latitude = request.latitude
    longitude = request.longitude
    radius_meter = request.radius_meter

    
    geolocator = Nominatim(user_agent="attendance_app")
    try:
        location = geolocator.reverse(f"{latitude}, {longitude}", exactly_one=True)
        resolved_address = location.address if location else "Unknown"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reverse geocoding failed: {str(e)}")

    
    office = db.query(OfficeLocation).first()

    if office:
        
        office.latitude = latitude
        office.longitude = longitude
        office.radius_meter = radius_meter
        office.resolved_address = resolved_address
    else:
        
        office = OfficeLocation(
            latitude=latitude,
            longitude=longitude,
            radius_meter=radius_meter,
            resolved_address=resolved_address,
            company_id=admin.company_id
        )
        db.add(office)
    
    db.commit()
    db.refresh(office)

    return {
        "message": "Office location set successfully",
        "data": {
            "latitude": office.latitude,
            "longitude": office.longitude,
            "radius_meter": office.radius_meter,
            "resolved_address": office.resolved_address
        }
    }


@route.get("/attendance-stats",description="Get attendance record for the user")
def atttendance_record(payload:dict=Depends(verify_token),db:Session=Depends(get_db)):
    user_id = payload["id"]
    
    if not user_id:
        raise HTTPException(status_code = 401,detail="Unauthorized")
    
    Present_count = db.query(Attendance).filter(Attendance.user_id == user_id,Attendance.status == "Present").count()
    Absent_count = db.query(Attendance).filter(Attendance.user_id == user_id,Attendance.status == "Absent").count()
    Pending_count = db.query(Attendance).filter(Attendance.user_id == user_id,Attendance.status == "Pending").count()
    
    
    
    
    Total_count = Present_count+Absent_count
    if Total_count != 0:
        Present_rate = float((Present_count/Total_count)*100)
        if Present_rate == 0:
            Present_rate = 0
            
        Absent_rate = float((Absent_count/Total_count)*100)
        if Absent_rate == 0:
            Absent_rate =  0
    else:
        Present_rate = 0.0
        Absent_rate = 0.0      
    
    return{
        "Present":Present_count,
        "Absent":Absent_count,
        "Pending":Pending_count,
        "Total":Total_count,
        "Present Rate":Present_rate,
        "Absent Rate":Absent_rate 
    }
    
@route.get("/Goal-stats",description = "Get goal record for the user")

def goal_record(payload:dict=Depends(verify_token),db:Session=Depends(get_db)):
    user_id = payload["id"]
    
    if not user_id:
        raise HTTPException(status_code = 401,detail="Unauthorized")
    
    total_goals = db.query(Goal).filter(Goal.user_id == user_id).count()
    completed_goals = db.query(Goal).filter(Goal.user_id == user_id,Goal.status =="Complete").count()    
    pending_goals = db.query(Goal).filter(Goal.user_id == user_id,Goal.status == "Pending").count()
    
    return{
        "Total Goals": total_goals,
        "Completed Goals":completed_goals,
        "Pending Goals":pending_goals
    }
    
@route.get("/user-info",description = "Get user info")

def user_info (payload:dict=Depends(verify_token),db:Session=Depends(get_db)):
    user_id = payload["id"]
    
    if not user_id:
        raise HTTPException(status_code = 401,detail = "Unauthorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    
    return {
        "id":user.id,
        "name":user.name,
        "email":user.email,
        "role":user.role,
        "position":user.position,
        "age":user.age,
    }    
    
    
@route.post("/search-user",description = "Search user by name")
    
def search_user(request:SearchUser,db:Session = Depends(get_db),payload:dict = Depends(verify_token)):
    user_id = payload["id"]
    
    
    admin = db.query(User).filter(User.id == user_id,User.role == "admin").first()
    if not admin:
        raise HTTPException(status_code = 403,detail = "Only admins can search users")
    user_data = db.query(User).filter(User.name == request.name).first() 
    if not user_data:
        raise HTTPException(status_code=404,detail="User not found")
    
    return {
        "id":user_data.id,
        "name":user_data.name,
        "email":user_data.email,
        "role":user_data.role,
        "position":user_data.position,
        "age":user_data.age,
    }    
    
@route.post("/search-user-goals",description = "Search user goals by name")

def search_user_goals(request:SearchUser,db:Session = Depends(get_db),payload:dict = Depends(verify_token)):
    user_id = payload["id"]
    
    
    admin = db.query(User).filter(User.id == user_id,User.role == "admin").first()
    if not admin:
        raise HTTPException(status_code = 403,detail = "Only admins can search users")
    user = db.query(User).filter(User.name == request.name).first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    
    goals = db.query(Goal).filter(Goal.user_id == user.id).count()
    
    if goals ==0:
        return []
    
    goals_name = db.query(Goal).filter(Goal.user_id == user.id,Goal.name != None).all()
    success_goals = db.query(Goal).filter(Goal.user_id == user.id,Goal.status == "Complete").count()
    pending_goals = db.query(Goal).filter(Goal.user_id == user.id,Goal.status == "Pending").count()
    return{
        "Total Goals":goals,
        "Success Goals":success_goals,
        "Pending Goals":pending_goals,
        " Name" : [goal.name for goal in goals_name]
        
    }
    
@route.post("/search-user-attendance",description = "Search user attendance by name")
def search_user_attendance(request:SearchUser,db:Session=Depends(get_db),payload:dict=Depends(verify_token)):
    user_id = payload["id"]
    print("Incoming name:", request.name)

    
    
    admin = db.query(User).filter(User.id == user_id,User.role == "admin").first()
    if not admin:
        raise HTTPException(status_code = 403,detail = "Only admins can search users")
    user = db.query(User).filter(User.name == request.name).first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    
    attendance = db.query(Attendance).filter(Attendance.user_id == user.id).count()
    if  attendance ==0:
        return []
    
    present_count = db.query(Attendance).filter(Attendance.user_id == user.id,Attendance.status =="Present").count()
    Absent_count = db.query(Attendance).filter(Attendance.user_id == user.id,Attendance.status == "Absent").count()
    
    
    if attendance != 0:
        present_rate = float((present_count/attendance)*100)
        if present_rate == 0:
            present_rate = 0
            
        absent_rate = float((Absent_count/attendance)*100)
        if absent_rate == 0:
            absent_rate =  0
    else:
        present_rate = 0
        absent_rate = 0
    return{
        "Total Working Days":attendance,
        "Present Days": present_count,
        "Absent Days":Absent_count,
        "Present Rate": present_rate,
        "Absent Rate": absent_rate
    }
       
@route.post("/remove-user",description = "Remove user by name")
def remove_user(request:SearchUser,db:Session = Depends(get_db),payload:dict=Depends(verify_token)):
    user_id = payload["id"]
    
    
    admin = db.query(User).filter(User.id == user_id,User.role == "admin")
    if not admin:
        raise HTTPException(status_code = 403,detail = "Only admins can search users")
    user = db.query(User).filter(User.name == request.name).first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    remove_user = db.query(User).filter(User.id == user.id).first()
    if not remove_user:
        raise HTTPException(status_code=404,detail="User not found")
    db.delete(remove_user)
    db.commit()
    return {"message": "User removed successfully"}

@route.post("/remove-user-goals",description = "Remove user goals by name")    
def remove_user_goals(request:SearchUser,db:Session = Depends(get_db),payload:dict=Depends(verify_token)):
    user_id = payload["id"]
    
    
    admin = db.query(User).filter(User.id == user_id,User.role == "admin")
    if not admin:
        raise HTTPException(status_code = 403,detail = "Only admins can search users")
    user = db.query(User).filter(User.name == request.name).first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    remove_user_goals = db.query(Goal).filter(Goal.user_id == user.id).all()
    for goal in remove_user_goals:
        db.delete(goal)
    db.commit()
    return {"message": "User goals removed successfully"}

@route.post("/remove-user-attendance",description = "Remove user attendance by name")

def remove_user_attendance(request:SearchUser,db:Session = Depends(get_db),payload:dict=Depends(verify_token)):
    user_id = payload["id"]
    
    
    admin = db.query(User).filter(User.id == user_id,User.role == "admin")
    if not admin:
        raise HTTPException(status_code = 403,detail = "Only admins can search users")
    user = db.query(User).filter(User.name == request.name).first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    remove_user_attendance = db.query(Attendance).filter(Attendance.user_id == user.id).all()
    for attendance in remove_user_attendance:
        db.delete(attendance)
    db.commit()
    
    
    return {"message": "User attendance removed successfully"}

@route.post("/remove-user-images",description = "Remove user images by name")

def remove_user_images(request:SearchUser,db:Session = Depends(get_db),payload:dict=Depends(verify_token)):
    user_id = payload["id"]
    
    
    admin = db.query(User).filter(User.id == user_id,User.role == "admin")
    if not admin:
        raise HTTPException(status_code = 403,detail = "Only admins can search users")
    user = db.query(User).filter(User.name == request.name).first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    remove_user_images = db.query(UserImage).filter(UserImage.user_id == user.id).all()
    
    for img in remove_user_images:
        db.delete(img)
        if os.path.exists(img.image_path):
            os.remove(img.image_path)
    db.commit()
    return {"message": "User images removed successfully"}



@route.get("/attendance-record",description = "Get attendance record for the user")

def attendance_record(db:Session = Depends(get_db),payload:dict = Depends(verify_token)):
    user_id = payload["id"]
    
    if not user_id:
        raise HTTPException(status_code=401,detail = "Unauthorized")
    
    attendance_record = db.query(Attendance).filter(Attendance.user_id == user_id).all()
    
    return {
        "attendance_record": [
            {
                "id": record.id,
                "date": record.date,
                "time": record.time,
                "status": record.status,
                "latitude": record.latitude,
                "longitude": record.longitude,
                "resolved_address": record.resolved_address,
                
            } for record in attendance_record
        ]
    }