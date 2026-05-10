from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.composer import Composer
from app.schemas.composer import ComposerCreate, ComposerResponse
from typing import List

router = APIRouter(prefix="/composers", tags=["composers"])

@router.get("/", response_model=List[ComposerResponse])
def get_composers(db: Session = Depends(get_db)):
    return db.query(Composer).all()

@router.get("/{composer_id}", response_model=ComposerResponse)
def get_composer(composer_id: int, db: Session = Depends(get_db)):
    composer = db.query(Composer).filter(Composer.id == composer_id).first()
    if not composer:
        raise HTTPException(status_code=404, detail="Composer not found")
    return composer

@router.post("/", response_model=ComposerResponse)
def create_composer(composer: ComposerCreate, db: Session = Depends(get_db)):
    db_composer = Composer(**composer.model_dump())
    db.add(db_composer)
    db.commit()
    db.refresh(db_composer)
    return db_composer
