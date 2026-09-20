import musicbrainzngs
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.work import Work
from app.models.composer import Composer
from app.schemas.work import WorkCreate, WorkResponse, WorkCandidate, WorkSearchResult
from app.ingestion.musicbrainz import MusicBrainzIngester
from typing import List, Optional

router = APIRouter(prefix="/works", tags=["works"])

@router.get("/", response_model=List[WorkResponse])
def get_works(composer_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Work)
    if composer_id:
        query = query.filter(Work.composer_id == composer_id)
    return query.all()

@router.get("/search", response_model=WorkSearchResult)
def search_works(
    q: str = Query(..., min_length=1),
    composer_id: int = Query(...),
    db: Session = Depends(get_db),
):
    composer = db.query(Composer).filter(Composer.id == composer_id).first()
    if not composer or not composer.musicbrainz_id:
        raise HTTPException(status_code=404, detail="Composer not found")

    local = (
        db.query(Work)
        .filter(Work.composer_id == composer_id, Work.title.ilike(f"%{q}%"))
        .all()
    )
    known_mbids = {
        w.musicbrainz_id for w in db.query(Work.musicbrainz_id).filter(Work.composer_id == composer_id)
    }

    ingester = MusicBrainzIngester(db)
    candidates = [
        WorkCandidate(
            musicbrainz_id=work["id"],
            title=work["title"],
            disambiguation=work.get("disambiguation"),
        )
        for work in ingester.search_works(q, composer.musicbrainz_id)
        if work["id"] not in known_mbids
    ]

    return WorkSearchResult(local=local, candidates=candidates)

@router.post("/import/{musicbrainz_id}", response_model=WorkResponse)
def import_work(musicbrainz_id: str, composer_id: int = Query(...), db: Session = Depends(get_db)):
    composer = db.query(Composer).filter(Composer.id == composer_id).first()
    if not composer:
        raise HTTPException(status_code=404, detail="Composer not found")

    ingester = MusicBrainzIngester(db)
    try:
        work = ingester.ingest_work(composer, musicbrainz_id)
    except musicbrainzngs.ResponseError:
        raise HTTPException(status_code=404, detail="Work not found on MusicBrainz")
    ingester.ingest_recordings(work)
    return work

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
