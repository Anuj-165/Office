from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse

# JWT handling
from jose import JWTError, jwt

# Password hashing




# Pydantic models
from pydantic import BaseModel
from datetime import date

# Typing (optional but common)
from typing import Optional

# Database session
from sqlalchemy.orm import Session

from model import Goal,Attendance,Growth,SkillStatusEnum,Skills

from database import get_db 

from auth import verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
router = APIRouter()
security = HTTPBearer()

class CreateSkill(BaseModel):
    name:str
    description:Optional[str] = None

class UpdateSkill(BaseModel):
    name:str
    status:SkillStatusEnum





def calculate_percentage_attendance (user_id,db:Session):
    
    total_present = db.query(Attendance).filter(Attendance.status == "Present",Attendance.user_id == user_id).count()
    
    working_days = 280
    
    percent_rate =float(( total_present/working_days)*100)
    
    print(percent_rate)
    return percent_rate

def calculate_goal_success(user_id,db:Session):
     
    total_succ = db.query(Goal).filter(Goal.status == "Complete",Goal.user_id == user_id).count()
    
    whole_goals = db.query(Goal).filter(Goal.name != None).count()
    
    percent_goal_rate = float((total_succ/whole_goals)*100)
    
    print(percent_goal_rate)
    return percent_goal_rate
    
@router.get("/growth-per")
def show_growth(payload:dict = Depends(verify_token),db:Session=Depends(get_db)):
    user_id = payload["id"]
    
    growth = float((0.7*calculate_percentage_attendance(user_id,db)+ (0.3*calculate_goal_success(user_id,db))))
    print(growth)
    
    growth_data = Growth(
        user_id = user_id,
        growth_per = growth
    )
    
    db.add(growth_data)
    db.commit()
    db.refresh(growth_data)
    return {
        "growth_percentage": growth_data.growth_per,
        "message": "Growth data added successfully",
        "user_id": user_id
    }
    
@router.post("/skills")
def add_skill(request:CreateSkill,payload:dict = Depends(verify_token),db:Session=Depends(get_db)):
    user_id = payload["id"]
    
    existing_skill = db.query(Skills).filter(Skills.user_id == user_id,Skills.name == request.name).first()
    
    if existing_skill:
        raise HTTPException(status_code = 409,detail = "Skill already exists")
    
    new_skill = Skills(
        name = request.name,
        description = request.description,
        user_id  = user_id,
        status = SkillStatusEnum.pending
    )
    
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return {"message": "Skill added successfully"}


@router.put("/update-skill")
def update_skill(request:UpdateSkill,payload:dict=Depends(verify_token),db:Session = Depends(get_db)):
    user_id = payload["id"]
    
    existing_skill = db.query(Skills).filter(Skills.user_id == user_id,Skills.name == request.name).first()
    
    if not  existing_skill:
        raise HTTPException(status_code = 404,detail ="Skill not found")
    
    existing_skill.status = request.status
    db.commit()
    db.refresh(existing_skill)  
    return {"message": "Skill status updated successfully"}

@router.get("/active-skills")
def get_active_skills(payload:dict=Depends(verify_token),db:Session=Depends(get_db)):
    user_id = payload["id"]
    
    active_skills = db.query(Skills).filter(Skills.user_id == user_id,Skills.status != SkillStatusEnum.completed).all()
    if not active_skills:
        return []
    return [
        {
            "skill Name": skill.name,
            "skill Description": skill.description,
            "skill Status": skill.status,
            "skill ID":skill.id
        }
        for skill in active_skills
    ]

@router.get("/skill-summary")
def skill_summary(payload:dict=Depends(verify_token),db:Session=Depends(get_db)):
    user_id = payload["id"]
    
    total_skills = db.query(Skills).filter(Skills.user_id == user_id).count()
    
    completed_skills = db.query(Skills).filter(Skills.user_id == user_id,Skills.status == SkillStatusEnum.completed).count()
    
    pending_skills = db.query(Skills).filter(Skills.user_id == user_id,Skills.status == SkillStatusEnum.pending).count()
    
    return {
        "Total Skills": total_skills,
        "Completed Skills": completed_skills,
        "Pending Skills": pending_skills
    }