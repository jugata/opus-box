from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.composer import Composer

router = APIRouter(prefix="/composers", tags=["composers"])

@router.get("/")
def get_composers(db: Session = Depends(get_db)):
    return db.query(Composer).all()

@router.get("/{composer_id}")
def get_composer(composer_id: int, db: Session = Depends(get_db)):
    composer = db.query(Composer).filter(Composer.id == composer_id).first()
    if not composer:
        raise HTTPException(status_code=404, detail="Composer not found")
    return composer
