from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.conductor import Conductor
from app.schemas.conductor import ConductorCreate, ConductorResponse
from typing import List

router = APIRouter(prefix="/conductors", tags=["conductors"])

@router.get("/", response_model=List[ConductorResponse])
def get_conductors(db: Session = Depends(get_db)):
    return db.query(Conductor).all()

@router.get("/{conductor_id}", response_model=ConductorResponse)
def get_conductor(conductor_id: int, db: Session = Depends(get_db)):
    conductor = db.query(Conductor).filter(Conductor.id == conductor_id).first()
    if not conductor:
        raise HTTPException(status_code=404, detail="Conductor not found")
    return conductor

@router.post("/", response_model=ConductorResponse)
def create_conductor(conductor: ConductorCreate, db: Session = Depends(get_db)):
    db_conductor = Conductor(**conductor.model_dump())
    db.add(db_conductor)
    db.commit()
    db.refresh(db_conductor)
    return db_conductor
