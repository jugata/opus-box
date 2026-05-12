from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.orchestra import Orchestra
from app.schemas.orchestra import OrchestraCreate, OrchestraResponse
from typing import List

router = APIRouter(prefix="/orchestras", tags=["orchestras"])

@router.get("/", response_model=List[OrchestraResponse])
def get_orchestras(db: Session = Depends(get_db)):
    return db.query(Orchestra).all()

@router.get("/{orchestra_id}", response_model=OrchestraResponse)
def get_orchestra(orchestra_id: int, db: Session = Depends(get_db)):
    orchestra = db.query(Orchestra).filter(Orchestra.id == orchestra_id).first()
    if not orchestra:
        raise HTTPException(status_code=404, detail="Orchestra not found")
    return orchestra

@router.post("/", response_model=OrchestraResponse)
def create_orchestra(orchestra: OrchestraCreate, db: Session = Depends(get_db)):
    db_orchestra = Orchestra(**orchestra.model_dump())
    db.add(db_orchestra)
    db.commit()
    db.refresh(db_orchestra)
    return db_orchestra
