from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import ForeignKey,Date,Time,Boolean,Float,Enum as SqlEnum
from sqlalchemy.orm import relationship
from enum import Enum
from datetime import datetime 

Base = declarative_base()

class AttendanceStatusEnum(str,Enum):
    present = "Present"
    absent = "Absent"
    pending = "Pending"


class RoleEnum(str, Enum):
    admin = "admin"
    employee = "employee"
    
class SkillStatusEnum(str, Enum):
    completed = "completed"
    pending = "pending"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer,primary_key = True,index=True)
    name = Column(String,nullable = False,unique = True)
    email = Column(String,nullable = False,unique = True)
    password = Column(String,nullable=False)
    role = Column(SqlEnum(RoleEnum), nullable=False)
    position = Column(String,nullable=False)
    age = Column(Integer,nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    company = relationship("Company", back_populates="users")
    
    
    goals = relationship("Goal",back_populates="user")
    attendance = relationship("Attendance",back_populates="user")
    images = relationship("UserImage",back_populates="user", cascade="all, delete-orphan")
    growth = relationship("Growth",back_populates="user")
    skills = relationship("Skills", back_populates="user", cascade="all, delete-orphan")
    
    
class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer,primary_key = True,index=True)
    name = Column(String,nullable = False)
    duration = Column(Integer,nullable = False)
    status = Column(String,default = "Pending")
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)   
    start_date = Column(Date, default=lambda: datetime.utcnow().date())
    end_date = Column(Date)

    
    user = relationship("User",back_populates="goals")
    
class Attendance(Base):
    
    __tablename__ = "attendance"
    
    id = Column(Integer,primary_key = True,index=True)
    date = Column(Date, default=lambda: datetime.utcnow().date())
    time = Column(Time, default=lambda: datetime.utcnow().time())
    image_path = Column(String)
    latitude = Column(Float,nullable=False)
    
    longitude = Column(Float,nullable=False)
    
    resolved_address = Column(String,nullable=False)
    
    radius_meter = Column(Float,default = 100)
    
    location_verified = Column(Boolean,default = False)
    face_verified = Column(Boolean,default = False)
    
    status = Column(String,default = "Pending")
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False) 
    confidence = Column(Float,default = 0.0)
    
    user = relationship("User", back_populates="attendance")  
    
class OfficeLocation(Base):
    __tablename__ = "office_location"
    id = Column(Integer,primary_key = True,index=True)
    
    latitude = Column(Float,nullable=False)
    
    longitude = Column(Float,nullable=False)
    
    resolved_address = Column(String,nullable=False)
    
    radius_meter = Column(Float,default = 100)
    company_id = Column(Integer, ForeignKey("companies.id")) 
    
    company = relationship("Company", back_populates="office_location")
    
class UserImage(Base):
    
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    
    image_path = Column(String,nullable = False)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False) 
    
    user = relationship("User", back_populates="images")  
    

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    email_domain = Column(String, nullable=False, unique=True)  # e.g., techcorp.com
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    office_location = relationship("OfficeLocation", back_populates="company", uselist=False)

    
class Growth(Base):
    __tablename__ = "growth"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    growth_per = Column(Float,default = 0.0)
    
    user = relationship("User", back_populates="growth")


class Skills(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(SqlEnum(SkillStatusEnum), default=SkillStatusEnum.pending)
    description = Column(String,nullable = True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    user = relationship("User", back_populates="skills")
    