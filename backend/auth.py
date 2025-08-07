from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import FastAPI

# JWT handling
from jose import JWTError, jwt
from jwt import ExpiredSignatureError, InvalidTokenError,PyJWTError


# Password hashing
from passlib.context import CryptContext

# Pydantic models
from pydantic import BaseModel,EmailStr

# Typing (optional but common)
from typing import Optional

# Database session
from sqlalchemy.orm import Session

from model import User

from database import get_db 

from datetime import datetime, timedelta
import secrets
from model import Company, User, RoleEnum



SECRET_KEY = "HU_BEB38NpeSzQZHWlrvqPCuMJAlgRwGOY4Hrmb_92w"
ALGORITHM = "HS256"


router = APIRouter()
security = HTTPBearer()

class Register(BaseModel):
    email : EmailStr
    password: str
    name : str
    role : str
    position : str
    age : int 
    


class Login(BaseModel):
    email : EmailStr
    password : str
    
class CompanyRegistration(BaseModel):
    company_name: str
    email_domain: str  # Only domain, like "techcorp.com"
    admin_name: str
    admin_email: EmailStr
    admin_password: str
    position: str
    age: int
    
def create_token(data:dict,experies_delta:timedelta = timedelta(hours = 1)):
    to_encode = data.copy()
    expire = datetime.utcnow()+experies_delta
    to_encode.update({"exp":expire})    
    token = jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)
    return token
    
    

from fastapi import Request

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        # This catches expired tokens and invalid signatures
        print(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )



        
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)




@router.post('/signup-user')
def sign_up(request: Register, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists with this email")

    # Match domain to company
    email_domain = request.email.split('@')[-1]
    company = db.query(Company).filter(Company.email_domain == email_domain).first()
    if not company:
        raise HTTPException(status_code=404, detail="No company found with this email domain")

    # Hash the password
    hashed_password = hash_password(request.password)

    # Create new user
    new_user = User(
        name=request.name,
        email=request.email,
        password=hashed_password,
        role=request.role,
        position=request.position,
        age=request.age,
        company_id=company.id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Token creation like in login
    expiration = datetime.utcnow() + timedelta(minutes=60)
    token_data = {
        "id": new_user.id,
        "email": new_user.email,
        "sub": new_user.email,
        "exp": expiration
    }

    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "role": new_user.role,
            "name": new_user.name,
            "position": new_user.position,
            "age": new_user.age
        },
        "company": {
            "id": company.id,
            "name": company.name,
            "email_domain": company.email_domain
        }
    }

@router.post("/login")
def login(request:Login, db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.email == request.email).first()

    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    expiration = datetime.utcnow() + timedelta(minutes=60)
    token_data = {
        "id": user.id,
        "email": user.email,
        "sub": user.email,
        "exp": expiration
    }

    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.name
        }
    }





pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    return pwd_context.hash(password)

@router.post("/register-company")
def register_company(data: CompanyRegistration, db: Session = Depends(get_db)):
    
    existing_domain = db.query(Company).filter_by(email_domain=data.email_domain).first()
    if existing_domain:
        raise HTTPException(status_code=409, detail="Email domain already registered")

    
    new_company = Company(
        name=data.company_name,
        email_domain=data.email_domain,
        created_at=datetime.utcnow()
    )
    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    
    if not data.admin_email.endswith("@" + data.email_domain):
        raise HTTPException(status_code=400, detail="Admin email domain must match company domain")

    
    new_admin = User(
        name=data.admin_name,
        email=data.admin_email,
        password=hash_password(data.admin_password),
        role=RoleEnum.admin,
        position=data.position,
        age=data.age,
        company_id=new_company.id
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {"message": "Company and admin registered successfully", "company_id": new_company.id}
