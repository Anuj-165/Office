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

from model import Goal

from database import get_db 
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth import verify_token

router = APIRouter()
security = HTTPBearer()


class CreateGoal(BaseModel):
   name:str
   duration : int 
   end_date:date
   
class UpdateGoal(BaseModel):
    name:str
    status:str
    

@router.post('/goals')
def create_goal(request:CreateGoal,payload:dict = Depends(verify_token),db:Session=Depends(get_db)):
    user_id = payload.get("id")
    existing_goal = db.query(Goal).filter(Goal.name == request.name, Goal.user_id == payload["id"]).first()
    
    if existing_goal:
        raise HTTPException(status_code=409,detail="Goal already exists")
    
    new_goal = Goal(
        name = request.name,
        duration = request.duration,
        user_id = user_id,
        end_date = request.end_date
    )
    
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    
    return JSONResponse(status_code = 200,content = {"Message":"Goal created"})


@router.put("/update-goal")

def update_goal(request:UpdateGoal,payload:dict=Depends(verify_token),db:Session=Depends(get_db)):
    user_id = payload.get("id")
    
    existing_goal = db.query(Goal).filter(Goal.name == request.name,Goal.user_id == user_id).first()
    
    if not existing_goal:
        raise HTTPException(status_code=404,detail="Goal not found")
    
    existing_goal.status = request.status
    db.commit()
    db.refresh(existing_goal)
    
    return JSONResponse(status_code = 200,content = {"Message":"Goal Completed"})

@router.get("/goal-summary")
def goal_summary(payload:dict=Depends(verify_token),db:Session=Depends(get_db)):
    user_id = payload.get("id")
    
    success_goals = db.query(Goal).filter(Goal.end_date == date.today(),Goal.status =="Complete",Goal.user_id == user_id).count()
    failed_goals = db.query(Goal).filter(Goal.end_date == date.today(),Goal.status =="Pending",Goal.user_id == user_id).count()
    
    return {
        "Completed Goals" : success_goals,
        "Failed Goals" : failed_goals
    }

@router.get("/active-goals")
def get_active_goals(payload:dict=Depends(verify_token),db:Session=Depends(get_db)):
    user_id = payload.get("id")
    active_goals = db.query(Goal).filter(Goal.end_date > date.today(),Goal.user_id == user_id).all()
    
    return active_goals
        