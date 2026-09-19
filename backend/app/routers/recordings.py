from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.recording import Recording
from app.schemas.recording import RecordingCreate, RecordingResponse
from typing import List, Optional

router = APIRouter(prefix="/recordings", tags=["recordings"])

@router.get("/", response_model=List[RecordingResponse])
def get_recordings(work_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Recording)
    if work_id:
        query = query.filter(Recording.work_id == work_id)
    return query.all()

@router.get("/{recording_id}", response_model=RecordingResponse)
def get_recording(recording_id: int, db: Session = Depends(get_db)):
    recording = db.query(Recording).filter(Recording.id == recording_id).first()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    return recording

@router.post("/", response_model=RecordingResponse)
def create_recording(recording: RecordingCreate, db: Session = Depends(get_db)):
    db_recording = Recording(**recording.model_dump())
    db.add(db_recording)
    db.commit()
    db.refresh(db_recording)
    return db_recording
