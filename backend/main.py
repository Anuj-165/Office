from fastapi import FastAPI
from auth import router as auth_router 
from goal import router as goal_router
from dashboard import route as dashboard_route
from attendance import route as attendance_route
from growth import router as growth_router

from model import Base, Attendance, AttendanceStatusEnum, User
from database import engine, get_db

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import date


app = FastAPI()


app.include_router(auth_router, prefix="/auth")
app.include_router(goal_router, prefix="/goal")
app.include_router(dashboard_route, prefix="/dashboard")
app.include_router(attendance_route, prefix="/attendance")
app.include_router(growth_router, prefix="/growth")

Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Change to your production frontend domain when deployed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/home")
def greeting_home():
    return {"message": "Welcome HOME"}

@app.get("/")
def greeting_root():
    return {"message": "Welcome to our backend"}


scheduler = BackgroundScheduler()

def my_daily_function():
    db: Session = next(get_db())
    try:
        today = date.today()

        # Get all users
        all_users = db.query(User).all()

        for user in all_users:
            
            existing_attendance = db.query(Attendance).filter(
                Attendance.user_id == user.id,
                Attendance.date == today
            ).first()

            if not existing_attendance:
                
                new_attendance = Attendance(
                    user_id=user.id,
                    status=AttendanceStatusEnum.absent,
                    location_verified=False,
                    face_verified=False,
                    resolved_address="Not Marked",
                    image_path=None,
                    latitude=0.0,
                    longitude=0.0,
                    confidence=0.0,
                )
                db.add(new_attendance)

        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    if not scheduler.running:
        
        scheduler.add_job(my_daily_function, 'cron', hour=12, minute=0)
        scheduler.start()
