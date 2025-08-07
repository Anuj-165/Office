from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# PostgreSQL URL format: postgresql://user:password@host/database
SQLALCHEMY_DATABASE_URL = "postgresql://company:Hx82SL6jQ7zGs5LZSJZhcDj8RH0E0axG@dpg-d2abvbuuk2gs73amb9c0-a/office_whec"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()