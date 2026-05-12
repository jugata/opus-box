from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.work import Work
from app.schemas.work import WorkCreate, WorkResponse
from typing import List, Optional

router = APIRouter(prefix="/works", tags=["works"])

@router.get("/", response_model=List[WorkResponse])
def get_works(composer_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Work)
    if composer_id:
        query = query.filter(Work.composer_id == composer_id)
    return query.all()

@router.get("/{work_id}", response_model=WorkResponse)
def get_work(work_id: int, db: Session = Depends(get_db)):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    return work

@router.post("/", response_model=WorkResponse)
def create_work(work: WorkCreate, db: Session = Depends(get_db)):
    db_work = Work(**work.model_dump())
    db.add(db_work)
    db.commit()
    db.refresh(db_work)
    return db_work
